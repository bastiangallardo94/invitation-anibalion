import type { ItemId } from "@/lib/items";

export function ItemIcon({ id, size = 36 }: { id: ItemId; size?: number }) {
  switch (id) {
    case "tnt":
      return (
        <svg width={size} height={size} viewBox="0 0 40 40" aria-hidden>
          <rect x="4" y="4" width="32" height="32" rx="3" fill="#c0392b" stroke="#7a1a12" strokeWidth="2" />
          <rect x="4" y="17" width="32" height="6" fill="#f2ead8" />
          <text
            x="20"
            y="22.6"
            textAnchor="middle"
            fontSize="7"
            fontWeight="900"
            fill="#1a1a1a"
            fontFamily="monospace"
          >
            TNT
          </text>
          <path d="M9 9 l1.5 3 3 1.5 -3 1.5 -1.5 3 -1.5 -3 -3 -1.5 3 -1.5 Z" fill="#ffffff" />
          <path d="M31 8 l1.3 2.6 2.6 1.3 -2.6 1.3 -1.3 2.6 -1.3 -2.6 -2.6 -1.3 2.6 -1.3 Z" fill="#ffe066" />
          <path d="M9 29 l1.2 2.4 2.4 1.2 -2.4 1.2 -1.2 2.4 -1.2 -2.4 -2.4 -1.2 2.4 -1.2 Z" fill="#ff9bd2" />
        </svg>
      );
    case "lighter":
      return (
        <svg width={size} height={size} viewBox="0 0 40 40" aria-hidden>
          <rect x="12" y="10" width="16" height="22" rx="3" fill="#8a8f96" stroke="#565b60" strokeWidth="2" />
          <rect x="12" y="14" width="16" height="3" fill="#6b7076" />
          <rect x="16" y="6" width="8" height="8" rx="1" fill="#4a3b2a" stroke="#2c2016" strokeWidth="2" />
          <path d="M27 9 l1.5 3 3 1.5 -3 1.5 -1.5 3 -1.5 -3 -3 -1.5 3 -1.5 Z" fill="#ffe066" />
        </svg>
      );
  }
}
