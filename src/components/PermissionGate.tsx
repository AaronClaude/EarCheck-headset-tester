import { AlertTriangle, Mic, ShieldOff, X } from 'lucide-react';

interface PermissionGateProps {
  onAllow: () => void;
}

export function PermissionGate({ onAllow }: PermissionGateProps) {
  return (
    <div className="animate-fade-in rounded-2xl border border-neutral-200 bg-white p-8 text-center shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
      <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-accent-50 text-accent-600 dark:bg-accent-500/15 dark:text-accent-400">
        <Mic className="h-8 w-8" strokeWidth={1.8} />
      </div>
      <h2 className="mb-2 text-xl font-semibold text-neutral-900 dark:text-white">
        Test your microphone
      </h2>
      <p className="mx-auto mb-6 max-w-md text-sm leading-relaxed text-neutral-500 dark:text-neutral-400">
        We need access to your microphone to show live input levels, let you listen back, and record
        a short test clip. Audio never leaves your browser.
      </p>
      <button
        onClick={onAllow}
        className="inline-flex items-center justify-center gap-2 rounded-xl bg-accent-500 px-6 py-3 text-sm font-semibold text-white shadow-sm shadow-accent-500/30 transition-all hover:bg-accent-600"
      >
        <Mic className="h-4 w-4" />
        Allow Microphone Access
      </button>
      <p className="mt-4 text-xs text-neutral-400 dark:text-neutral-500">
        Your browser will show a permission prompt. Click &ldquo;Allow&rdquo; to continue.
      </p>
    </div>
  );
}

interface DeniedStateProps {
  onRetry: () => void;
  onDismiss: () => void;
}

export function DeniedState({ onRetry, onDismiss }: DeniedStateProps) {
  return (
    <div className="animate-fade-in rounded-2xl border border-red-200 bg-red-50 p-6 dark:border-red-500/30 dark:bg-red-500/10">
      <div className="flex items-start gap-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-100 text-red-600 dark:bg-red-500/20 dark:text-red-400">
          <ShieldOff className="h-5 w-5" />
        </div>
        <div className="flex-1">
          <h3 className="text-sm font-semibold text-red-900 dark:text-red-200">
            Microphone access blocked
          </h3>
          <p className="mt-1 text-sm text-red-700 dark:text-red-300/80">
            To test your headset, allow microphone access for this site:
          </p>
          <ol className="mt-3 space-y-1.5 pl-5 text-sm text-red-700/90 list-decimal dark:text-red-300/80">
            <li>Click the camera/mic icon in your browser&apos;s address bar.</li>
            <li>Set the microphone permission to &ldquo;Allow&rdquo;.</li>
            <li>Reload the page or click retry below.</li>
          </ol>
          <div className="mt-4 flex gap-2">
            <button
              onClick={onRetry}
              className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700"
            >
              Retry
            </button>
            <button
              onClick={onDismiss}
              className="rounded-lg border border-red-200 px-4 py-2 text-sm font-medium text-red-700 transition-colors hover:bg-red-100 dark:border-red-500/30 dark:text-red-300 dark:hover:bg-red-500/10"
            >
              <X className="inline h-4 w-4" /> Dismiss
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function ErrorBanner({ message, onDismiss }: { message: string; onDismiss: () => void }) {
  return (
    <div className="animate-fade-in flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-500/30 dark:bg-amber-500/10">
      <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600 dark:text-amber-400" />
      <p className="flex-1 text-sm text-amber-800 dark:text-amber-300">{message}</p>
      <button onClick={onDismiss} className="text-amber-400 hover:text-amber-600" aria-label="Dismiss">
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
