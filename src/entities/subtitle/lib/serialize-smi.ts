import type { SerializeSmiOptions, SubtitleTimeline } from '../types';

const SMI_ENTITY_REPLACEMENTS: readonly [string, string][] = [
	['&amp;', '&'],
	['&lt;', '<'],
	['&lt', '<'],
	['&gt;', '>'],
	['&gt', '>'],
];

const restoreSmiEntities = (text: string) =>
	SMI_ENTITY_REPLACEMENTS.reduce(
		(acc, [from, to]) => acc.split(from).join(to),
		text,
	);

const DEFAULT_SMI_CLASS_KEY = 'KRCC';
const DEFAULT_SMI_CLASS_STYLE =
	'Name:Korean; lang:ko-KR; SAMIType:CC;';

/** SMI 직렬화 (옵션으로 Class/서명 등) */
const serializeSmi = (
	data: readonly SubtitleTimeline[],
	options: SerializeSmiOptions = {},
): string => {
	const classKey = options.classKey ?? DEFAULT_SMI_CLASS_KEY;
	const classStyle = options.classStyle ?? DEFAULT_SMI_CLASS_STYLE;
	const signatureRaw = options.signature ?? '';
	const signature = signatureRaw ? `<!--\r\n${signatureRaw}\r\n-->\r\n` : '';
	const title =
		options.title ?? 'Caption Studio - (c)2017 DEVCO Studio';

	const captionBody = data
		.map((timeline) => {
			let text = timeline.text;
			if (text == null || text === '') {
				text = '&nbsp;';
			} else {
				text = restoreSmiEntities(String(text));
			}
			return `<SYNC Start=${timeline.start}><P Class=${classKey}>${text}</P></SYNC>\r\n`;
		})
		.join('');

	return `<SAMI>\r\n<HEAD>\r\n<Title>${title}</Title>\r\n<SAMIParam>\r\n\tMetrics {time:ms;}\r\n\tSpec {MSFT:1.0;}\r\n</SAMIParam>\r\n<STYLE TYPE="text/css">\r\n\tp {margin-left:8pt; margin-right:8pt; margin-bottom:2pt; margin-top:2pt;text-align:center;font-size:20pt; font-family:arial, sans-serif;font-weight:normal; color:White;}\r\n\t.${classKey} {${classStyle}}\r\n</STYLE>\r\n</HEAD>\r\n${signature}\r\n<BODY>\r\n${captionBody}\r\n</BODY>\r\n</SAMI>`;
};

export { DEFAULT_SMI_CLASS_KEY, DEFAULT_SMI_CLASS_STYLE, serializeSmi };
