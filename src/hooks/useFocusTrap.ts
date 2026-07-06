import { useRef } from 'react';

export function useFocusTrap<T extends HTMLElement>() {
  const ref = useRef<T>(null);



  const handleKeyDown = (e: React.KeyboardEvent<T>) => {
    if (e.key !== 'Tab') return;

    const focusable = ref.current?.querySelectorAll<HTMLElement>(
      `input:not([disabled]),select:not([disabled]),textarea:not([disabled]),button:not([disabled]),a[href],[tabindex]:not([tabindex="-1"])`
    );

    if (!focusable?.length) return;

    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    if (!first || !last) return;

    if (e.shiftKey) {
      if (document.activeElement === first) {
        e.preventDefault();
        last.focus();
      }
    } else {
      if (document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  };

  return { ref, handleKeyDown };
}
