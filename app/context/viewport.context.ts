import { createContext } from "react";

export interface IViewportContext {
  width: number;
  height: number;
}

export const ViewportContext = createContext<IViewportContext>({
  width: 0,
  height: 0,
});
