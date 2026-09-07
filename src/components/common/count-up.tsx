import { useEffect, useRef, useState } from "react";

/** Animates a number once, the first time it scrolls into view. */
export function CountUp({
  value,
  suffix = "",
  duration = 1200,
  className,
}: {
  value: number;
  suffix?: string;
  duration?: number;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const [display, setDisplay] = useState(value);
  const started = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const reduced =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (reduced) {
      setDisplay(value);
      return;
    }

    let frame = 0;
    let cleanup: (() => void) | undefined;

    const startAnimation = () => {
      if (started.current) return;
      started.current = true;
      const start = performance.now();
      const tick = (now: number) => {
        const progress = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        setDisplay(Math.round(value * eased));
        if (progress < 1) {
          frame = requestAnimationFrame(tick);
        } else {
          setDisplay(value);
        }
      };
      frame = requestAnimationFrame(tick);
      cleanup = () => cancelAnimationFrame(frame);
    };

    if (typeof IntersectionObserver !== "undefined") {
      const observer = new IntersectionObserver(
        (entries) => {
          const entry = entries[0];
          if (!entry?.isIntersecting || started.current) return;
          observer.disconnect();
          startAnimation();
        },
        { threshold: 0.1 }
      );
      observer.observe(el);

      // Fallback: If inside marquee/transform and observer doesn't trigger within 400ms, start animation
      const timer = setTimeout(() => {
        if (!started.current) {
          observer.disconnect();
          startAnimation();
        }
      }, 400);

      return () => {
        observer.disconnect();
        clearTimeout(timer);
        cleanup?.();
      };
    } else {
      startAnimation();
      return () => cleanup?.();
    }
  }, [value, duration]);

  return (
    <span ref={ref} className={className}>
      {display.toLocaleString("en-IN")}
      {suffix}
    </span>
  );
}
