import { bindEvent } from '../../utils/dom.js';

/**
 * 창 resize · 바깥 클릭(편집 해제)을 바인딩한다.
 *
 * @param {object} sheet
 */
const bindWindow = (sheet) => {
	const resizeEvent = 'orientationchange' in window ? 'orientationchange' : 'resize';
	let originHeight = window.innerHeight;

	bindEvent({
		target: window,
		event: `${resizeEvent}.sheet`,
		handler: () => {
			sheet.stateUpdate();
			const height = window.innerHeight;
			if (originHeight !== height) {
				sheet.needsRedraw = true;
				sheet.render();
			}
			originHeight = height;
		},
	});

	bindEvent({
		target: window,
		event: 'click.sheet',
		handler: () => {
			if (!sheet.edit.state) return;
			sheet.edit.cmd('unselect');
			sheet.edit.off();
		},
	});
};

export { bindWindow };
