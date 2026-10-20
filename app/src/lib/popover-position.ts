const MARGIN = 8;

export function placePopover(button: HTMLElement, panel: HTMLElement, maxWidth = 320, side: "top" | "bottom" = "bottom") {
  const rect = button.getBoundingClientRect();
  const width = Math.min(maxWidth, window.innerWidth - MARGIN * 2);
  panel.style.width = `${width}px`;
  let left = rect.left;
  if (left + width > window.innerWidth - MARGIN) left = window.innerWidth - width - MARGIN;
  if (left < MARGIN) left = MARGIN;
  const height = panel.offsetHeight;
  const below = rect.bottom + 6;
  const above = rect.top - height - 6;
  const fitsAbove = above >= MARGIN;
  const top = side === "top" ? (fitsAbove ? above : below) : (below + height > window.innerHeight - MARGIN && fitsAbove ? above : below);
  panel.style.left = `${left}px`;
  panel.style.top = `${Math.max(MARGIN, top)}px`;
  panel.classList.add("is-placed");
}
