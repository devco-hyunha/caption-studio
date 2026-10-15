import { createFileRoute } from '@tanstack/react-router';
import { useCallback } from 'react';
import { useSheetFormatStore } from '@/features/sheet-format';
import { useSheetHistoryStore } from '@/features/sheet-history';
import { useSheetSearchStore } from '@/features/sheet-search';
import { rebuildVideoTimeSlotsFromActiveSheet } from '@/features/video-sync';
import { useT, useLocaleStore } from '@/shared/lib/i18n';
import type { Locale } from '@/shared/types/locale';
import { Button } from '@/shared/ui/button';
import { DEFAULT_ESTIMATE_ROW_HEIGHT, SheetPanel, useSheets } from '@/widgets/sheet';
import { VideoPlayer } from '@/widgets/video-player';

const EditPage = () => {
  const format = useSheetFormatStore((state) => state.format);
  const setFormat = useSheetFormatStore((state) => state.setFormat);
  const title = useT('edit.title');
  const subtitle = useT('edit.subtitle');
  const formatAria = useT('edit.formatAria');
  const locale = useLocaleStore((state) => state.locale);
  const setLanguage = useLocaleStore((state) => state.setLanguage);
  const langAria = useT('lang.aria');
  const langKo = useT('lang.ko');
  const langEn = useT('lang.en');
  const langJa = useT('lang.ja');
  const closeSearchPanel = useCallback(() => useSheetSearchStore.getState().closeSearchPanel(), []);
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
  } = useSheets(format, closeSearchPanel);

  const handleFormatSmi = () => {
    if (format === 'smi') return;
    setFormat('smi');
    // 포맷 전환은 전 탭 timelines 변환 → 전 탭 history reset (`/` settings/format.js · 리뷰 H1)
    useSheetHistoryStore.getState().resetForSheets(tabs.length, activeTabIndex);
    rebuildVideoTimeSlotsFromActiveSheet();
  };

  const handleFormatSrt = () => {
    if (format === 'srt') return;
    setFormat('srt');
    useSheetHistoryStore.getState().resetForSheets(tabs.length, activeTabIndex);
    rebuildVideoTimeSlotsFromActiveSheet();
  };

  return (
    <main className="bg-background text-foreground flex h-dvh flex-col gap-4 overflow-hidden p-6 font-sans">
      <header className="flex shrink-0 flex-wrap items-end justify-between gap-3">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
          <p className="text-muted-foreground text-sm">{subtitle}</p>
        </div>
        <div className="flex gap-2" role="group" aria-label={formatAria}>
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
        <label className="flex items-center gap-1 text-sm">
          <span className="text-muted-foreground">{langAria}</span>
          <select
            aria-label={langAria}
            className="border-input bg-background h-8 rounded-md border px-2 text-sm"
            value={locale}
            onChange={(event) => setLanguage(event.target.value as Locale)}
          >
            <option value="ko">{langKo}</option>
            <option value="en">{langEn}</option>
            <option value="ja">{langJa}</option>
          </select>
        </label>
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
