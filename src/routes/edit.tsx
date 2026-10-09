import { createFileRoute } from '@tanstack/react-router';

const EditPage = () => {
	return (
		<main className="bg-background text-foreground flex min-h-screen items-center justify-center px-6 font-sans">
			<div className="max-w-md space-y-2 text-center">
				<h1 className="text-2xl font-bold tracking-tight">Edit</h1>
				<p className="text-muted-foreground text-sm">
					자막 편집 화면 자리입니다. 폰트 시편은 <code className="text-xs">/dev/fonts</code> 로
					이동했습니다.
				</p>
			</div>
		</main>
	);
};

export const Route = createFileRoute('/edit')({
	component: EditPage,
});
