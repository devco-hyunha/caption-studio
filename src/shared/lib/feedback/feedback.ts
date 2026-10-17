import { toast } from 'sonner';

/** alert = toast.error — 메서드 폼이 내부 `toast.type` 설정 → `classNames.error` 색상 적용 */
const alert = (message: string) => {
  toast.error(message);
};

/** success = toast.success — 메서드 폼이 내부 `toast.type` 설정 → `classNames.success` 색상 적용 */
const success = (message: string) => {
  toast.success(message);
};

export { alert, success };
