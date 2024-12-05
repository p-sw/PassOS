import { ReactNode } from "@tanstack/react-router";
import { motion } from "motion/react";
import { useContext } from "react";
import { ClickContext } from "~/context/click.context";
import { KeyContext } from "~/context/key.context";
import { useWindowState, WindowContext, windowStore } from "~/stores/window";

export function Window({
  id,
  children,
  ...ctx
}: WindowContext & { children?: ReactNode }) {
  const keys = useContext(KeyContext);
  const clicks = useContext(ClickContext);
  const [state, updateState] = useWindowState(id);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.5 }}
      style={{ top: state.y, left: state.x }}
      className="bg-black/50 rounded-xl min-w-xs min-h-60 absolute translate-x-[50%] translate-y-[50%] outline-black outline-solid outline-0 hover:outline-2 transition-[outline]"
      onMouseOver={() =>
        updateState((p) => {
          p.isHovered = true;
        })
      }
      onMouseOut={() =>
        updateState((p) => {
          p.isHovered = false;
        })
      }
      onMouseMove={(e) => {
        if (keys.specials.ctrl && clicks.left) {
          windowStore.updateState(id, (p) => {
            p.x = p.x + e.movementX;
            p.y = p.y + e.movementY;
          });
        }
      }}
    >
      {children}
    </motion.div>
  );
}
