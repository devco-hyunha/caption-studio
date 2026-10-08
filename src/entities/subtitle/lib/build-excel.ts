import { formatExportData } from './format-export-data';
import { zipStore } from './zip-store';
import type { SubtitleFormat, SubtitleTimeline } from '../types';

const SMI_HEADER = ['INDEX', 'START', 'START TIME', 'TEXT', 'MEMO'];
const SRT_HEADER = [
	'INDEX',
	'START',
	'START TIME',
	'END',
	'END TIME',
	'TEXT',
	'MEMO',
];
const EXCEL_CELL_MAX = 32_767;
const EXCEL_SHEET_NAME_MAX = 31;

/** XML 1.0 금지 제어문자 (TAB/LF/CR 제외) */
const isInvalidXmlCharCode = (code: number) =>
	(code >= 0x00 && code <= 0x08) ||
	code === 0x0b ||
	code === 0x0c ||
	(code >= 0x0e && code <= 0x1f);

const escapeXml = (value: string) =>
	String(value)
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;');

const sanitizeCellText = (value: unknown) => {
	const raw = String(value ?? '');
	let text = '';
	for (let i = 0; i < raw.length; i += 1) {
		const code = raw.charCodeAt(i);
		if (!isInvalidXmlCharCode(code)) text += raw[i];
	}
	return text.length > EXCEL_CELL_MAX ? text.slice(0, EXCEL_CELL_MAX) : text;
};

const toExcelTime = (timecode: string | undefined) =>
	String(timecode ?? '')
		.slice(0, -1)
		.replace(',', ':');

const xlsCell = (rowIndex: number, colIndex: number) => {
	let col = '';
	let n = colIndex;
	while (n >= 0) {
		col = String.fromCharCode((n % 26) + 65) + col;
		n = Math.floor(n / 26) - 1;
	}
	return `${col}${rowIndex + 1}`;
};

const isNumericCell = (value: unknown): value is number =>
	typeof value === 'number' && Number.isFinite(value);

const needsPreserveSpace = (text: string) =>
	text !== text.trim() || text.includes('\n') || text.includes('\t');

const buildCellXml = (rowIndex: number, colIndex: number, value: unknown) => {
	const ref = xlsCell(rowIndex, colIndex);
	if (value == null || value === '') return `<c r="${ref}"/>`;
	if (isNumericCell(value)) return `<c r="${ref}" t="n"><v>${value}</v></c>`;

	const text = sanitizeCellText(value);
	const space = needsPreserveSpace(text) ? ' xml:space="preserve"' : '';
	return `<c r="${ref}" t="inlineStr"><is><t${space}>${escapeXml(text)}</t></is></c>`;
};

const buildRowXml = (row: unknown[], rowIndex: number) => {
	const cells = row
		.map((value, colIndex) => buildCellXml(rowIndex, colIndex, value))
		.join('');
	return `<row r="${rowIndex + 1}">${cells}</row>`;
};

const buildExcelRows = (
	data: readonly SubtitleTimeline[],
	columnFormat: SubtitleFormat,
) => {
	const header = columnFormat === 'srt' ? SRT_HEADER : SMI_HEADER;
	const rows = data.map((timeline, index) => {
		const startTime = toExcelTime(timeline.starttime);
		if (columnFormat === 'srt') {
			return [
				index + 1,
				timeline.start,
				startTime,
				timeline.end,
				toExcelTime(timeline.endtime),
				timeline.text,
				timeline.memo,
			];
		}
		return [
			index + 1,
			timeline.start,
			startTime,
			timeline.text,
			timeline.memo,
		];
	});
	return [header, ...rows];
};

const buildSheetXml = (rows: unknown[][]) => {
	const lastCol = xlsCell(0, Math.max(rows[0]?.length ?? 1, 1) - 1).replace(
		/\d+$/,
		'',
	);
	const dimension = `A1:${lastCol}${rows.length || 1}`;
	const sheetData = rows
		.map((row, rowIndex) => buildRowXml(row, rowIndex))
		.join('');
	return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><dimension ref="${dimension}"/><sheetData>${sheetData}</sheetData></worksheet>`;
};

const sanitizeSheetTabName = (name: string, index: number) => {
	const trimmed = String(name ?? '').trim() || `Sheet${index + 1}`;
	const safe = trimmed
		.replace(/[:\\/?*[\]]/g, '_')
		.slice(0, EXCEL_SHEET_NAME_MAX);
	return safe || `Sheet${index + 1}`;
};

const uniqueSheetNames = (names: string[]) => {
	const used = new Map<string, number>();
	return names.map((raw) => {
		const base = raw;
		const count = used.get(base) ?? 0;
		used.set(base, count + 1);
		if (count === 0) return base;
		const suffix = ` (${count + 1})`;
		const maxBase = EXCEL_SHEET_NAME_MAX - suffix.length;
		return `${base.slice(0, Math.max(1, maxBase))}${suffix}`;
	});
};

const STYLES_XML =
	'<?xml version="1.0" encoding="UTF-8" standalone="yes"?><styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><fonts count="1"><font><sz val="11"/><name val="Calibri"/></font></fonts><fills count="2"><fill><patternFill patternType="none"/></fill><fill><patternFill patternType="gray125"/></fill></fills><borders count="1"><border/></borders><cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs><cellXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/></cellXfs></styleSheet>';

const RELS_XML =
	'<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>';

interface ExcelWorkbookTab {
	name: string;
	timelines: readonly SubtitleTimeline[];
}

interface BuildExcelOptions {
	sheetFormat: SubtitleFormat;
	columnFormat: SubtitleFormat;
	tabs: readonly ExcelWorkbookTab[];
}

/** 자막 탭마다 xlsx 워크시트 1장 */
const buildExcel = ({
	sheetFormat,
	columnFormat,
	tabs,
}: BuildExcelOptions): Uint8Array => {
	const sheetCount = Math.max(tabs.length, 1);
	const tabNames = uniqueSheetNames(
		tabs.map((tab, index) => sanitizeSheetTabName(tab.name, index)),
	);

	const worksheetParts = tabNames.map((tabName, index) => {
		const tab = tabs[index];
		const timelines = tab?.timelines ?? [];
		const exportData = formatExportData({
			exportFormat: columnFormat,
			sheetFormat,
			sheetData: timelines,
		});
		const rows = buildExcelRows(exportData, columnFormat);
		return {
			partName: `/xl/worksheets/sheet${index + 1}.xml`,
			fileName: `xl/worksheets/sheet${index + 1}.xml`,
			tabName,
			xml: buildSheetXml(rows),
		};
	});

	const contentTypeOverrides = worksheetParts
		.map(
			(part) =>
				`<Override PartName="${part.partName}" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>`,
		)
		.join('');

	const contentTypesXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>${contentTypeOverrides}<Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/></Types>`;

	const workbookSheetsXml = worksheetParts
		.map(
			(part, index) =>
				`<sheet name="${escapeXml(part.tabName)}" sheetId="${index + 1}" r:id="rId${index + 1}"/>`,
		)
		.join('');

	const workbookXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets>${workbookSheetsXml}</sheets></workbook>`;

	const worksheetRels = worksheetParts
		.map(
			(_part, index) =>
				`<Relationship Id="rId${index + 1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet${index + 1}.xml"/>`,
		)
		.join('');
	const stylesRel = `<Relationship Id="rId${sheetCount + 1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>`;
	const workbookRels = `${worksheetRels}${stylesRel}`;

	const workbookRelsXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">${workbookRels}</Relationships>`;

	const zipEntries = [
		{ name: '[Content_Types].xml', content: contentTypesXml },
		{ name: '_rels/.rels', content: RELS_XML },
		{ name: 'xl/workbook.xml', content: workbookXml },
		{ name: 'xl/_rels/workbook.xml.rels', content: workbookRelsXml },
		{ name: 'xl/styles.xml', content: STYLES_XML },
		...worksheetParts.map((part) => ({
			name: part.fileName,
			content: part.xml,
		})),
	];

	return zipStore(zipEntries);
};

export { buildExcel, buildExcelRows, sanitizeSheetTabName };
export type { BuildExcelOptions, ExcelWorkbookTab };
