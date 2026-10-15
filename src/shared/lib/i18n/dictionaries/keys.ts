import type { SheetColumnId } from '@/shared/types/sheet-column';
import type { SubtitleFormat } from '@/shared/types/subtitle-format';

/** 시트 열 헤더 키 — starttime은 포맷별, endtime은 srt 전용. `/` `set.js` `t(`${name}-${format}`)` parity */
const sheetColumnKey = (id: SheetColumnId, format: SubtitleFormat): string => {
  if (id === 'starttime') return `sheet.col.starttime.${format}`;
  if (id === 'endtime') return 'sheet.col.endtime.srt';
  return `sheet.col.${id}`;
};

/** 신규 FE 라벨 기준 사전 키 정본 — 레거시 `kr.js` 키 체계와 무관. 3개 사전은 이 키를 구현한다. */
const DICTIONARY_KEYS = [
  // sheet — 열 헤더 라벨 (포맷별)
  'sheet.col.index',
  'sheet.col.starttime.smi',
  'sheet.col.starttime.srt',
  'sheet.col.endtime.srt',
  'sheet.col.dur',
  'sheet.col.text',
  'sheet.col.memo',
  // sheet — 탭·푸터·패널
  'sheet.tab.add',
  'sheet.tab.delete',
  'sheet.tab.copy',
  'sheet.tab.rename',
  'sheet.tab.renameAria',
  'sheet.tab.menuAria',
  'sheet.tab.menuSuffix',
  'sheet.tabsAria',
  'sheet.panelAria',
  // toolbar — 시트 상단 버튼
  'toolbar.multiple',
  'toolbar.insert',
  'toolbar.remove',
  'toolbar.undo',
  'toolbar.redo',
  'toolbar.aria',
  // search — 검색 패널
  'search.label',
  'search.input',
  'search.find',
  'search.prev',
  'search.next',
  'search.error',
  'search.formAria',
  'search.findAria',
  'search.errorCount',
  'search.noError',
  // io — 가져오기/내보내기 패널
  'io.import',
  'io.export',
  'io.importEncoding',
  'io.exportFormat',
  'io.dataFormat',
  'io.smiEncoding',
  'io.filename',
  'io.removeStyle',
  'io.aria',
  'io.importEncodingAria',
  'io.importAria',
  'io.exportFormatAria',
  'io.dataFormatAria',
  'io.smiEncodingAria',
  'io.filenameAria',
  'io.removeStyleAria',
  'io.exportAria',
  'io.statusImportSuccess',
  'io.statusRows',
  'io.statusImportFormatFail',
  'io.statusImportFail',
  'io.statusExportSuccess',
  'io.statusExportFail',
  // video — 플레이어·컨트롤·소스 폼
  'video.playerAria',
  'video.controlsAria',
  'video.sourceAria',
  'video.overlayAria',
  'video.file',
  'video.url',
  'video.urlPlaceholder',
  'video.filePlaceholder',
  'video.fileAria',
  'video.urlAria',
  'video.load',
  'video.urlHint',
  'video.empty',
  'video.play',
  'video.pause',
  'video.playStop',
  'video.prev',
  'video.next',
  'video.carve',
  'video.seekLabel',
  'video.seekAria',
  'video.volumeLabel',
  'video.volumeAria',
  'video.mute',
  'video.unmute',
  'video.muteAria',
  'video.unmuteAria',
  'video.movePrev',
  'video.moveNext',
  'video.errorUnsupported',
  'video.errorNoFile',
  'video.errorNoUrl',
  'video.errorSource',
  // not-found — 404 페이지
  'notFound.title',
  'notFound.desc',
  'notFound.home',
  'notFound.homeAria',
  // edit — 라우트 헤더
  'edit.title',
  'edit.subtitle',
  'edit.formatAria',
  // lang — 언어 전환 select
  'lang.aria',
  'lang.ko',
  'lang.en',
  'lang.ja',
] as const;

export type DictionaryKey = (typeof DICTIONARY_KEYS)[number];

export { DICTIONARY_KEYS, sheetColumnKey };
