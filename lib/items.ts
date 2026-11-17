export type ItemId = "tnt" | "lighter";

export const ITEM_NAMES: Record<ItemId, string> = {
  tnt: "Invitación explosiva",
  lighter: "Mechero",
};

export const CHEST_LOOT: ItemId[] = ["tnt", "lighter"];

export const HOTBAR_ITEMS: ItemId[] = ["tnt", "lighter"];
