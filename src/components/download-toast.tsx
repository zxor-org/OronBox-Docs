'use client';

import { useEffect, useState } from 'react';

const EVENT_NAME = 'oronbox:download-toast';

export function announceDownloadToast(message: string) {
  window.dispatchEvent(
    new CustomEvent(EVENT_NAME, {
      detail: { message },
    }),
  );
}

/** A small top-of-page notice used while a GitHub mirror is being measured. */
export function DownloadToast() {
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined;
    const onToast = (event: Event) => {
      const detail = (event as CustomEvent<{ message?: string }>).detail;
      if (!detail?.message) return;
      setMessage(detail.message);
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => setMessage(null), 2600);
    };

    window.addEventListener(EVENT_NAME, onToast);
    return () => {
      window.removeEventListener(EVENT_NAME, onToast);
      if (timer) clearTimeout(timer);
    };
  }, []);

  if (!message) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="pointer-events-none fixed inset-x-0 top-4 z-[100] flex justify-center px-4"
    >
      <div className="rounded-full bg-[var(--md-sys-color-inverse-surface,#313033)] px-4 py-2 text-sm font-medium text-[var(--md-sys-color-inverse-on-surface,#f4eff4)] shadow-lg">
        {message}
      </div>
    </div>
  );
}
