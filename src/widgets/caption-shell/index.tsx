import { Fragment } from 'react/jsx-runtime';

/**
 * Legacy index.html body markup ported to JSX for TanStack Start setup.
 * Behavior (caption.js bootstrap) is not wired yet — markup/CSS parity only.
 */
export const CaptionShell = () => {
	return (
		<Fragment>
			<div id="wrap" className="empty">
				<div id="header">
					<div className="hgroup">
						<h1 className="logo">
							<strong>
								C<span>aption</span>
							</strong>{' '}
							S<span>tudio</span>
						</h1>
						<a href="#" id="nav-trigger">
							<span>menu</span>
						</a>
					</div>
				</div>
				<div id="nav">
					<h2 className="none">menu</h2>
					<div className="group tcp">
						<ul className="util">
							<li>
								<a href="#" id="new-sheet">
									<i className="mt icon-insert_drive_file"></i>
									<span className="i18n" data-text="new-file"></span>
								</a>
							</li>
							<li>
								<a href="#" className="dialog-trigger" data-target="video-import">
									<i className="mt icon-video_library"></i>
									<span className="i18n" data-text="video-library"></span>
								</a>
							</li>
							<li>
								<a href="#" className="dialog-trigger" data-target="subtitle-import">
									<i className="mt icon-subtitles"></i>
									<span className="i18n" data-text="import-subtitle"></span>
								</a>
							</li>
							<li>
								<a href="#" className="dialog-trigger" data-target="subtitle-export">
									<i className="mt icon-get_app"></i>
									<span className="i18n" data-text="export-subtitle"></span>
								</a>
							</li>
							<li>
								<a href="#" className="dialog-trigger" data-target="cs-setting">
									<i className="mt icon-settings"></i>
									<span className="i18n" data-text="cs-setting"></span>
								</a>
							</li>
							<li>
								<a href="/manual.html" className="dialog-trigger">
									<i className="mt icon-info_outline"></i>
									<span className="i18n" data-text="cs-manual"></span>
								</a>
							</li>
						</ul>
					</div>
				</div>
				<div id="video" className="overlap">
					<div className="contain">
						<a href="#" className="video-import dialog-trigger tcp" data-target="video-import">
							<i className="mt icon-video_library"></i>
							<span className="i18n" data-text="video-library"></span>
						</a>
					</div>
					<div id="subtitle">
						<div className="header">
							<dl className="info">
								<dt className="none i18n" data-text="timeline-index"></dt>
								<dd className="current-line">0</dd>
								<dt className="none i18n" data-text="timeline-start"></dt>
								<dd className="current-start">00:00:00,000</dd>
								<dt className="none i18n" data-text="timeline-end"></dt>
								<dd className="current-end">00:00:00,000</dd>
							</dl>
							<ul className="util">
								<li>
									<a href="#" className="i18n move-current" data-title="move-current" title="">
										<i className="mt icon-reply reverse-h"></i>
										<span className="i18n" data-text="move-current"></span>
									</a>
								</li>
								<li>
									<a href="#" className="i18n move-prev" data-title="move-prev" title="">
										<i className="mt icon-keyboard_arrow_left"></i>
										<span className="i18n" data-text="move-prev"></span>
									</a>
								</li>
								<li>
									<a href="#" className="i18n move-next" data-title="move-next" title="">
										<i className="mt icon-keyboard_arrow_right"></i>
										<span className="i18n" data-text="move-next"></span>
									</a>
								</li>
								<li>
									<a
										href="#"
										className="i18n subtitle-visible"
										data-title="subtitle-visible"
										title=""
									>
										<i className="mt icon-layers"></i>
										<span className="i18n" data-text="subtitle-visible"></span>
									</a>
								</li>
							</ul>
						</div>
						<div className="section">
							<p className="current-text"></p>
						</div>
					</div>
				</div>
				<div id="controller">
					<ul className="subtitle-util ui-left">
						<li className="ui-toggle">
							<a href="#" id="sheet-search" className="trigger i18n" data-title="sheet-search">
								<i className="mt icon-search"></i>
								<span className="i18n tir" data-text="sheet-search"></span>
							</a>
							<div id="sheet-search-panel" className="panel">
								<form className="form-sheet-search" autoComplete="off">
									<input
										type="search"
										className="i18n i-sheet-search"
										autoComplete="off"
										name="key"
										data-placeholder="sheet-search-input"
									/>
									<button type="submit" className="btn-sheet-search">
										<i className="mt icon-search"></i>
									</button>
								</form>
								<input type="checkbox" id="error-search" name="error-search" className="none" />
								<label htmlFor="error-search" className="error-label">
									<i className="mt icon-error_outline"></i>
									<strong className="error-count"></strong>
									<span className="i18n" data-text="error-search"></span>
								</label>
								<span className="result">0/0</span>
								<a href="#" className="btn-prev disabled i18n" data-title="prev">
									<i className="mt icon-keyboard_arrow_up"></i>
									<span className="i18n tir" data-text="prev"></span>
								</a>
								<a href="#" className="btn-next disabled i18n" data-title="next">
									<i className="mt icon-keyboard_arrow_down"></i>
									<span className="i18n tir" data-text="next"></span>
								</a>
							</div>
						</li>
					</ul>
					<ul className="time-util ui-left">
						<li>
							<a
								href="#"
								id="time-edit"
								className="i18n btn-time-controls btn-multiple-controls"
								data-title="time-edit"
							>
								<i className="mt icon-update"></i>
								<span className="i18n tir" data-text="time-edit"></span>
							</a>
						</li>
						<li>
							<a
								href="#"
								id="time-plus"
								className="i18n btn-time-controls btn-multiple-controls"
								data-title="time-plus"
							>
								<span>
									+<strong></strong>
									<small>ms</small>
								</span>
							</a>
						</li>
						<li>
							<a
								href="#"
								id="time-minus"
								className="i18n btn-time-controls btn-multiple-controls"
								data-title="time-minus"
							>
								<span>
									-<strong></strong>
									<small>ms</small>
								</span>
							</a>
						</li>
					</ul>
					<ul className="text-util ui-right">
						<li>
							<a
								href="#"
								id="font-bold"
								className="i18n btn-text-controls btn-multiple-controls"
								data-title="font-bold"
							>
								<span>B</span>
							</a>
						</li>
						<li>
							<a
								href="#"
								id="font-underline"
								className="i18n btn-text-controls btn-multiple-controls"
								data-title="font-underline"
							>
								<span>U</span>
							</a>
						</li>
						<li>
							<a
								href="#"
								id="font-italic"
								className="i18n btn-text-controls btn-multiple-controls"
								title=""
								data-title="font-italic"
							>
								<span>I</span>
							</a>
						</li>
						<li className="ui-toggle">
							<a href="#" id="font-color" className="trigger i18n" data-title="font-color">
								<i className="mt icon-palette"></i>
								<span className="i18n tir" data-text="font-color"></span>
							</a>
							<div id="font-color-list">
								<ul className="color-list">
									<li className="color-panel">
										<a
											href="#"
											id="color-1"
											className="i18n btn-text-controls btn-multiple-controls"
											data-title="color-1"
										>
											<span className="color" style={{ backgroundColor: 'rgb(0, 0, 0)' }}></span>
											<span className="hex tup">#000000</span>
										</a>
									</li>
									<li className="color-panel">
										<a
											href="#"
											id="color-2"
											className="i18n btn-text-controls btn-multiple-controls"
											data-title="color-2"
										>
											<span className="color" style={{ backgroundColor: 'rgb(0, 0, 0)' }}></span>
											<span className="hex tup">#000000</span>
										</a>
									</li>
									<li className="color-panel">
										<a
											href="#"
											id="color-3"
											className="i18n btn-text-controls btn-multiple-controls"
											data-title="color-3"
										>
											<span className="color" style={{ backgroundColor: 'rgb(0, 0, 0)' }}></span>
											<span className="hex tup">#000000</span>
										</a>
									</li>
									<li className="color-panel">
										<a
											href="#"
											id="color-4"
											className="i18n btn-text-controls btn-multiple-controls"
											data-title="color-4"
										>
											<span className="color" style={{ backgroundColor: 'rgb(0, 0, 0)' }}></span>
											<span className="hex tup">#000000</span>
										</a>
									</li>
									<li className="color-panel">
										<a
											href="#"
											id="color-5"
											className="i18n btn-text-controls btn-multiple-controls"
											data-title="color-5"
										>
											<span className="color" style={{ backgroundColor: 'rgb(0, 0, 0)' }}></span>
											<span className="hex tup">#000000</span>
										</a>
									</li>
									<li className="color-panel">
										<a
											href="#"
											id="color-6"
											className="i18n btn-text-controls btn-multiple-controls"
											data-title="color-6"
										>
											<span className="color" style={{ backgroundColor: 'rgb(0, 0, 0)' }}></span>
											<span className="hex tup">#000000</span>
										</a>
									</li>
									<li className="color-panel">
										<a
											href="#"
											id="color-7"
											className="i18n btn-text-controls btn-multiple-controls"
											data-title="color-7"
										>
											<span className="color" style={{ backgroundColor: 'rgb(0, 0, 0)' }}></span>
											<span className="hex tup">#000000</span>
										</a>
									</li>
									<li className="color-panel">
										<a
											href="#"
											id="color-8"
											className="i18n btn-text-controls btn-multiple-controls"
											data-title="color-8"
										>
											<span className="color" style={{ backgroundColor: 'rgb(0, 0, 0)' }}></span>
											<span className="hex tup">#000000</span>
										</a>
									</li>
								</ul>
								<ul className="color-util">
									<li>
										<a href="#" id="color-select" className="i18n" data-title="color-select">
											<i className="mt icon-colorize"></i>
											<span className="i18n tir" data-text="color-select"></span>
										</a>
									</li>
									<li>
										<a
											href="#"
											id="color-reset"
											className="i18n btn-text-controls btn-multiple-controls"
											data-title="color-reset"
										>
											<i className="mt icon-format_color_reset"></i>
											<span className="i18n tir" data-text="color-reset"></span>
										</a>
									</li>
								</ul>
							</div>
						</li>
					</ul>
					<ul className="sheet-util ui-right">
						<li>
							<a
								href="#"
								id="sheet-edit"
								className="i18n btn-text-controls btn-single-controls"
								data-title="sheet-edit"
							>
								<i className="mt icon-keyboard"></i>
								<span className="i18n tir" data-text="sheet-edit"></span>
							</a>
						</li>
						<li>
							<a
								href="#"
								id="sheet-insert"
								className="i18n btn-sheet-controls btn-single-controls"
								data-title="sheet-insert"
							>
								<i className="mt icon-add_box"></i>
								<span className="i18n tir" data-text="sheet-insert"></span>
							</a>
						</li>
						<li>
							<a
								href="#"
								id="sheet-remove"
								className="i18n btn-sheet-controls btn-single-controls"
								data-title="sheet-remove"
							>
								<i className="mt icon-indeterminate_check_box"></i>
								<span className="i18n tir" data-text="sheet-remove"></span>
							</a>
						</li>
						<li>
							<a
								href="#"
								id="sheet-multiple"
								className="i18n btn-sheet-selector btn-multiple-controls"
								data-title="sheet-multiple"
							>
								<i className="mt icon-check_box"></i>
								<span className="i18n tir" data-text="sheet-multiple"></span>
							</a>
						</li>
					</ul>
					<ul className="history">
						<li>
							<a href="#" id="undo" className="i18n disabled btn-single-controls" data-title="undo">
								<i className="mt icon-undo"></i>
								<span className="i18n tir" data-text="undo"></span>
							</a>
						</li>
						<li>
							<a href="#" id="redo" className="i18n disabled btn-single-controls" data-title="redo">
								<i className="mt icon-redo"></i>
								<span className="i18n tir" data-text="redo"></span>
							</a>
						</li>
					</ul>
				</div>
				<div id="sheet">
					<div className="sheet-head">
						<div className="sheet-panel tcp"></div>
					</div>
					<div className="sheet-body">
						<div className="sheet-body-scroll">
							<div className="sheet-trigger" tabIndex={-1}>
								<div className="sheet-input" tabIndex={-1} contentEditable="true"></div>
							</div>
							<div className="sheet-panel"></div>
						</div>
					</div>
					<div className="sheet-footer" role="navigation" aria-label="sheet tabs" hidden></div>
				</div>
				<div id="layout">
					<div className="overlay"></div>
					<div className="panel tcp">
						<div className="dialog">
							<div className="dialog-head">
								<h2 className="title"></h2>
								<a href="#" className="btn-close">
									<i className="mt icon-close"></i>
									<span className="i18n tir" data-text="dialog-close"></span>
								</a>
							</div>
							<div className="dialog-body">
								<div className="contain"></div>
							</div>
						</div>
						<div id="time-editor" className="dialog">
							<div className="dialog-head">
								<h2 className="title">
									<i className="mt icon-update"></i>
									<span className="i18n" data-text="time-edit"></span>
								</h2>
								<a href="#" className="btn-close">
									<i className="mt icon-close"></i>
									<span className="i18n tir" data-text="dialog-close"></span>
								</a>
							</div>
							<div className="dialog-body form">
								<form className="contain" autoComplete="off">
									<dl className="time-slider">
										<dt className="i18n" data-text="hour"></dt>
										<dd>
											<div
												className="slider hour"
												data-target="hour"
												data-min="0"
												data-max="12"
												data-step="1"
												data-zf="2"
											></div>
										</dd>
										<dt className="i18n" data-text="minute"></dt>
										<dd>
											<div
												className="slider minute"
												data-target="minute"
												data-min="0"
												data-max="59"
												data-step="1"
												data-zf="2"
											></div>
										</dd>
										<dt className="i18n" data-text="second"></dt>
										<dd>
											<div
												className="slider second"
												data-target="second"
												data-min="0"
												data-max="59"
												data-step="1"
												data-zf="2"
											></div>
										</dd>
										<dt className="i18n" data-text="milli"></dt>
										<dd>
											<div
												className="slider milli"
												data-target="milli"
												data-min="0"
												data-max="999"
												data-step="10"
												data-zf="3"
											></div>
										</dd>
									</dl>
									<dl className="time-positive">
										<dt className="i18n tir" data-text="sync-ctrl"></dt>
										<dd>
											<label className="radio-label">
												<input
													type="radio"
													name="time-positive"
													className="plus"
													defaultChecked
													value="plus"
												/>
												<span className="i18n" data-text="positive-plus"></span>
											</label>
											<label className="radio-label">
												<input type="radio" name="time-positive" className="minus" value="minus" />
												<span className="i18n" data-text="positive-minus"></span>
											</label>
										</dd>
									</dl>
									<dl className="time-form">
										<dt className="i18n tir" data-text="sync-ctrl-time"></dt>
										<dd>
											<ul className="time-part">
												<li className="hour">
													<input
														type="number"
														min="0"
														max="12"
														maxLength={2}
														step="1"
														defaultValue="0"
														data-min="0"
														data-max="12"
														data-target="hour"
														data-zf="2"
													/>
													<span className="visible" data-value="00">
														00
													</span>
												</li>
												<li className="minute">
													<input
														type="number"
														min="0"
														max="59"
														maxLength={2}
														step="1"
														defaultValue="0"
														data-min="0"
														data-max="59"
														data-target="minute"
														data-zf="2"
													/>
													<span className="visible" data-value="00">
														00
													</span>
												</li>
												<li className="second">
													<input
														type="number"
														min="0"
														max="59"
														maxLength={2}
														step="1"
														defaultValue="0"
														data-min="0"
														data-max="59"
														data-target="second"
														data-zf="2"
													/>
													<span className="visible" data-value="00">
														00
													</span>
												</li>
												<li className="milli">
													<input
														type="number"
														min="0"
														max="999"
														maxLength={3}
														step="10"
														defaultValue="0"
														data-min="0"
														data-max="999"
														data-target="milli"
														data-zf="3"
													/>
													<span className="visible" data-value="000">
														000
													</span>
												</li>
											</ul>
										</dd>
										<dd>
											<input
												type="number"
												min="-46799999"
												max="46799999"
												step="10"
												id="millisecond"
												defaultValue="0"
												data-min="-46799999"
												data-max="46799999"
											/>
											ms
										</dd>
									</dl>
									<div className="btn-group">
										<button type="reset" className="none btn-reset i18n" data-text="reset"></button>
										<button className="btn btn-submit time-apply">
											<span className="i18n tcp" data-text="apply"></span>
										</button>
									</div>
								</form>
							</div>
						</div>
						<div id="color-selector" className="dialog">
							<div className="dialog-head">
								<h2 className="title">
									<i className="mt icon-palette"></i>
									<span className="i18n" data-text="color-select"></span>
								</h2>
								<a href="#" className="btn-close">
									<i className="mt icon-close"></i>
									<span className="i18n tir" data-text="dialog-close"></span>
								</a>
							</div>
							<div className="dialog-body">
								<div className="contain">
									<ul className="color-list">
										<li className="color-panel">
											<a href="#" id="color-1" className="i18n btn-color" data-title="color-1">
												<span className="color" style={{ backgroundColor: 'rgb(0, 0, 0)' }}></span>
												<span className="hex tup">#000000</span>
											</a>
										</li>
										<li className="color-panel">
											<a href="#" id="color-2" className="i18n btn-color" data-title="color-2">
												<span className="color" style={{ backgroundColor: 'rgb(0, 0, 0)' }}></span>
												<span className="hex tup">#000000</span>
											</a>
										</li>
										<li className="color-panel">
											<a href="#" id="color-3" className="i18n btn-color" data-title="color-3">
												<span className="color" style={{ backgroundColor: 'rgb(0, 0, 0)' }}></span>
												<span className="hex tup">#000000</span>
											</a>
										</li>
										<li className="color-panel">
											<a href="#" id="color-4" className="i18n btn-color" data-title="color-4">
												<span className="color" style={{ backgroundColor: 'rgb(0, 0, 0)' }}></span>
												<span className="hex tup">#000000</span>
											</a>
										</li>
										<li className="color-panel">
											<a href="#" id="color-5" className="i18n btn-color" data-title="color-5">
												<span className="color" style={{ backgroundColor: 'rgb(0, 0, 0)' }}></span>
												<span className="hex tup">#000000</span>
											</a>
										</li>
										<li className="color-panel">
											<a href="#" id="color-6" className="i18n btn-color" data-title="color-6">
												<span className="color" style={{ backgroundColor: 'rgb(0, 0, 0)' }}></span>
												<span className="hex tup">#000000</span>
											</a>
										</li>
										<li className="color-panel">
											<a href="#" id="color-7" className="i18n btn-color" data-title="color-7">
												<span className="color" style={{ backgroundColor: 'rgb(0, 0, 0)' }}></span>
												<span className="hex tup">#000000</span>
											</a>
										</li>
										<li className="color-panel">
											<a href="#" id="color-8" className="i18n btn-color" data-title="color-8">
												<span className="color" style={{ backgroundColor: 'rgb(0, 0, 0)' }}></span>
												<span className="hex tup">#000000</span>
											</a>
										</li>
									</ul>
									<div className="picker"></div>
								</div>
							</div>
						</div>
						<div id="video-import" className="dialog">
							<div className="dialog-head">
								<h2 className="title">
									<i className="mt icon-video_library"></i>
									<span className="i18n tcp" data-text="video-library"></span>
								</h2>
								<a href="#" className="btn-close">
									<i className="mt icon-close"></i>
									<span className="i18n tir" data-text="dialog-close"></span>
								</a>
							</div>
							<div className="dialog-body ui-tab form">
								<ul className="tab-header tcp">
									<li>
										<a href="#" data-value="file">
											<span>file</span>
										</a>
									</li>
									<li>
										<a href="#" data-value="url">
											<span>url</span>
										</a>
									</li>
									<li>
										<a href="#" data-value="youtube">
											<span>youtube</span>
										</a>
									</li>
									<li>
										<a href="#" data-value="vimeo">
											<span>vimeo</span>
										</a>
									</li>
								</ul>
								<form className="contain tab-body" autoComplete="off">
									<div id="video-import-file" className="tab-panel" data-type="file">
										<label className="i-text file empty" data-action="video.fileCheck">
											<input
												type="file"
												id="video-file"
												accept="video/mp4, video/ogg, video/webm"
												className="none"
											/>
											<span className="i-filename"></span>
											<span className="i-placeholder i18n" data-text="video-import-file"></span>
										</label>
									</div>
									<div id="video-import-url" className="tab-panel" data-type="url">
										<input
											type="text"
											id="video-url"
											className="i-text i18n"
											data-placeholder="video-import-url"
										/>
									</div>
									<div id="video-import-youtube" className="tab-panel" data-type="youtube">
										<input
											type="text"
											id="video-youtube"
											className="i-text i18n"
											data-placeholder="video-import-youtube"
										/>
									</div>
									<div id="video-import-vimeo" className="tab-panel" data-type="vimeo">
										<input
											type="text"
											id="video-vimeo"
											className="i-text i18n"
											data-placeholder="video-import-vimeo"
										/>
									</div>
									<div className="btn-group">
										<button type="reset" className="none btn-reset i18n" data-text="reset"></button>
										<a href="#" className="btn btn-submit video-load">
											<span className="i18n tcp" data-text="video-library"></span>
										</a>
									</div>
								</form>
							</div>
						</div>
						<div id="subtitle-import" className="dialog">
							<div className="dialog-head">
								<h2 className="title">
									<i className="mt icon-subtitles"></i>
									<span className="i18n" data-text="import-subtitle"></span>
								</h2>
								<a href="#" className="btn-close">
									<i className="mt icon-close"></i>
									<span className="i18n tir" data-text="dialog-close"></span>
								</a>
							</div>
							<div className="dialog-body ui-tab form">
								<ul className="tab-header tcp">
									<li>
										<a href="#" data-value="text" data-action="import.text">
											<span>text</span>
										</a>
									</li>
									<li>
										<a href="#" data-value="smi" data-action="import.smi">
											<span>smi</span>
										</a>
									</li>
									<li>
										<a href="#" data-value="srt" data-action="import.srt">
											<span>srt</span>
										</a>
									</li>
								</ul>
								<form className="contain tab-body" autoComplete="off">
									<div id="subtitle-import-text" className="tab-panel">
										<textarea
											name="subtitle-text"
											id="subtitle-text"
											className="i-text i18n"
											data-placeholder="subtitle-import-text"
											placeholder=""
										></textarea>
									</div>
									<div id="subtitle-import-smi" className="tab-panel">
										<div
											className="ui-select i18n"
											data-action="import.encoding.smi"
											data-key="smiEncode"
											data-title="subtitle-file-encode"
										>
											<a href="#" className="trigger"></a>
											<ul className="option">
												<li>
													<a href="#" data-value="UTF-8">
														UTF-8
													</a>
												</li>
												<li>
													<a href="#" data-value="EUC-KR">
														한국어<small>(EUC-KR)</small>
													</a>
												</li>
												<li>
													<a href="#" data-value="EUC-CN">
														中国<small>(EUC-CN)</small>
													</a>
												</li>
												<li>
													<a href="#" data-value="EUC-TW">
														中国传统<small>(EUC-TW)</small>
													</a>
												</li>
												<li>
													<a href="#" data-value="EUC-JP">
														日本語<small>(EUC-JP)</small>
													</a>
												</li>
											</ul>
										</div>
										<label className="i-text file empty">
											<input type="file" id="smi-file" className="none" />
											<span className="i-filename"></span>
											<span className="i-placeholder i18n" data-text="subtitle-import-smi"></span>
										</label>
									</div>
									<div id="subtitle-import-srt" className="tab-panel">
										<div
											className="ui-select i18n"
											data-action="import.encoding.srt"
											data-key="srtEncode"
											data-title="subtitle-file-encode"
										>
											<a href="#" className="trigger"></a>
											<ul className="option">
												<li>
													<a href="#" data-value="UTF-8">
														UTF-8
													</a>
												</li>
												<li>
													<a href="#" data-value="EUC-KR">
														한국어<small>(EUC-KR)</small>
													</a>
												</li>
												<li>
													<a href="#" data-value="EUC-CN">
														中国<small>(EUC-CN)</small>
													</a>
												</li>
												<li>
													<a href="#" data-value="EUC-TW">
														中国传统<small>(EUC-TW)</small>
													</a>
												</li>
												<li>
													<a href="#" data-value="EUC-JP">
														日本語<small>(EUC-JP)</small>
													</a>
												</li>
											</ul>
										</div>
										<label className="i-text file empty">
											<input type="file" id="srt-file" className="none" />
											<span className="i-filename"></span>
											<span className="i-placeholder i18n" data-text="subtitle-import-srt"></span>
										</label>
									</div>
									<div className="btn-group">
										<button type="reset" className="none btn-reset i18n" data-text="reset"></button>
										<a href="#" className="btn btn-submit subtitle-load">
											<span className="i18n" data-text="import-subtitle"></span>
										</a>
									</div>
								</form>
							</div>
						</div>
						<div id="subtitle-export" className="dialog">
							<div className="dialog-head">
								<h2 className="title">
									<i className="mt mt icon-get_app"></i>
									<span className="i18n" data-text="export-subtitle"></span>
								</h2>
								<a href="#" className="btn-close">
									<i className="mt icon-close"></i>
									<span className="i18n tir" data-text="dialog-close"></span>
								</a>
							</div>
							<div className="dialog-body ui-tab form">
								<ul className="tab-header tcp">
									<li>
										<a href="#" data-value="smi" data-action="export.smi">
											<span>smi</span>
										</a>
									</li>
									<li>
										<a href="#" data-value="srt" data-action="export.srt">
											<span>srt</span>
										</a>
									</li>
									<li>
										<a href="#" data-value="vtt" data-action="export.vtt">
											<span>vtt</span>
										</a>
									</li>
									<li>
										<a href="#" data-value="json" data-action="export.json">
											<span>json</span>
										</a>
									</li>
									<li>
										<a href="#" data-value="excel" data-action="export.excel">
											<span>excel</span>
										</a>
									</li>
								</ul>
								<div
									className="export-sheet-picker"
									role="tablist"
									aria-label="export sheets"
									hidden
								></div>
								<div className="contain tab-body">
									<form id="subtitle-export-smi" className="tab-panel" autoComplete="off">
										<input type="hidden" name="encode_smi_file" className="encode_smi_file" />
										<input type="hidden" name="smi_class" className="smi-class" />
										<div
											className="ui-select i18n"
											data-action="export.encoding.smi"
											data-key="smiEncodeFile"
											data-title="subtitle-file-encode"
										>
											<a href="#" className="trigger"></a>
											<ul className="option">
												<li>
													<a href="#" data-value="UTF-8">
														UTF-8
													</a>
												</li>
												<li>
													<a href="#" data-value="EUC-KR">
														한국어<small>(EUC-KR)</small>
													</a>
												</li>
												<li>
													<a href="#" data-value="EUC-CN">
														中国<small>(EUC-CN)</small>
													</a>
												</li>
												<li>
													<a href="#" data-value="EUC-TW">
														中国传统<small>(EUC-TW)</small>
													</a>
												</li>
												<li>
													<a href="#" data-value="EUC-JP">
														日本語<small>(EUC-JP)</small>
													</a>
												</li>
											</ul>
										</div>
										<ul className="entry">
											<li>
												<label>
													<span className="i18n i-title" data-text="filename"></span>
													<input
														type="text"
														name="filename"
														id="smi-file"
														className="i-text filename i18n"
														data-placeholder="filename"
													/>
												</label>
											</li>
											<li hidden>
												<label>
													<span className="i18n i-title" data-text="smi-class"></span>
													<input
														type="text"
														name="smi_class_display"
														className="i-text smi-class-display"
														readOnly
														tabIndex={-1}
													/>
												</label>
											</li>
											<li hidden>
												<label>
													<span className="i18n i-title" data-text="smi-name"></span>
													<input
														type="text"
														name="smi_name"
														className="i-text smi-name i18n"
														data-placeholder="smi-name"
													/>
												</label>
											</li>
											<li hidden>
												<label>
													<span className="i18n i-title" data-text="smi-lang"></span>
													<input
														type="text"
														name="smi_lang"
														className="i-text smi-lang i18n"
														data-placeholder="smi-lang"
														placeholder="ko-KR"
													/>
												</label>
											</li>
											<li>
												<span className="i18n i-title" data-text="signature"></span>
												<textarea
													name="signature"
													className="i-text signature i18n"
													data-placeholder="signature"
												></textarea>
											</li>
										</ul>
										<div className="btn-group">
											<button
												type="reset"
												className="none btn-reset i18n"
												data-text="reset"
											></button>
											<button className="btn btn-submit subtitle-download">
												<span className="i18n" data-text="export-subtitle"></span>
											</button>
										</div>
									</form>
									<form id="subtitle-export-srt" className="tab-panel" autoComplete="off">
										<input type="hidden" name="encode_srt_file" className="encode_srt_file" />
										<div
											className="ui-select i18n"
											data-action="export.encoding.srt"
											data-key="srtEncodeFile"
											data-title="subtitle-file-encode"
										>
											<a href="#" className="trigger"></a>
											<ul className="option">
												<li>
													<a href="#" data-value="UTF-8">
														UTF-8
													</a>
												</li>
												<li>
													<a href="#" data-value="EUC-KR">
														한국어<small>(EUC-KR)</small>
													</a>
												</li>
												<li>
													<a href="#" data-value="EUC-CN">
														中国<small>(EUC-CN)</small>
													</a>
												</li>
												<li>
													<a href="#" data-value="EUC-TW">
														中国传统<small>(EUC-TW)</small>
													</a>
												</li>
												<li>
													<a href="#" data-value="EUC-JP">
														日本語<small>(EUC-JP)</small>
													</a>
												</li>
											</ul>
										</div>
										<ul className="entry">
											<li>
												<label className="i-checkbox">
													<input type="checkbox" name="is-style" id="is-style" className="none" />
													<span className="mt i18n" data-text="remove-style"></span>
												</label>
											</li>
											<li>
												<label>
													<span className="i18n i-title" data-text="filename"></span>
													<input
														type="text"
														name="filename"
														id="srt-file"
														className="i-text filename i18n"
														data-placeholder="filename"
													/>
												</label>
											</li>
										</ul>
										<div className="btn-group">
											<button
												type="reset"
												className="none btn-reset i18n"
												data-text="reset"
											></button>
											<button className="btn btn-submit subtitle-download">
												<span className="i18n" data-text="export-subtitle"></span>
											</button>
										</div>
									</form>
									<form id="subtitle-export-vtt" className="tab-panel" autoComplete="off">
										<input type="hidden" name="encode_vtt_file" className="encode_vtt_file" />
										<div
											className="ui-select i18n"
											data-action="export.encoding.vtt"
											data-key="vttEncodeFile"
											data-title="subtitle-file-encode"
										>
											<a href="#" className="trigger"></a>
											<ul className="option">
												<li>
													<a href="#" data-value="UTF-8">
														UTF-8
													</a>
												</li>
												<li>
													<a href="#" data-value="EUC-KR">
														한국어<small>(EUC-KR)</small>
													</a>
												</li>
												<li>
													<a href="#" data-value="EUC-CN">
														中国<small>(EUC-CN)</small>
													</a>
												</li>
												<li>
													<a href="#" data-value="EUC-TW">
														中国传统<small>(EUC-TW)</small>
													</a>
												</li>
												<li>
													<a href="#" data-value="EUC-JP">
														日本語<small>(EUC-JP)</small>
													</a>
												</li>
											</ul>
										</div>
										<ul className="entry">
											<li>
												<label className="i-checkbox">
													<input type="checkbox" name="is-style" id="is-style" className="none" />
													<span className="mt i18n" data-text="remove-style"></span>
												</label>
											</li>
											<li>
												<label>
													<span className="i18n i-title" data-text="filename"></span>
													<input
														type="text"
														name="filename"
														id="vtt-file"
														className="i-text filename i18n"
														data-placeholder="filename"
													/>
												</label>
											</li>
										</ul>
										<div className="btn-group">
											<button
												type="reset"
												className="none btn-reset i18n"
												data-text="reset"
											></button>
											<button className="btn btn-submit subtitle-download">
												<span className="i18n" data-text="export-subtitle"></span>
											</button>
										</div>
									</form>
									<form id="subtitle-export-json" className="tab-panel" autoComplete="off">
										<input type="hidden" name="format" className="json-format" />
										<div
											className="ui-select i18n"
											data-action="export.sheetFormat.json"
											data-key="jsonFormat"
											data-title="subtitle-format"
										>
											<a href="#" className="trigger"></a>
											<ul className="option">
												<li>
													<a href="#" data-value="smi">
														SMI
													</a>
												</li>
												<li>
													<a href="#" data-value="srt">
														SRT
													</a>
												</li>
											</ul>
										</div>
										<ul className="entry">
											<li>
												<label>
													<span className="i18n i-title" data-text="filename"></span>
													<input
														type="text"
														name="filename"
														id="json-file"
														className="i-text filename i18n"
														data-placeholder="filename"
													/>
												</label>
											</li>
										</ul>
										<div className="btn-group">
											<button
												type="reset"
												className="none btn-reset i18n"
												data-text="reset"
											></button>
											<button className="btn btn-submit subtitle-download">
												<span className="i18n" data-text="export-subtitle"></span>
											</button>
										</div>
									</form>
									<form id="subtitle-export-excel" className="tab-panel" autoComplete="off">
										<input type="hidden" name="format" className="excel-format" />
										<div
											className="ui-select i18n"
											data-action="export.sheetFormat.excel"
											data-key="excelFormat"
											data-title="subtitle-format"
										>
											<a href="#" className="trigger"></a>
											<ul className="option">
												<li>
													<a href="#" data-value="smi">
														SMI
													</a>
												</li>
												<li>
													<a href="#" data-value="srt">
														SRT
													</a>
												</li>
											</ul>
										</div>
										<ul className="entry">
											<li>
												<label>
													<span className="i18n i-title" data-text="filename"></span>
													<input
														type="text"
														name="filename"
														id="excel-file"
														className="i-text filename i18n"
														data-placeholder="filename"
													/>
												</label>
											</li>
										</ul>
										<div className="btn-group">
											<button
												type="reset"
												className="none btn-reset i18n"
												data-text="reset"
											></button>
											<button className="btn btn-submit subtitle-download">
												<span className="i18n" data-text="export-subtitle"></span>
											</button>
										</div>
									</form>
								</div>
							</div>
						</div>
						<div id="cs-setting" className="dialog">
							<div className="dialog-head">
								<h2 className="title">
									<i className="mt icon-settings"></i>
									<span className="i18n" data-text="cs-setting"></span>
								</h2>
								<a href="#" className="btn-close">
									<i className="mt icon-close"></i>
									<span className="i18n tir" data-text="dialog-close"></span>
								</a>
							</div>
							<div className="dialog-body ui-tab form">
								<ul className="tab-header tcp">
									<li>
										<a href="#" data-value="default">
											<span className="i18n" data-text="default-settings"></span>
										</a>
									</li>
									<li>
										<a href="#" data-value="shortkey" data-action="shortkey.renderSettings">
											<span className="i18n" data-text="shortkey"></span>
										</a>
									</li>
									<li>
										<a href="#" data-value="info">
											<span className="i18n" data-text="info"></span>
										</a>
									</li>
								</ul>
								<div className="contain tab-body">
									<div id="default-settings" className="tab-panel">
										<ul className="config-list">
											<li>
												<dl>
													<dt className="i18n" data-text="language"></dt>
													<dd>
														<div
															className="ui-select"
															data-action="settings.language"
															data-key="locale"
														>
															<a href="#" className="trigger"></a>
															<ul className="option">
																<li>
																	<a href="#" data-value="ko">
																		한국어
																	</a>
																</li>
																<li>
																	<a href="#" data-value="en">
																		English
																	</a>
																</li>
																<li>
																	<a href="#" data-value="ja">
																		日本語
																	</a>
																</li>
															</ul>
														</div>
													</dd>
												</dl>
											</li>
											<li>
												<dl>
													<dt className="i18n" data-text="subtitle-format"></dt>
													<dd>
														<div
															className="ui-select i18n"
															data-action="settings.format"
															data-key="format"
															data-title="subtitle-format"
														>
															<a href="#" className="trigger"></a>
															<ul className="option">
																<li>
																	<a href="#" data-value="smi">
																		SMI
																	</a>
																</li>
																<li>
																	<a href="#" data-value="srt">
																		SRT
																	</a>
																</li>
															</ul>
														</div>
													</dd>
												</dl>
											</li>
											<li>
												<form className="subtitle-move-time" autoComplete="off">
													<dl>
														<dt>
															<span className="i18n" data-text="subtitle-move-time"></span>
															<button id="jump_time_change" className="btn-change">
																<span className="i18n" data-text="change"></span>
															</button>
														</dt>
														<dd>
															<div className="ms-jump-label">
																<input
																	type="number"
																	name="jump_time_config_value"
																	id="jump_time_config_value"
																	min="1"
																	max="1000"
																	step="1"
																	className="i-text jump_time_config_value"
																	placeholder="1 ~ 1000"
																	readOnly
																	disabled
																/>
																<span className="i18n tcp" data-text="milli"></span>
															</div>
														</dd>
													</dl>
												</form>
											</li>
										</ul>
									</div>
									<div id="shortkey-settings" className="tab-panel">
										<div className="key-panel">
											<h3 className="data-title i18n" data-text="custom-shortkey"></h3>
											<ul id="custom-shortkey-list" className="key-list"></ul>
										</div>
										<div className="key-panel">
											<h3 className="data-title i18n" data-text="default-shortkey"></h3>
											<ul id="default-shortkey-list" className="key-list"></ul>
										</div>
									</div>
									<div id="about-site" className="tab-panel">
										<ul>
											<li>
												<strong>HTML, JAVASCRIPT로 제작</strong>되어, 최신의{' '}
												<strong>웹브라우저로 쉽게 접속</strong>하여 자막을 제작 할 수 있습니다.
											</li>
											<li>
												<strong>WYSIWYG 방식</strong>으로 자막에서 사용하는 태그를 알지 못하더라도{' '}
												<strong>워드나 엑셀을 작성하듯 자막을 쉽게 편집</strong> 할 수 있습니다.
											</li>
											<li>
												작업 중인 내용이 <strong>실시간으로 브라우저에 자동 저장</strong>되어,
												사이트 <strong>재 접속시에 마지막 작업된 내용을 불러와 자막 편집</strong>을
												이어 할 수 있습니다.
											</li>
										</ul>
										<dl>
											<dt>version</dt>
											<dd>2.8.4</dd>
											<dt>developer</dt>
											<dd>지현하 / Ji Hyunha</dd>
											<dt>contact</dt>
											<dd>
												<a href="mailto:hyunha.ji@devco.kr">hyunha.ji@devco.kr</a>
											</dd>
										</dl>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
			<div
				id="container"
				style={{
					position: 'absolute',
					top: '-10000000000%',
					left: '-10000000000%',
					width: '100%',
					zIndex: '-1',
				}}
			>
				<div id="intro">
					HTML5, Javascript로 Caption Studio 라는 이름으로 웹에서 사용할 수 있는 자막 제작
					프로그램을 만들어 보았습니다.
					<ul>
						<li>- MP4 H.264 플레이 가능(최신 웹브라우저)</li>
						<li>- SMI 파일 불러오기</li>
						<li>- SMI, JSON, EXCEL 파일 저장</li>
						<li>- 단축키/설정 변경, 저장</li>
						<li>
							- 최종 작업 중인 자막 Storage저장으로 사이트 접속 시 마지막 작업된 내용 불어오기
						</li>
						<li>- 위지윅 기능 (단축키)</li>
					</ul>
					<p>가로 910px 이상 화면에 최적화 되어 있습니다.</p>
					<p>
						이전에 만들었던 온라인 자막 프로그램. <br />
						Caption Studio를 개선 하였습니다.
						<br />
						단순 개선이라기 보다는 거의 새로 만들다 시피해서 버전업이라고 해야 할 것 같습니다.
						<br />
						<br />
						1. 속도 개선
						<br />
						- 자막 로딩 속도, 동영상 플레이 시 렉 발생 등을 일정 부분 해결 하였습니다.
						<br />
						<br />
						2. UI 변경
						<br />
						- 색상을 모노톤으로 변경하였고, 일부 UI를 변경 하였습니다.
						<br />
						<br />
						3. 메모, 검색 기능 추가
						<br />
						- 자막 제작 시 편의성을 위해 각 타임라인 별 메모와 전체 검색 기능을 추가 하였습니다.
						<br />
						<br />
						4. SRT 자막 불러오기
						<br />
						- SMI 자막 뿐 아니라 SRT파일도 불러와서 편집 저장 하실수 있습니다.
						<br />
						<br />
						5. SRT, VTT 다운로드 추가
						<br />
						- 작업한 내용을 SRT 파일 또는 웹상에서 사용하는 WebVTT 포멧으로도 다운 받을 수 있습니다.
						<br />
						<br />
						6. SRT 형식 편집 추가
						<br />
						- SRT 형식의 편집 방식을 추가 하였습니다. (한방에 프로그램 방식 ↔ subtitle edit) 방식
						상호 변환
						<br />
						<br />
						7. Youtube, Vimeo 동영상 플레이 추가
						<br />
						- Youtube나 Vimeo 동영상의 공유 URL을 입력하여 동영상을 재상 할 수 있습니다.
						<br />
						<br />
						8. 기타 오류 개선
						<br />
						- 그 밖의 자막 제작시에 있던 오류를 개선하였습니다.
						<br />
						<br />
						<br />
						<br />
						개선이 불가능한 부분도 몇몇 있었는데,
						<br />
						<br />
						1. 브라우저별 사용가능 동영상의 제약
						<br />
						- 브라우저별플레이를 지원하는 포멧이 달라서, 가장 보편적인 포멧은 MP4 H.264 인것
						같습니다.
						<br />
						<br />
						2. 일부 사용 불가능한 단축키
						<br />
						- 마찬가지로 브라우저 기본적인 단축키라서 사용이 불가능한 것들도 있었습니다. 이를테면
						<br />
						탭을 닫을 때 쓰는 Ctrl + W 같은 단축키는 자막 프로그램을 닫아버려 쓸 수 없었습니다.
					</p>
				</div>
				<div id="menu-guide">
					<div className="header">
						<h3 className="subject">메뉴 설명</h3>
						<p>
							왼쪽 상단의 {'{menu}'} 버튼을 눌러 메뉴를 열고 닫을 수 있습니다. <br />
							메뉴는 5개 메뉴로 구성되어 있습니다.
						</p>
						<ul>
							<li>
								<a href="#menu-guide-1">새로 만들기</a>
							</li>
							<li>
								<a href="#menu-guide-2">동영상 가져오기</a>
							</li>
							<li>
								<a href="#menu-guide-3">자막 가져오기</a>
							</li>
							<li>
								<a href="#menu-guide-4">자막 내려받기</a>
							</li>
							<li>
								<a href="#menu-guide-5">설정</a>
							</li>
						</ul>
					</div>
					<div id="menu-guide-1" className="section">
						<h4 className="title">새로만들기</h4>
						<p>
							기존에 작업 중이던 내용과 히스토리는 삭제 시키고 새로운 자막을 작업하기 위한
							메뉴입니다. <br />
							<strong>{'{새로 만들기}'}</strong> 메뉴를 클릭하고 확인 창에서 YES 를 누르면, 새로운
							자막 작업을 할 수 있습니다.
						</p>
					</div>
					<div id="menu-guide-2" className="section">
						<div className="header">
							<h4 className="title">동영상 가져오기</h4>
							<p>
								동영상 플레이를 위해 동영상을 불러오는 메뉴입니다. <br />
								해당 메뉴는 4가지 방법으로 동영상을 불러옵니다.
							</p>
							<ul>
								<li>(FILE)내 컴퓨터(기기 저장장치)에 있는 파일</li>
								<li>(URL)외부 동영상 주소</li>
								<li>YOUTUBE 동영상 주소</li>
								<li>VIMEO 동영상 주소</li>
							</ul>
						</div>
						<div className="article">
							<h5 className="title">내 컴퓨터(기기 저장장치)에 있는 파일 불러오기</h5>
							{/* <img src="" alt="로컬파일 가져오기 GIF" /> */}
							<p>
								동영상 가져오기 창의 File 탭에서 "로컬에서 동영상 찾기" 를 클릭히여 동영상 파일을
								찾아 선택합니다. <br />
								동영상 파일을 선택한 후, 동영상 가져오기를 클릭하면 동영상 플레이어가 노출 됩니다.
							</p>
						</div>
						<div className="article">
							<h5 className="title">외부 동영상 주소 불러오기</h5>
							{/* <img src="" alt="로컬동영상 가져오기 GIF" /> */}
							<p>
								동영상 가져오기 창의 URL 탭에서 동영상 URL 입력을 클릭하여 mp4 동영상 주소를 입력한
								후, 동영상 가져오기를 클릭하면 동영상 플레이어가 노출 됩니다.
							</p>
						</div>
						<div className="article">
							<h5 className="title">YOUTUBE 동영상 주소 불러오기</h5>
							{/* <img src="" alt="YOUTUBE 동영상 가져오기 GIF" /> */}
							<p>
								동영상 가져오기 창의 YOUTUBE 탭에서 동영상 URL 입력을 클릭하여 YOUTUBE 동영상 주소를
								입력한 후, 동영상 가져오기를 클릭하면 동영상 플레이어가 노출 됩니다.
							</p>
						</div>
						<div className="article">
							<h5 className="title">VIMEO 동영상 주소 불러오기</h5>
							{/* <img src="" alt="VIMEO 동영상 가져오기 GIF" /> */}
							<p>
								동영상 가져오기 창의 VIMEO 탭에서 동영상 URL 입력을 클릭하여 VIMEO 동영상 주소를
								입력한 후, 동영상 가져오기를 클릭하면 동영상 플레이어가 노출 됩니다.
							</p>
							<dl>
								<dt>권장 동영상 파일 형식 / 코덱</dt>
								<dd>
									<table>
										<thead>
											<tr>
												<th scope="row">브라우저</th>
												<th scope="row">파일 형식</th>
												<th scope="row">코덱</th>
											</tr>
										</thead>
										<tbody>
											<tr>
												<th scope="col">Chrome</th>
												<td>mp4</td>
												<td>H.264, AAC</td>
											</tr>
											<tr>
												<th scope="col">Firefox</th>
												<td>mp4</td>
												<td>H.264, AAC</td>
											</tr>
											<tr>
												<th scope="col">Safari</th>
												<td>mp4</td>
												<td>H.264, AAC</td>
											</tr>
											<tr>
												<th scope="col">Edge</th>
												<td>mp4</td>
												<td>H.264, AAC</td>
											</tr>
											<tr>
												<th scope="col">iOS & Android</th>
												<td>mp4</td>
												<td>H.264, AAC</td>
											</tr>
										</tbody>
									</table>
									<p>
										권장 형식/코덱은 <strong>MP4 / H.264</strong> 입니다. WebM·Ogg는 브라우저 지원
										여부에 따라 재생될 수 있습니다.
									</p>
								</dd>
							</dl>
						</div>
					</div>
					<div id="menu-guide-3" className="section">
						<div className="header">
							<h4 className="title">자막 가져오기</h4>
							<p>
								기존 자막을 불러오는 메뉴입니다. <br />
								해당 메뉴는 3가지 방법으로 동영상을 불러옵니다.
							</p>
							<ul>
								<li>TEXT를 직접 입력</li>
								<li>SMI 파일 불러오기</li>
								<li>SRT 파일 불러오기</li>
							</ul>
						</div>
						<div className="article">
							<h5 className="title">TEXT를 직접 입력하기</h5>
							<p>
								자막 가져오기 창의 TEXT 탭에서 "자막 내용 입력" 영역에 자막 내용을 입력합니다.{' '}
								<br />
								해당 탭은 자막의 내용에만 입력 됩니다.
							</p>
							{/* <img src="" alt="TEXT 자막 가져오기 GIF" /> */}
							<p>
								줄바꿈(Enter)은 하나의 타임라인으로 인식합니다. <br />
								2줄 이상의 자막을 하나의 타임라인으로 하고 싶으면 &lt;br&gt; 태그를 사용합니다.{' '}
								<br />
								TEXT를 입력할때 자막 태그들도 적용 가능합니다.
							</p>
						</div>
						<div className="article">
							<h5 className="title">SMI 파일 불러오기</h5>
							{/* <img src="" alt="SMI 자막 가져오기 GIF" /> */}
							<p>
								자막 가져오기 창의 SMI 탭에서 "SMI 파일 찾기" 를 클릭히여 SMI 자막 파일을 찾아
								선택합니다. <br />
								SMI 자막 파일을 선택한 후, 자막 가져오기를 클릭하면 시트에 해당 자막 내용이 출력
								됩니다.
							</p>
							<p>
								이때, 선택 되어 있는 인코딩과 자막의 인코딩이 다를 경우 출력 된 내용의 글자들이
								깨지게 됩니다. <br />
								자막의 인코딩은 자막 가져오기 창의 우측 상단에서 변경이 가능합니다. <br />
								자막 파일의 인코딩은 UTF-8, EUC-KR, EUC-CN, EUC-TW, EUC-JP 중 하나를 선택 할 수
								있습니다.
							</p>
						</div>
						<div className="article">
							<h5 className="title">SRT 파일 불러오기</h5>
							{/* <img src="" alt="SRT 자막 가져오기 GIF" /> */}
							<p>
								자막 가져오기 창의 SRT 탭에서 "SRT 파일 찾기" 를 클릭히여 SRT 자막 파일을 찾아
								선택합니다. <br />
								SRT 자막 파일을 선택한 후, 자막 가져오기를 클릭하면 시트에 해당 자막 내용이 출력
								됩니다.
							</p>

							<p>
								이때, 선택 되어 있는 인코딩과 자막의 인코딩이 다를 경우 출력 된 내용의 글자들이
								깨지게 됩니다. <br />
								자막의 인코딩은 자막 가져오기 창의 우측 상단에서 변경이 가능합니다. <br />
								자막 파일의 인코딩은 UTF-8, EUC-KR, EUC-CN, EUC-TW, EUC-JP 중 하나를 선택 할 수
								있습니다.
							</p>
						</div>
					</div>
					<div id="menu-guide-4" className="section">
						<div className="header">
							<h4 className="title">자막 내려받기</h4>
							<p>
								작업한 자막을 내려받는 메뉴 입니다. <br />
								해당 메뉴는 SMI, SRT, VTT, JSON, EXCEL의 5가지 형식의 파일 중 선택하여 다운 받을 수
								있습니다.
							</p>
						</div>
						<div className="article">
							<h5 className="title">SMI 파일로 내려받기</h5>
							{/* <img src="" alt="SMI 자막 내려받기 GIF" /> */}
							<p>
								자막 내려받기 창의 SMI 탭에서 자막을 내려 받을 수 있습니다. <br />
								자막 내려받기 창의 우측 상단에서 원하는 파일 인코딩의 선택이 가능합니다. <br />
								"파일 명", "서명"을 입력한 후 자막 내려받기를 클릭합니다.
							</p>
							<p>
								여기서 서명이란, 동영상 플레이 할 때 표기 되지 않으면서 자막 파일 내에 원하는 내용를
								남기는 기능입니다. <br />
								서명은 주로 자막 제작자의 정보나 저작권등을 표기합니다.
							</p>
						</div>
						<div className="article">
							<h5 className="title">SRT 파일로 내려받기</h5>
							{/* <img src="" alt="SRT 자막 내려받기 GIF" /> */}
							<p>
								자막 내려받기 창의 SRT 탭에서 자막을 내려 받을 수 있습니다. <br />
								자막 내려받기 창의 우측 상단에서 원하는 파일 인코딩의 선택이 가능합니다.
							</p>
							<p>
								선택사항으로, "스타일 제거"라는 기능이 있습니다. <br />
								"스타일 제거"를 체크 한 상태로 자막을 내려 받으면 font color, bold, underline,
								italic등의 스타일이 제거된 상태로 자막이 저장 됩니다.
							</p>
						</div>
						<div className="article">
							<h5 className="title">VTT 파일로 내려받기</h5>
							{/* <img src="" alt="VTT 자막 내려받기 GIF" /> */}
							<p>
								자막 내려받기 창의 VTT 탭에서 자막을 내려 받을 수 있습니다. <br />
								자막 내려받기 창의 우측 상단에서 원하는 파일 인코딩의 선택이 가능합니다. <br />
								파일 명"을 입력한 후 자막 내려받기를 클릭합니다.
							</p>
							<p>
								선택사항으로, "스타일 제거"라는 기능이 있습니다. <br />
								"스타일 제거"를 체크 한 상태로 자막을 내려 받으면 font color, bold, underline,
								italic등의 스타일이 제거된 상태로 자막이 저장 됩니다.
							</p>
						</div>
						<div className="article">
							<h5 className="title">JSON 파일로 내려받기</h5>
							{/* <img src="" alt="JSON 자막 내려받기 GIF" /> */}
							<p>
								자막 내려받기 창의 JSON 탭에서 자막을 내려 받을 수 있습니다. <br />
								자막 내려받기 창의 우측 상단의 Select에서 JSON 파일의 구조를 SMI 또는 SRT로 선택할
								수 있습니다. <br />
								파일 명"을 입력한 후 자막 내려받기를 클릭합니다.
							</p>
							<p>
								JSON 파일의 SMI 구조는 싱크(시작 시간)만 있고, SRT 구조는 시작 시간과 종료시간이
								함께 있는 차이점을 가집니다.
							</p>
						</div>
						<div className="article">
							<h5 className="title">EXCEL 파일로 내려받기</h5>
							{/* <img src="" alt="EXCEL 자막 내려받기 GIF" /> */}
							<p>
								자막 내려받기 창의 EXCEL 탭에서 자막을 내려 받을 수 있습니다. <br />
								자막 내려받기 창의 우측 상단의 Select에서 EXCEL 파일의 테이블을 SMI 또는 SRT로
								선택할 수 있습니다. <br />
								파일 명"을 입력한 후 자막 내려받기를 클릭합니다.
							</p>
							<p>
								EXCEL 파일의 SMI 구조는 싱크(시작 시간)만 있고, SRT 구조는 시작 시간과 종료시간이
								함께 있는 차이점을 가집니다.
							</p>
						</div>
					</div>
					<div id="menu-guide-5" className="section">
						<div className="header">
							<h4 className="title">설정</h4>
							<p>Caption Studio의 언어, 자막 형식, 자막 이동 시간, 단축키를 변경 할 수 있습니다.</p>
						</div>
						<div className="article">
							<h5 className="title">언어 설정</h5>
							<p>
								설정창의 기본설정에서 변경 가능합니다. <br />
								한국어, 영어, 일본어를 지원합니다.
							</p>
						</div>
						<div className="article">
							<h5 className="title">자막 형식 설정</h5>
							<p>편집하는 시트의 형식을 SMI나 SRT형식으로 변경 할 수 있습니다.</p>
						</div>
						<div className="article">
							<h5 className="title">자막 이동 시간 설정</h5>
							<p>자막 싱크 변경 하는 단위 시간을 변경 할 수 있습니다.</p>
						</div>
						<div className="article">
							<h5 className="title">단축키 설정</h5>
							<p>기존의 단축키를 확인 할 수 있고, 일부 사용자 지정 단축키를 변경 할 수 있습니다.</p>
						</div>
					</div>
					<div className="aside">
						<a href="//blog.naver.com/pmr0622/220968233578">Caption Studio 블로그 설명서 1</a>
					</div>
				</div>
			</div>
			{/* 띠배너 100 */}
			<ins
				className="adsbygoogle"
				style={{ display: 'inline-block', width: '320px', height: '100px' }}
				data-ad-client="ca-pub-5713218026854731"
				data-ad-slot="2730780809"
			></ins>
		</Fragment>
	);
}
