"use client";

import { HOTBAR_ITEMS, ITEM_NAMES } from "@/lib/items";
import { useGame } from "@/lib/store";
import { ItemIcon } from "@/components/icons";

export function Hotbar() {
  const inventory = useGame((s) => s.inventory);

  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-3 flex justify-center">
      <div className="flex gap-1.5 rounded border-2 border-black/60 bg-black/40 p-1.5 shadow-lg">
        {HOTBAR_ITEMS.map((id) => {
          const count = inventory[id];
          return (
            <div
              key={id}
              title={ITEM_NAMES[id]}
              className="relative flex h-14 w-14 items-center justify-center rounded border-2 border-white/20 bg-white/10"
            >
              <ItemIcon id={id} size={34} />
              {count > 0 && (
                <span className="absolute bottom-0.5 right-1 text-sm font-bold text-white drop-shadow">
                  {count}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
