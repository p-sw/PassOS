import { createContext } from "react";

export interface IClickContext {
  left: boolean; // 0
  wheel: boolean; // 1
  right: boolean; // 2
}

export const ClickContext = createContext<IClickContext>({
  left: false,
  wheel: false,
  right: false,
});
