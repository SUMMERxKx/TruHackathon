"use client";

import { useEffect, useRef } from "react";

const SPARKLES = ["✨", "⭐", "💫", "🌟", "🫧"];

// Every professional website in 2003 had one of these.
export default function CursorTrail() {
  const lastSpawn = useRef(0);

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      const now = performance.now();
      if (now - lastSpawn.current < 70) return;
      lastSpawn.current = now;
      const el = document.createElement("span");
      el.className = "sparkle";
      el.textContent = SPARKLES[Math.floor(Math.random() * SPARKLES.length)];
      el.style.left = `${e.clientX + (Math.random() * 16 - 8)}px`;
      el.style.top = `${e.clientY + (Math.random() * 16 - 8)}px`;
      document.body.appendChild(el);
      window.setTimeout(() => el.remove(), 950);
    };
    window.addEventListener("pointermove", onMove);
    return () => window.removeEventListener("pointermove", onMove);
  }, []);

  return null;
}
