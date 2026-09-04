"use client";

import React from "react";
import { PaletteTab } from "@/components/sections/ThemeElements";
import { useCylinderGallery, CylinderGallerySceneProps } from "./gallery/useCylinderGallery";

export function CylinderGalleryScene(props: CylinderGallerySceneProps) {
  const { containerRef, overlayRef } = useCylinderGallery(props);

  return (
    <div
      ref={containerRef}
      className={`absolute inset-0 pointer-events-none ${props.className || ""}`}
      style={{ zIndex: 10 }}
    >
      <div
        ref={overlayRef}
        className="absolute inset-0 pointer-events-none opacity-0 flex items-center justify-center p-4 md:p-12 transition-opacity duration-75"
        style={{ zIndex: 20 }}
      >
        <div className="w-full max-w-7xl mx-auto mt-20">
          <PaletteTab
            activeThemeId={props.activeThemeId || "tesseract"}
            onThemeChange={props.onThemeChange || (() => { })}
            isActive={true}
          />
        </div>
      </div>
    </div>
  );
}
