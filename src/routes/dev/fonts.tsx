import { createFileRoute } from '@tanstack/react-router';

const WEIGHT_SAMPLES = [
	{ label: 'Light 300', className: 'font-light' },
	{ label: 'Regular 400', className: 'font-normal' },
	{ label: 'Medium 500', className: 'font-medium' },
	{ label: 'SemiBold 600', className: 'font-semibold' },
	{ label: 'Bold 700', className: 'font-bold' },
	{ label: 'ExtraBold 800', className: 'font-extrabold' },
] as const;

const TIMECODE_SAMPLES = [
	{
		id: '1',
		start: '00:00:03,120',
		end: '00:00:06,450',
		text: '자막 편집을 위한 하이브리드 타이포그래피 검증',
	},
	{
		id: '2',
		start: '00:00:07,800',
		end: '00:00:11,230',
		text: '0123456789 숫자는 SUIT 글꼴로 또렷하게 표시됩니다.',
	},
	{
		id: '3',
		start: '00:00:12,500',
		end: '00:00:16,890',
		text: '日本語字幕のテスト：タイムコード同期と漢字表示の確認',
	},
	{
		id: '4',
		start: '00:01:23,999',
		end: '00:01:28,000',
		text: 'CJK 漢字統合：字幕 映像 編輯 製作 音聲 認識',
	},
] as const;

const SUIT_FAMILY = "'SUIT Variable Specimen', sans-serif" as const;

const FontSpecimenPage = () => {
	return (
		<main className="bg-background text-foreground min-h-screen px-6 py-12 font-sans">
			<div className="mx-auto max-w-4xl space-y-10">
				<header className="border-border border-b pb-6">
					<span className="bg-primary/10 text-primary rounded-md px-2.5 py-1 text-xs font-semibold tracking-wide">
						Dev · Font Test Specimen
					</span>
					<h1 className="mt-3 text-3xl font-bold tracking-tight">Pretendard Suit-num 검증</h1>
					<p className="text-muted-foreground mt-2 text-sm">
						스택: <code className="text-xs">Pretendard Suit-num → Pretendard → Pretendard JP</code>.
						숫자·타임코드만 SUIT, 한글·영문은 Pretendard, 일본어는 Pretendard JP.
					</p>
				</header>

				<section
					aria-labelledby="section-glyph-compare"
					className="border-primary/20 bg-primary/5 space-y-6 rounded-xl border p-6 shadow-sm"
				>
					<div>
						<h2
							id="section-glyph-compare"
							className="text-foreground text-lg font-semibold tracking-tight"
						>
							숫자·글자 분리 검증
						</h2>
						<p className="text-muted-foreground mt-1 text-xs">
							숫자: Hybrid ≈ SUIT / 한글·영문: Hybrid ≈ Pretendard / 일본어: Hybrid ≈ Pretendard JP
						</p>
					</div>

					<div>
						<h3 className="text-muted-foreground mb-3 text-xs font-semibold tracking-wide uppercase">
							1) 숫자 비교
						</h3>
						<div className="grid grid-cols-1 gap-3 md:grid-cols-3">
							<div className="border-border bg-card rounded-lg border p-4">
								<span className="text-primary text-xs font-semibold">SUIT</span>
								<p style={{ fontFamily: SUIT_FAMILY }} className="mt-2 text-2xl font-bold">
									0123456789
								</p>
								<p
									style={{ fontFamily: SUIT_FAMILY }}
									className="text-muted-foreground mt-1 text-sm"
								>
									00:12:34,567
								</p>
							</div>
							<div className="border-border bg-card rounded-lg border p-4">
								<span className="text-primary text-xs font-semibold">Pretendard</span>
								<p
									style={{ fontFamily: "'Pretendard', 'Pretendard JP', sans-serif" }}
									className="mt-2 text-2xl font-bold"
								>
									0123456789
								</p>
								<p
									style={{ fontFamily: "'Pretendard', 'Pretendard JP', sans-serif" }}
									className="text-muted-foreground mt-1 text-sm"
								>
									00:12:34,567
								</p>
							</div>
							<div className="border-border bg-card rounded-lg border p-4">
								<span className="text-primary text-xs font-semibold">Hybrid</span>
								<p className="mt-2 text-2xl font-bold">0123456789</p>
								<p className="text-muted-foreground mt-1 text-sm">00:12:34,567</p>
							</div>
						</div>
					</div>

					<div>
						<h3 className="text-muted-foreground mb-3 text-xs font-semibold tracking-wide uppercase">
							2) 글자 비교 (한글 / 영문 / 일본어)
						</h3>
						<div className="grid grid-cols-1 gap-3 md:grid-cols-3">
							<div className="border-border bg-card space-y-2 rounded-lg border p-4">
								<span className="text-primary text-xs font-semibold">SUIT</span>
								<p
									style={{ fontFamily: SUIT_FAMILY }}
									className="text-lg leading-relaxed font-medium"
								>
									다람쥐 헌 쳇바퀴에 타고파
								</p>
								<p style={{ fontFamily: SUIT_FAMILY }} className="text-base leading-relaxed">
									Caption Studio ABC xyz
								</p>
								<p
									style={{ fontFamily: SUIT_FAMILY }}
									className="text-muted-foreground text-base leading-relaxed"
								>
									日本語テスト 漢字 認識
								</p>
							</div>
							<div className="border-border bg-card space-y-2 rounded-lg border p-4">
								<span className="text-primary text-xs font-semibold">Pretendard</span>
								<p
									style={{ fontFamily: "'Pretendard', 'Pretendard JP', sans-serif" }}
									className="text-lg leading-relaxed font-medium"
								>
									다람쥐 헌 쳇바퀴에 타고파
								</p>
								<p
									style={{ fontFamily: "'Pretendard', 'Pretendard JP', sans-serif" }}
									className="text-base leading-relaxed"
								>
									Caption Studio ABC xyz
								</p>
								<p
									style={{ fontFamily: "'Pretendard', 'Pretendard JP', sans-serif" }}
									className="text-muted-foreground text-base leading-relaxed"
								>
									日本語テスト 漢字 認識
								</p>
							</div>
							<div className="border-border bg-card space-y-2 rounded-lg border p-4">
								<span className="text-primary text-xs font-semibold">Hybrid</span>
								<p className="text-lg leading-relaxed font-medium">다람쥐 헌 쳇바퀴에 타고파</p>
								<p className="text-base leading-relaxed">Caption Studio ABC xyz</p>
								<p className="text-muted-foreground text-base leading-relaxed">
									日本語テスト 漢字 認識
								</p>
							</div>
						</div>
					</div>

					<div>
						<h3 className="text-muted-foreground mb-3 text-xs font-semibold tracking-wide uppercase">
							3) SUIT UI 요소 글자 · ss18 화살표
						</h3>
						<p className="text-muted-foreground mb-3 text-xs">
							UI 요소 글자는 OpenType 스위치 없이 SUIT 기본 글리프입니다. ss18은 화살표에
							샤프트(꼬리)를 켭니다. (하이브리드 스택은 숫자만 SUIT이므로, 아래는 SUIT Specimen으로
							비교)
						</p>

						<div className="grid grid-cols-1 gap-3 md:grid-cols-2">
							<div className="border-border bg-card space-y-3 rounded-lg border p-4">
								<span className="text-primary text-xs font-semibold">
									UI 요소로 해석한 글자 (기본)
								</span>
								<p
									style={{ fontFamily: SUIT_FAMILY }}
									className="text-2xl leading-relaxed tracking-wide"
								>
									↑ → ↓ ← ↔ ↕
								</p>
								<p
									style={{ fontFamily: SUIT_FAMILY }}
									className="text-2xl leading-relaxed tracking-wide"
								>
									● ○ ■ □ ▲ ▼ ▶ ◀
								</p>
								<p style={{ fontFamily: SUIT_FAMILY }} className="text-muted-foreground text-sm">
									다음 → · 완료 ■ · 경고 ⚠ · 확인 ✓
								</p>
							</div>

							<div className="border-border bg-card space-y-3 rounded-lg border p-4">
								<span className="text-primary text-xs font-semibold">ss18 대체 화살표</span>
								<div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
									<div className="bg-muted/40 rounded-md p-3">
										<span className="text-muted-foreground text-[11px] font-semibold uppercase">
											ss18 off
										</span>
										<p
											style={{
												fontFamily: SUIT_FAMILY,
												fontFeatureSettings: "'ss18' off",
											}}
											className="mt-2 text-2xl tracking-wide"
										>
											← → ↑ ↓
										</p>
										<p
											style={{
												fontFamily: SUIT_FAMILY,
												fontFeatureSettings: "'ss18' off",
											}}
											className="text-muted-foreground mt-1 text-sm"
										>
											홈 ← · 다음 →
										</p>
									</div>
									<div className="bg-muted/40 rounded-md p-3">
										<span className="text-primary text-[11px] font-semibold uppercase">
											ss18 on (html 기본: tnum + ss18)
										</span>
										<p
											style={{
												fontFamily: SUIT_FAMILY,
												fontFeatureSettings: "'ss18' on",
											}}
											className="mt-2 text-2xl tracking-wide"
										>
											← → ↑ ↓
										</p>
										<p
											style={{
												fontFamily: SUIT_FAMILY,
												fontFeatureSettings: "'ss18' on",
											}}
											className="text-muted-foreground mt-1 text-sm"
										>
											홈 ← · 다음 →
										</p>
									</div>
								</div>
							</div>
						</div>

						<div className="border-border bg-card mt-3 rounded-lg border border-dashed p-4">
							<span className="text-muted-foreground text-xs font-semibold">
								Hybrid 스택에서의 화살표 (숫자만 SUIT → 화살표는 Pretendard 쪽)
							</span>
							<p className="mt-2 text-2xl tracking-wide">← → ↑ ↓ · 다음 →</p>
						</div>
					</div>
				</section>

				<section
					aria-labelledby="section-timecode"
					className="border-border bg-card rounded-xl border p-6 shadow-sm"
				>
					<div className="mb-4 flex items-center justify-between">
						<h2 id="section-timecode" className="text-lg font-semibold tracking-tight">
							1. 타임코드 및 숫자 정렬 (SUIT)
						</h2>
						<span className="text-muted-foreground text-xs">0123456789</span>
					</div>

					<div className="overflow-x-auto">
						<table className="w-full text-left text-sm">
							<thead className="border-border text-muted-foreground border-b text-xs uppercase">
								<tr>
									<th className="py-2.5 pr-4 font-medium">#</th>
									<th className="py-2.5 pr-4 font-medium">Start Time</th>
									<th className="py-2.5 pr-4 font-medium">End Time</th>
									<th className="py-2.5 font-medium">Subtitle Text</th>
								</tr>
							</thead>
							<tbody className="divide-border/60 divide-y">
								{TIMECODE_SAMPLES.map((sample) => (
									<tr key={sample.id} className="hover:bg-muted/40 transition-colors">
										<td className="text-muted-foreground py-3 pr-4 font-medium">{sample.id}</td>
										<td className="text-primary py-3 pr-4 font-medium">{sample.start}</td>
										<td className="text-primary py-3 pr-4 font-medium">{sample.end}</td>
										<td className="py-3">{sample.text}</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>

					<div className="bg-muted/50 text-muted-foreground mt-4 space-y-1 rounded-lg p-4 text-xs font-medium">
						<p>
							카운터 테스트: 00:00:00,000 / 11:11:11,111 / 22:22:22,222 / 33:33:33,333 /
							88:88:88,888
						</p>
						<p>스펙 비교: 1920x1080 @ 29.97fps | Bitrate: 48,000 kbps | Codec: H.264 / AAC</p>
					</div>
				</section>

				<section
					aria-labelledby="section-i18n"
					className="border-border bg-card space-y-4 rounded-xl border p-6 shadow-sm"
				>
					<h2 id="section-i18n" className="text-lg font-semibold tracking-tight">
						2. 다국어 자막 가독성 (한국어 / 日本語 / CJK 漢字 / English)
					</h2>

					<div className="bg-muted/30 space-y-3 rounded-lg p-4">
						<div>
							<span className="text-muted-foreground text-xs font-semibold uppercase">
								한국어 (KR)
							</span>
							<p className="mt-1 text-base leading-relaxed">
								다람쥐 헌 쳇바퀴에 타고파. 자막 편집기는 타임라인 싱크 조절과 텍스트 입력의 직관성이
								가장 중요합니다. (숫자 12,345개)
							</p>
						</div>

						<div className="border-border/50 border-t pt-3">
							<span className="text-muted-foreground text-xs font-semibold uppercase">
								일본어 (JP)
							</span>
							<p className="mt-1 text-base leading-relaxed">
								いろはにほへと
								ちりぬるを。字幕スタジオへようこそ！音声認識と波形タイムラインによる正確な同期編集が可能です。(約2,400文字)
							</p>
						</div>

						<div className="border-border/50 border-t pt-3">
							<span className="text-muted-foreground text-xs font-semibold uppercase">
								CJK 漢字 (Hanja / Kanji)
							</span>
							<p className="mt-1 text-base leading-relaxed">
								時間 調整 基準 座標 同期化 製作 完了 檢證 認識 效率 向上 (0123-4567-8900)
							</p>
						</div>

						<div className="border-border/50 border-t pt-3">
							<span className="text-muted-foreground text-xs font-semibold uppercase">
								English (EN)
							</span>
							<p className="mt-1 text-base leading-relaxed">
								The quick brown fox jumps over the lazy dog. 0123456789 - All characters and
								punctuation marks are properly rendered.
							</p>
						</div>
					</div>
				</section>

				<section
					aria-labelledby="section-weights"
					className="border-border bg-card space-y-3 rounded-xl border p-6 shadow-sm"
				>
					<h2 id="section-weights" className="text-lg font-semibold tracking-tight">
						3. 폰트 굵기 계층 (Weights 300 ~ 800)
					</h2>

					<div className="space-y-2.5">
						{WEIGHT_SAMPLES.map(({ label, className }) => (
							<div
								key={label}
								className="border-border/40 flex items-baseline justify-between border-b pb-2"
							>
								<span className="text-muted-foreground w-28 text-xs">{label}</span>
								<p className={`flex-1 text-base ${className}`}>
									자막 Studio 2026: 01:23,456 동기화 편집 (同期化 編集)
								</p>
							</div>
						))}
					</div>
				</section>
			</div>
		</main>
	);
};

export const Route = createFileRoute('/dev/fonts')({
	component: FontSpecimenPage,
});
