import { KeyboardEvent as ReactKeyboardEvent } from "react";

export function handleKey(
  e: KeyboardEvent | ReactKeyboardEvent,
  special: {
    ctrl?: boolean;
    shift?: boolean;
    meta?: boolean;
  },
  key: string,
  callback: () => void,
) {
  if (e.ctrlKey !== !!special.ctrl) return;
  if (e.shiftKey !== !!special.shift) return;
  if (e.metaKey !== !!special.meta) return;
  if (e.key !== key) return;

  callback();
}
