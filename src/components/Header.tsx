import { Moon, Sun } from 'lucide-react';

interface HeaderProps {
  dark: boolean;
  onToggleTheme: () => void;
}

export function Header({ dark, onToggleTheme }: HeaderProps) {
  return (
    <header className="sticky top-0 z-30 border-b border-neutral-200/70 bg-white/80 backdrop-blur-lg dark:border-neutral-800/70 dark:bg-neutral-950/80">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-5 py-4 sm:px-8">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 overflow-hidden rounded-xl bg-transparent shadow-sm shadow-accent-500/30">
            <img src="/logo.svg" alt="EarCheck Logo" className="h-full w-full object-cover" />
          </div>
          <div>
            <h1 className="text-base font-semibold leading-tight text-neutral-900 dark:text-white">
              EarCheck - Headset Tester
            </h1>
            <p className="text-[11px] leading-tight text-neutral-500 dark:text-neutral-400">
              Browser mic &amp; headset diagnostics
            </p>
          </div>
        </div>

        <button
          onClick={onToggleTheme}
          aria-label="Toggle dark mode"
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-neutral-200 text-neutral-600 transition-colors hover:bg-neutral-100 dark:border-neutral-800 dark:text-neutral-400 dark:hover:bg-neutral-800"
        >
          {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </button>
      </div>
    </header>
  );
}
