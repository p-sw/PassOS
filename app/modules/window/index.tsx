import {
  useWindowStore,
  windowStore,
  internalStateRefSymbol,
} from "~/stores/window";
import { Window } from "./window";
import { useEffect } from "react";
import { handleKey } from "~/utils/keyboardHandler";
import { AnimatePresence } from "motion/react";

export default function Windows() {
  const [windows, _, popWindow] = useWindowStore();

  useEffect(() => {
    function keydownEventHandler(e: KeyboardEvent) {
      handleKey(e, { ctrl: true }, "c", () => {
        const hoveredWindow = windowStore.windows.find(
          ({ [internalStateRefSymbol]: state }) => state.isHovered,
        )?.id;
        hoveredWindow && popWindow(hoveredWindow);
      });
    }

    window.addEventListener("keydown", keydownEventHandler);

    return () => {
      window.removeEventListener("keydown", keydownEventHandler);
    };
  }, []);

  return (
    <div className="module">
      <AnimatePresence>
        {windows.map((ctx) => {
          return <Window key={ctx.id} {...ctx}></Window>;
        })}
      </AnimatePresence>
    </div>
  );
}
