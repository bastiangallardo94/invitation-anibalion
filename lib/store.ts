import { create } from "zustand";
import { CHEST_LOOT, type ItemId } from "./items";

export type Phase = "none" | "placed" | "lit" | "exploding" | "done";

function emptyInventory(): Record<ItemId, number> {
  return { tnt: 0, lighter: 0 };
}

interface GameState {
  inventory: Record<ItemId, number>;
  chestItems: ItemId[];
  chestOpen: boolean;
  nearChest: boolean;
  nearTnt: boolean;
  locked: boolean;
  phase: Phase;
  tntPos: [number, number, number] | null;
  invitationShown: boolean;

  setNearChest: (v: boolean) => void;
  setNearTnt: (v: boolean) => void;
  setChestOpen: (v: boolean) => void;
  setLocked: (v: boolean) => void;
  takeFromChest: (id: ItemId) => void;
  takeAllFromChest: () => void;
  placeTnt: (pos: [number, number, number]) => void;
  igniteTnt: () => void;
  setPhase: (p: Phase) => void;
  showInvitation: () => void;
  hideInvitation: () => void;
  reset: () => void;
}

export const useGame = create<GameState>((set, get) => ({
  inventory: emptyInventory(),
  chestItems: [...CHEST_LOOT],
  chestOpen: false,
  nearChest: false,
  nearTnt: false,
  locked: false,
  phase: "none",
  tntPos: null,
  invitationShown: false,

  setNearChest: (v) => set({ nearChest: v }),
  setNearTnt: (v) => set({ nearTnt: v }),
  setChestOpen: (v) => set({ chestOpen: v }),
  setLocked: (v) => set({ locked: v }),

  takeFromChest: (id) => {
    const { chestItems, inventory } = get();
    const idx = chestItems.indexOf(id);
    if (idx === -1) return;
    const next = chestItems.slice();
    next.splice(idx, 1);
    set({
      chestItems: next,
      inventory: { ...inventory, [id]: inventory[id] + 1 },
    });
  },

  takeAllFromChest: () => {
    const { chestItems, inventory } = get();
    const inv = { ...inventory };
    for (const id of chestItems) inv[id] = inv[id] + 1;
    set({ chestItems: [], inventory: inv });
  },

  placeTnt: (pos) => {
    const { inventory } = get();
    if (inventory.tnt <= 0) return;
    set({
      inventory: { ...inventory, tnt: inventory.tnt - 1 },
      tntPos: pos,
      phase: "placed",
      chestOpen: false,
    });
  },

  igniteTnt: () => {
    const { phase, inventory } = get();
    if (phase !== "placed" || inventory.lighter <= 0) return;
    set({ phase: "lit" });
  },

  setPhase: (p) => set({ phase: p }),
  showInvitation: () => set({ invitationShown: true }),
  hideInvitation: () => set({ invitationShown: false }),

  reset: () =>
    set({
      inventory: emptyInventory(),
      chestItems: [...CHEST_LOOT],
      chestOpen: false,
      nearTnt: false,
      phase: "none",
      tntPos: null,
      invitationShown: false,
    }),
}));
