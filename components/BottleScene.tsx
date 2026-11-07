"use client";

import dynamic from "next/dynamic";
import type { Bottle3DProps } from "./Bottle3D";

const Bottle3D = dynamic(() => import("./Bottle3D"), {
  ssr: false,
  loading: () => (
    <div className="grid h-full w-full place-items-center">
      <span className="eyebrow animate-pulse opacity-60">Loading 3D</span>
    </div>
  ),
});

export default function BottleScene(props: Bottle3DProps) {
  return <Bottle3D {...props} />;
}
