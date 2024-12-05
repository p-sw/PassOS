import { createContext } from "react";

export interface IKeyContext {
  specials: {
    ctrl: boolean;
    shift: boolean;
    meta: boolean;
  };
  presses: string[];
}

export const KeyContext = createContext<IKeyContext>({
  specials: {
    ctrl: false,
    shift: false,
    meta: false,
  },
  presses: [],
});
