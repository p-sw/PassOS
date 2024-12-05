import { useSyncExternalStore } from "react";

export const globalWindowListenersSymbol = Symbol(
  "globalWindowListenersSymbol",
);
export const internalStateRefSymbol = Symbol("internalStateRefSymbol");

export interface WindowContext {
  id: string;
  initialX?: number;
  initialY?: number;
}

interface WindowState {
  isHovered: boolean;
  isPressed: boolean;
  x: number;
  y: number;
}

const defaultWindowState = (ctx: WindowContext): WindowState => ({
  isHovered: false,
  isPressed: false,
  x: ctx.initialX ?? window.innerWidth / 2,
  y: ctx.initialY ?? window.innerHeight / 2,
});

export type WindowInternalContext = WindowContext & {
  [internalStateRefSymbol]: WindowState;
};

export type WindowStoreEvent = "push" | "pop";
export class WindowStore {
  _id: number = 0;
  windows: WindowInternalContext[] = [];
  undeads: WindowInternalContext[] = [];
  listeners: Record<
    string | typeof globalWindowListenersSymbol,
    (() => void)[]
  > = {
    [globalWindowListenersSymbol]: [],
  };

  private _silentlyPushWindow(ctx: Omit<WindowContext, "id">) {
    const id = (++this._id).toString();
    const completeCtx = { ...ctx, id };
    this.windows = [
      ...this.windows,
      {
        ...completeCtx,
        [internalStateRefSymbol]: defaultWindowState(completeCtx),
      },
    ];
    return this._id;
  }

  pushWindow(ctx: Omit<WindowContext, "id">) {
    const newId = this._silentlyPushWindow(ctx);
    this.notifyUpdate(globalWindowListenersSymbol);
    return newId;
  }

  private _silentlyPopWindow(id: string) {
    const poppedWindow = this.windows.find(({ id: _id }) => _id === id);
    if (!poppedWindow) return null;

    this.windows = this.windows.filter(({ id: _id }) => _id !== id);
    this.undeads = [...this.undeads, poppedWindow];

    return poppedWindow;
  }

  popWindow(id: string) {
    const poppedWindow = this._silentlyPopWindow(id);
    this.notifyUpdate(globalWindowListenersSymbol);
    return poppedWindow;
  }

  private _silentlySetState(id: string, state: WindowState) {
    const idx = this.windows.findIndex(({ id: _id }) => _id === id);
    if (idx < 0) return;
    this.windows[idx][internalStateRefSymbol] = { ...state };
  }

  private _silentlyUpdateState(id: string, updator: (p: WindowState) => void) {
    const snapshot = this.getStateSnapshot(id);
    updator(snapshot);
    this._silentlySetState(id, snapshot);
  }

  setState(id: string, state: WindowState) {
    this._silentlySetState(id, state);
    this.notifyUpdate(id);
  }

  updateState(id: string, updator: (p: WindowState) => void) {
    this._silentlyUpdateState(id, updator);
    this.notifyUpdate(id);
  }

  subscribe(
    notifyId: string | typeof globalWindowListenersSymbol,
    listener: () => void,
  ) {
    if (!(notifyId in this.listeners)) this.listeners[notifyId] = [];
    this.listeners[notifyId].push(listener);

    return () => {
      this.listeners[notifyId] = this.listeners[notifyId].filter(
        (l) => l !== listener,
      );
    };
  }

  notifyUpdate(notifyId: string | typeof globalWindowListenersSymbol) {
    if (typeof notifyId === "string") {
      this.listeners[notifyId].forEach((listener) => listener());
    } else {
      for (const key of [
        ...Object.keys(this.listeners),
        globalWindowListenersSymbol as typeof globalWindowListenersSymbol,
      ]) {
        for (let listener of this.listeners[key]) {
          listener();
        }
      }
    }
  }

  getSnapshot() {
    return this.windows;
  }

  getStateSnapshot(id: string) {
    const liveState = this.windows.find(({ id: _id }) => _id === id);
    if (liveState) return liveState[internalStateRefSymbol];
    const deadState = this.undeads.find(({ id: _id }) => _id === id);
    return deadState![internalStateRefSymbol];
  }
}

export const windowStore = new WindowStore();

export function useWindowStore(
  listenTo?: string,
): [
  typeof WindowStore.prototype.windows,
  typeof WindowStore.prototype.pushWindow,
  typeof WindowStore.prototype.popWindow,
] {
  const boundSubscribe = windowStore.subscribe.bind(
    windowStore,
    listenTo ?? globalWindowListenersSymbol,
  ) as (listener: () => void) => () => void;
  const boundGetSnapshot = windowStore.getSnapshot.bind(
    windowStore,
  ) as typeof windowStore.getSnapshot;
  const boundPushWindow = windowStore.pushWindow.bind(
    windowStore,
  ) as typeof windowStore.pushWindow;
  const boundPopWindow = windowStore.popWindow.bind(
    windowStore,
  ) as typeof windowStore.popWindow;

  const windows = useSyncExternalStore(
    boundSubscribe,
    boundGetSnapshot,
    boundGetSnapshot,
  );

  return [windows, boundPushWindow, boundPopWindow];
}

export function useWindowState(
  id: string,
): [
  ReturnType<typeof WindowStore.prototype.getStateSnapshot>,
  (updator: (p: WindowState) => void) => void,
] {
  const boundSubscribe = windowStore.subscribe.bind(windowStore, id) as (
    listener: () => void,
  ) => () => void;
  const boundGetSnapshot = windowStore.getStateSnapshot.bind(
    windowStore,
    id,
  ) as () => ReturnType<typeof windowStore.getStateSnapshot>;
  const boundUpdateState = windowStore.updateState.bind(windowStore, id) as (
    updator: (p: WindowState) => void,
  ) => void;

  const state = useSyncExternalStore(
    boundSubscribe,
    boundGetSnapshot,
    boundGetSnapshot,
  );

  return [state, boundUpdateState];
}
