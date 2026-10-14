import { encodeHtml } from '@/entities/subtitle';
import type { SheetColumnId } from '@/shared/types/sheet-column';
import { isTextColumn } from '../../columns/columns';

/** contentEditable DOM → 저장용 HTML — entities encodeHtml 정본 위임 (clone·color 보존) */
const encodeCellHtml = (input: HTMLElement | null | undefined): string =>
  encodeHtml(input ?? null, { clone: true, colorMode: 'keep' });

/** 커밋 값 파생 — text/memo는 HTML 유지, time 열은 innerText trim */
const resolveCommitValue = (column: SheetColumnId, encoded: string, innerText?: string): string =>
  isTextColumn(column) ? encoded : (innerText ?? encoded).trim();

export { encodeCellHtml, resolveCommitValue };
