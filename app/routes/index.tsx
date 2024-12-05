import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ClickContext, IClickContext } from "~/context/click.context";
import { type IKeyContext, KeyContext } from "~/context/key.context";
import { IViewportContext, ViewportContext } from "~/context/viewport.context";
import Windows from "~/modules/window";
import { windowStore } from "~/stores/window";

export const Route = createFileRoute("/")({
  component: Component,
});

function Component() {
  const [keyState, setKeyState] = useState<IKeyContext>({
    specials: {
      ctrl: false,
      shift: false,
      meta: false,
    },
    presses: [],
  });
  const [viewportState, setViewportState] = useState<IViewportContext>({
    width: 0,
    height: 0,
  });
  const [clickState, setClickState] = useState<IClickContext>({
    left: false,
    wheel: false,
    right: false,
  });

  useEffect(() => {
    setViewportState({
      width: window.innerWidth,
      height: window.innerHeight,
    });

    function keydownEventHandler(e: KeyboardEvent) {
      setKeyState((p) => ({
        specials: {
          ctrl: e.ctrlKey,
          shift: e.shiftKey,
          meta: e.metaKey,
        },
        presses: p.presses.includes(e.key) ? p.presses : [...p.presses, e.key],
      }));
    }

    function keyupEventHandler(e: KeyboardEvent) {
      setKeyState((p) => ({
        specials: {
          ctrl: e.ctrlKey,
          shift: e.shiftKey,
          meta: e.metaKey,
        },
        presses: p.presses.filter((k) => k !== e.key),
      }));
    }

    function resizeEventHandler(e: UIEvent) {
      setViewportState({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    }

    function mousedownEventHandler(e: MouseEvent) {
      switch (e.button) {
        case 0:
          setClickState((p) => ({ ...p, left: true }));
          break;
        case 1:
          setClickState((p) => ({ ...p, wheel: true }));
          break;
        case 2:
          setClickState((p) => ({ ...p, right: true }));
          break;
      }
    }

    function mouseupEventHandler(e: MouseEvent) {
      switch (e.button) {
        case 0:
          setClickState((p) => ({ ...p, left: false }));
          break;
        case 1:
          setClickState((p) => ({ ...p, wheel: false }));
          break;
        case 2:
          setClickState((p) => ({ ...p, right: false }));
          break;
      }
    }

    function contextmenuEventHandler(e: UIEvent) {
      e.preventDefault();
      // todo: implement custom context menu
    }

    window.addEventListener("keydown", keydownEventHandler);
    window.addEventListener("keyup", keyupEventHandler);
    window.addEventListener("resize", resizeEventHandler);
    window.addEventListener("mousedown", mousedownEventHandler);
    window.addEventListener("mouseup", mouseupEventHandler);
    window.addEventListener("contextmenu", contextmenuEventHandler);

    return () => {
      window.removeEventListener("keydown", keydownEventHandler);
      window.removeEventListener("keyup", keyupEventHandler);
      window.removeEventListener("resize", resizeEventHandler);
      window.removeEventListener("mousedown", mousedownEventHandler);
      window.removeEventListener("mouseup", mouseupEventHandler);
      window.removeEventListener("contextmenu", contextmenuEventHandler);
    };
  }, []);

  return (
    <ClickContext.Provider value={clickState}>
      <ViewportContext.Provider value={viewportState}>
        <KeyContext.Provider value={keyState}>
          <button
            onClick={() => windowStore.pushWindow({})}
            className="bg-gray-500 p-10 relative z-10"
          >
            Hey
          </button>
          <Windows />
        </KeyContext.Provider>
      </ViewportContext.Provider>
    </ClickContext.Provider>
  );
}
