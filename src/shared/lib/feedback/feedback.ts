import { toast } from 'sonner';

/** alert = toast.error — 레거시 `feedback.js` alert parity. 메서드 폼이 내부 `toast.type` 설정 → `classNames.error` 색상 적용 */
const alert = (message: string) => {
  toast.error(message);
};

/** success = toast.success — 레거시 `feedback.js` success parity. 메서드 폼이 내부 `toast.type` 설정 → `classNames.success` 색상 적용 */
const success = (message: string) => {
  toast.success(message);
};

export { alert, success };
