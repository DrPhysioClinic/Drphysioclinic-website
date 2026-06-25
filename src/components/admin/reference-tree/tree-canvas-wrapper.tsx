"use client";

import dynamic from "next/dynamic";

const TreeCanvas = dynamic(
  () => import("./tree-canvas").then((mod) => mod.TreeCanvas),
  { ssr: false }
);

export function TreeCanvasWrapper(props: any) {
  return <TreeCanvas {...props} />;
}
