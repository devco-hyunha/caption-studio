import type { EditableColumn } from '../types';

const EDITABLE_COLUMN_IDS = [
	'text',
	'memo',
	'starttime',
	'endtime',
] as const satisfies readonly EditableColumn[];

const isEditableColumn = (value: string): value is EditableColumn =>
	(EDITABLE_COLUMN_IDS as readonly string[]).includes(value);

export { EDITABLE_COLUMN_IDS, isEditableColumn };
