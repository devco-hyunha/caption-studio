import { useEffect } from 'react';
import { Link } from '@tanstack/react-router';
import { useT } from '@/shared/lib/i18n';
import { Button } from '@/shared/ui/button';

export const NotFound = () => {
  const title = useT('notFound.title');
  const desc = useT('notFound.desc');
  const home = useT('notFound.home');
  const homeAria = useT('notFound.homeAria');

  useEffect(() => {
    document.title = '404 — Caption Studio';
  }, []);

  return (
    <main
      className="relative flex min-h-dvh flex-col items-center justify-center overflow-hidden px-6 text-center"
      aria-labelledby="not-found-title"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_oklch(0.97_0.02_250)_0%,_transparent_55%),linear-gradient(180deg,_oklch(0.99_0.005_90)_0%,_oklch(0.96_0.01_240)_100%)]"
      />
      <div className="relative z-10 flex max-w-md flex-col items-center gap-6">
        <p className="font-heading text-muted-foreground text-sm font-medium tracking-[0.2em] uppercase">
          Caption Studio
        </p>
        <p
          className="font-heading text-foreground/90 text-[clamp(4.5rem,18vw,7rem)] leading-none font-semibold tracking-tight"
          aria-hidden="true"
        >
          404
        </p>
        <h1
          id="not-found-title"
          className="font-heading text-foreground text-2xl font-semibold tracking-tight"
        >
          {title}
        </h1>
        <p className="text-muted-foreground text-base">{desc}</p>
        <Button asChild size="lg" aria-label={homeAria}>
          <Link to="/">{home}</Link>
        </Button>
      </div>
    </main>
  );
};
