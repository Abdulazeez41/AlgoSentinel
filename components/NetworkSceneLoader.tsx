"use client";

import dynamic from "next/dynamic";

// R3F/Canvas touches window on import, and the scene is decorative — so it
// loads client-side only, after the rest of the hero has already painted.
const NetworkScene = dynamic(
  () => import("./NetworkScene").then((mod) => mod.NetworkScene),
  { ssr: false }
);

export function NetworkSceneLoader() {
  return <NetworkScene />;
}
