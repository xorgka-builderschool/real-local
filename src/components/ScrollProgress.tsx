import { useEffect, useState, type RefObject } from "react";
import "./ScrollProgress.css";

export function ScrollProgress({ targetRef }: { targetRef: RefObject<HTMLElement | null> }) {
  const [progress, setProgress] = useState(0);
  const [thumbRatio, setThumbRatio] = useState(1);

  useEffect(() => {
    const el = targetRef.current;
    if (!el) return;

    const update = () => {
      const ratio = el.clientWidth / el.scrollWidth;
      setThumbRatio(Math.min(ratio, 1));
      const scrollable = el.scrollWidth - el.clientWidth;
      setProgress(scrollable > 0 ? el.scrollLeft / scrollable : 0);
    };

    update();
    el.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      el.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [targetRef]);

  if (thumbRatio >= 1) return null;

  const thumbWidthPct = thumbRatio * 100;
  const thumbLeftPct = progress * (100 - thumbWidthPct);

  return (
    <div className="scroll-progress">
      <div className="scroll-progress__thumb" style={{ width: `${thumbWidthPct}%`, left: `${thumbLeftPct}%` }} />
    </div>
  );
}
