import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';
import { Button } from '@/shared/ui/button';
import {
	DEFAULT_ESTIMATE_ROW_HEIGHT,
	SheetPanel,
	applySheetFormatChange,
	useSheets,
	type SheetFormat,
} from '@/widgets/sheet';
import { VideoPlayer } from '@/widgets/video-player';

const EditPage = () => {
	const [format, setFormat] = useState<SheetFormat>('srt');
	const {
		tabs,
		activeTabIndex,
		rows,
		activeScrollTop,
		handleScrollTopChange,
		handleSelectTab,
		handleAddTab,
		handleDeleteTab,
		handleRenameTab,
		handleCopyTab,
		handleUpdateCell,
	} = useSheets(format);

	const handleFormatSmi = () => {
		if (format === 'smi') return;
		applySheetFormatChange(format, 'smi');
		setFormat('smi');
	};

	const handleFormatSrt = () => {
		if (format === 'srt') return;
		applySheetFormatChange(format, 'srt');
		setFormat('srt');
	};

	return (
		<main className="bg-background text-foreground flex h-dvh flex-col gap-4 overflow-hidden p-6 font-sans">
			<header className="flex shrink-0 flex-wrap items-end justify-between gap-3">
				<div className="space-y-1">
					<h1 className="text-2xl font-bold tracking-tight">Edit</h1>
					<p className="text-muted-foreground text-sm">
						시트 + react-player · 재생 싱크 · Ctrl+Q/Alt+Q/Ctrl+Space/←→/↑↓ · Prev·Next
					</p>
				</div>
				<div className="flex gap-2" role="group" aria-label="시트 포맷">
					<Button
						type="button"
						variant={format === 'smi' ? 'default' : 'outline'}
						size="sm"
						aria-pressed={format === 'smi'}
						onClick={handleFormatSmi}
					>
						SMI
					</Button>
					<Button
						type="button"
						variant={format === 'srt' ? 'default' : 'outline'}
						size="sm"
						aria-pressed={format === 'srt'}
						onClick={handleFormatSrt}
					>
						SRT
					</Button>
				</div>
			</header>
			<div className="flex min-h-0 flex-1 flex-col gap-4 lg:flex-row">
				<div className="min-h-0 w-full shrink-0 lg:max-w-md lg:flex-1">
					<VideoPlayer className="h-full" />
				</div>
				<div className="min-h-0 min-w-0 flex-1">
					<SheetPanel
						format={format}
						rows={rows}
						estimateRowHeight={DEFAULT_ESTIMATE_ROW_HEIGHT}
						tabs={tabs}
						activeTabIndex={activeTabIndex}
						scrollTop={activeScrollTop}
						onScrollTopChange={handleScrollTopChange}
						onSelectTab={handleSelectTab}
						onAddTab={handleAddTab}
						onDeleteTab={handleDeleteTab}
						onRenameTab={handleRenameTab}
						onCopyTab={handleCopyTab}
						onUpdateCell={handleUpdateCell}
					/>
				</div>
			</div>
		</main>
	);
};

export const Route = createFileRoute('/edit')({
	ssr: false,
	component: EditPage,
});
