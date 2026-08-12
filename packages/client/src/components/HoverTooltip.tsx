import { useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";

interface Props {
  content: ReactNode;
  children: ReactNode;
  /** Use a wider max-width (for content with side-by-side mini cards, e.g. chain previews). */
  wide?: boolean;
}

const MARGIN = 8;

/**
 * Renders `content` in a fixed-position portal on hover, positioned from the trigger's
 * bounding rect. A portal (rather than CSS absolute positioning) is required because the
 * trigger often sits inside horizontally-scrollable containers (overflow-x: auto), which
 * per the CSS spec also clips the other axis — an absolutely-positioned tooltip would be
 * silently cut off there.
 */
export function HoverTooltip({ content, children, wide }: Props) {
  const triggerRef = useRef<HTMLSpanElement>(null);
  const [pos, setPos] = useState<{ top: number; left: number; flip: boolean } | null>(null);

  function show() {
    const rect = triggerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const flip = rect.top < 90; // not enough room above; show below instead
    // Half the tooltip's own max-width, so a wide tooltip near a screen edge clamps by its
    // actual half-width instead of a fixed guess (which would still let it run off-screen).
    const halfWidth = (wide ? 420 : 220) / 2;
    setPos({
      top: flip ? rect.bottom + MARGIN : rect.top - MARGIN,
      left: Math.min(Math.max(rect.left + rect.width / 2, halfWidth + MARGIN), window.innerWidth - halfWidth - MARGIN),
      flip,
    });
  }

  return (
    <span ref={triggerRef} className="hover-tooltip-trigger" onMouseEnter={show} onMouseLeave={() => setPos(null)}>
      {children}
      {pos &&
        createPortal(
          <div
            className={`card-tooltip-portal${wide ? " card-tooltip-portal--wide" : ""}`}
            style={{ top: pos.top, left: pos.left, transform: `translate(-50%, ${pos.flip ? "0" : "-100%"})` }}
          >
            {content}
          </div>,
          document.body,
        )}
    </span>
  );
}
