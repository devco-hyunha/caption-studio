import { Toaster as SonnerToaster } from 'sonner';

/** toast 셸 — 레거시 `toast.js` parity: 상단 중앙·2000ms 자동 소멸·클릭 dismiss·타입별 색상 */
const Toaster = () => {
  return (
    <SonnerToaster
      position="top-center"
      duration={2000}
      closeButton={false}
      toastOptions={{
        // 레거시 `.toast`: 흰색 중앙 정렬·300px·word-break
        classNames: {
          toast: 'toast w-75 text-center text-white [word-break:keep-all] border-black/20 rounded',
          title: 'toast-title font-bold',
          description: 'toast-message',
          success: 'toast-success bg-[#3498db]',
          error: 'toast-error bg-[#e74c3c]',
          info: 'toast-info bg-[#333]',
          warning: 'toast-warning bg-[#f1c40f] !text-black',
        },
      }}
    />
  );
};

export { Toaster };
