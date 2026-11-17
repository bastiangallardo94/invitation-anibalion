"use client";

import { CHEST_LOOT, ITEM_NAMES } from "@/lib/items";
import { useGame } from "@/lib/store";
import { ItemIcon } from "@/components/icons";

export function ChestModal() {
  const chestItems = useGame((s) => s.chestItems);
  const take = useGame((s) => s.takeFromChest);
  const takeAll = useGame((s) => s.takeAllFromChest);
  const close = useGame((s) => s.setChestOpen);

  return (
    <div
      className="absolute inset-0 z-20 flex items-center justify-center bg-black/50 font-mono"
      onPointerDown={() => close(false)}
    >
      <div
        className="w-[min(92vw,420px)] rounded-lg border-4 border-[#5e3c1a] bg-[#c6a15b] p-5 shadow-2xl"
        onPointerDown={(e) => e.stopPropagation()}
      >
        <h2 className="mb-1 text-center text-xl font-bold text-[#3a2510]">
          Cofre
        </h2>
        <p className="mb-4 text-center text-xs text-[#5e3c1a]">
          Aquí está la dinamita y el mechero para hacerla explotar.
        </p>

        <div className="grid grid-cols-2 gap-2">
          {CHEST_LOOT.map((id) => {
            const has = chestItems.includes(id);
            return (
              <button
                key={id}
                disabled={!has}
                onClick={() => take(id)}
                className={`flex h-20 flex-col items-center justify-center gap-1 rounded border-2 p-1 text-[10px] font-bold transition ${
                  has
                    ? "border-[#3a2510] bg-[#e8d5a8] text-[#3a2510] hover:bg-[#f4e6c0]"
                    : "border-[#5e3c1a]/40 bg-[#b08d4c]/40 text-transparent"
                }`}
              >
                <ItemIcon id={id} size={32} />
                <span>{ITEM_NAMES[id]}</span>
              </button>
            );
          })}
        </div>

        <div className="mt-5 flex gap-2">
          <button
            onClick={takeAll}
            disabled={chestItems.length === 0}
            className="flex-1 rounded border-2 border-[#3a2510] bg-[#7ab648] px-4 py-2 font-bold text-white shadow transition hover:bg-[#8cc95a] disabled:cursor-not-allowed disabled:opacity-40"
          >
            Tomar todo
          </button>
          <button
            onClick={() => close(false)}
            className="flex-1 rounded border-2 border-[#3a2510] bg-[#a83f3f] px-4 py-2 font-bold text-white shadow transition hover:bg-[#c04b4b]"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
