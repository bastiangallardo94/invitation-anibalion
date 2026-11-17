import { useEffect, useState } from "react";

export function useIsTouch() {
  const [touch, setTouch] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(pointer: coarse)");
    const update = (e?: MediaQueryListEvent) => setTouch(e?.matches ?? mq.matches);
    update();
    mq.addEventListener?.("change", update);
    return () => mq.removeEventListener?.("change", update);
  }, []);

  return touch;
}
