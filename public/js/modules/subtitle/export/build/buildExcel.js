import { zipStore } from './zipStore.js';

const SMI_HEADER = ['INDEX', 'START', 'START TIME', 'TEXT', 'MEMO'];
const SRT_HEADER = ['INDEX', 'START', 'START TIME', 'END', 'END TIME', 'TEXT', 'MEMO'];
const EXCEL_CELL_MAX = 32767;
const INVALID_XML_CHARS = /[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g;

const escapeXml = (value) =>
	String(value)
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;');

const sanitizeCellText = (value) => {
	const text = String(value ?? '').replace(INVALID_XML_CHARS, '');
	return text.length > EXCEL_CELL_MAX ? text.slice(0, EXCEL_CELL_MAX) : text;
};

const toExcelTime = (timecode) =>
	String(timecode ?? '').slice(0, -1).replace(',', ':');

const xlsCell = (rowIndex, colIndex) => {
	let col = '';
	let n = colIndex;
	while (n >= 0) {
		col = String.fromCharCode((n % 26) + 65) + col;
		n = Math.floor(n / 26) - 1;
	}
	return `${col}${rowIndex + 1}`;
};

const isNumericCell = (value) =>
	typeof value === 'number' && Number.isFinite(value);

const needsPreserveSpace = (text) =>
	text !== text.trim() || text.includes('\n') || text.includes('\t');

const buildCellXml = (rowIndex, colIndex, value) => {
	const ref = xlsCell(rowIndex, colIndex);
	if (value == null || value === '') return `<c r="${ref}"/>`;
	if (isNumericCell(value)) return `<c r="${ref}" t="n"><v>${value}</v></c>`;

	const text = sanitizeCellText(value);
	const space = needsPreserveSpace(text) ? ' xml:space="preserve"' : '';
	return `<c r="${ref}" t="inlineStr"><is><t${space}>${escapeXml(text)}</t></is></c>`;
};

const buildRowXml = (row, rowIndex) => {
	const cells = row.map((value, colIndex) => buildCellXml(rowIndex, colIndex, value)).join('');
	return `<row r="${rowIndex + 1}">${cells}</row>`;
};

const buildExcelRows = (data, format) => {
	const header = format === 'srt' ? SRT_HEADER : SMI_HEADER;
	const rows = data.map((timeline, index) => {
		const startTime = toExcelTime(timeline.starttime);
		if (format === 'srt') {
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

const buildSheetXml = (rows) => {
	const lastCol = xlsCell(0, Math.max(rows[0]?.length ?? 1, 1) - 1).replace(/\d+$/, '');
	const dimension = `A1:${lastCol}${rows.length || 1}`;
	const sheetData = rows.map((row, rowIndex) => buildRowXml(row, rowIndex)).join('');
	return (
		'<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
		+ '<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">'
		+ `<dimension ref="${dimension}"/>`
		+ `<sheetData>${sheetData}</sheetData>`
		+ '</worksheet>'
	);
};

const CONTENT_TYPES_XML = (
	'<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
	+ '<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">'
	+ '<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>'
	+ '<Default Extension="xml" ContentType="application/xml"/>'
	+ '<Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>'
	+ '<Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>'
	+ '<Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>'
	+ '</Types>'
);

const RELS_XML = (
	'<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
	+ '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">'
	+ '<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>'
	+ '</Relationships>'
);

const WORKBOOK_XML = (
	'<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
	+ '<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">'
	+ '<sheets><sheet name="Sheet1" sheetId="1" r:id="rId1"/></sheets>'
	+ '</workbook>'
);

const WORKBOOK_RELS_XML = (
	'<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
	+ '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">'
	+ '<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/>'
	+ '<Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>'
	+ '</Relationships>'
);

const STYLES_XML = (
	'<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
	+ '<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">'
	+ '<fonts count="1"><font><sz val="11"/><name val="Calibri"/></font></fonts>'
	+ '<fills count="2"><fill><patternFill patternType="none"/></fill><fill><patternFill patternType="gray125"/></fill></fills>'
	+ '<borders count="1"><border/></borders>'
	+ '<cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs>'
	+ '<cellXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/></cellXfs>'
	+ '</styleSheet>'
);

/**
 * 시트 타임라인을 SMI/SRT 열 구성의 xlsx 바이트로 만든다.
 *
 * @param {{ form: HTMLFormElement, data: object[] }} options
 * @returns {Uint8Array}
 */
const buildExcel = ({ form, data }) => {
	const format = form.querySelector('.excel-format')?.value === 'srt' ? 'srt' : 'smi';
	const rows = buildExcelRows(data ?? [], format);

	return zipStore([
		{ name: '[Content_Types].xml', content: CONTENT_TYPES_XML },
		{ name: '_rels/.rels', content: RELS_XML },
		{ name: 'xl/workbook.xml', content: WORKBOOK_XML },
		{ name: 'xl/_rels/workbook.xml.rels', content: WORKBOOK_RELS_XML },
		{ name: 'xl/styles.xml', content: STYLES_XML },
		{ name: 'xl/worksheets/sheet1.xml', content: buildSheetXml(rows) },
	]);
};

export { buildExcel };
