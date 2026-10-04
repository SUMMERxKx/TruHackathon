"use client";

import { useEffect, useState } from "react";
import { setVolume, tick } from "@/lib/sounds";

// Homage to r/ProgrammerHumor's 2017 "worst volume control" challenge:
// every volume from 0 to 100, sorted by vibes.
function shuffled(): number[] {
  const arr = Array.from({ length: 101 }, (_, i) => i);
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export default function VolumeControl() {
  // Shuffled after mount so hydration doesn't notice the chaos.
  const [options, setOptions] = useState<number[]>(() =>
    Array.from({ length: 101 }, (_, i) => i)
  );
  const [value, setValue] = useState(73);
  useEffect(() => {
    setOptions(shuffled());
  }, []);

  return (
    <label className="block text-[0.65rem]">
      <span className="block mb-0.5">🔊 SFX Volume (sorted by vibes)</span>
      <select
        value={value}
        onChange={(e) => {
          const v = Number(e.target.value);
          setValue(v);
          setVolume(v / 100);
          tick();
        }}
        className="w-full win98-bevel-in px-1 py-0.5 text-[0.7rem] text-black outline-none"
      >
        {options.map((n) => (
          <option key={n} value={n}>
            {n}
          </option>
        ))}
      </select>
    </label>
  );
}
