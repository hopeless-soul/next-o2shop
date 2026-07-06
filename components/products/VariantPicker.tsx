"use client";

import { cn } from "@/lib/utils";
import { createSplashEffect } from "@/lib/effects/splash";
import type { ProductColor, ProductSize } from "@/lib/types";

const LETTER_SIZE_ORDER = ["2xs", "xs", "s", "m", "l", "xl", "2xl", "3xl"];
const COLS = 4;

// Detects numeric size sets, so they can be sorted numerically
function isNumberBased(sizes: ProductSize[]): boolean {
  return sizes.length > 0 && sizes.every((s) => !isNaN(Number(s.label)));
}

// Numeric sizes sort by value; 
// letter sizes sort by position in LETTER_SIZE_ORDER, unrecognized labels pushed to the end.
function sortSizes(sizes: ProductSize[]): ProductSize[] {
  if (isNumberBased(sizes)) {
    return [...sizes].sort((a, b) => Number(a.label) - Number(b.label));
  }
  return [...sizes].sort((a, b) => {
    const ai = LETTER_SIZE_ORDER.indexOf(a.label.toLowerCase());
    const bi = LETTER_SIZE_ORDER.indexOf(b.label.toLowerCase());
    if (ai === -1 && bi === -1) return 0;
    if (ai === -1) return 1;
    if (bi === -1) return -1;
    return ai - bi;
  });
}

interface VariantPickerProps {
  colors: ProductColor[];
  sizes: ProductSize[];
  selectedColor: string | null;
  selectedSize: string | null;
  onColorChange: (name: string) => void;
  onSizeChange: (label: string) => void;
  highlightColor?: string;
}

export default function VariantPicker({
  colors,
  sizes,
  selectedColor,
  selectedSize,
  onColorChange,
  onSizeChange,
  highlightColor = "#a19c93",
}: VariantPickerProps) {
  const sortedSizes = sortSizes(sizes);
  // Used below to know which row is the last one, since the grid can end mid-row.
  const totalRows = Math.ceil(sortedSizes.length / COLS);

  return (
    <div className="flex flex-col gap-4">
      {/* Color swatches */}
      {colors.length > 0 && (
        <div>
          <p
            className="mb-2 text-[12px] uppercase tracking-widest font-bold font-secondary text-foreground"
          >
            Color
            {selectedColor && (
              <span className="ml-2 font-normal opacity-60 normal-case tracking-normal">
                — {selectedColor}
              </span>
            )}
          </p>
          <div className="flex items-center w-full gap-3 mb-[var(--space-4)]">
            {colors.map((color) => (
              <button
                key={color.name}
                onClick={(e) => {
                  if (!color.available) return;
                  onColorChange(color.name);
                  createSplashEffect(e.currentTarget, "var(--color-accent)");
                }}
                title={color.name}
                className={cn(
                  "relative flex items-center justify-center font-sans text-[12px] uppercase tracking-widest font-secondary",
                  selectedColor === color.name && "color-swatch-selected",
                  // Light swatches need dark label text for contrast; everything else
                  // gets light "on-dark" text. Hardcoded against the known light hexes.
                  color.hex === "#f5f5f5" || color.hex === "#f5f5dc" || color.hex === "#d2b48c"
                    ? "text-foreground"
                    : "text-on-dark"
                )}
                style={{
                  flex: 1,
                  height: "30px",
                  borderRadius: "var(--radius-swatch)",
                  backgroundColor: color.hex,
                  opacity: color.available ? 1 : 0.65,
                  cursor: color.available ? "pointer" : "no-drop",
                  transition: "var(--transition-base)",
                  fontWeight: '800',
                  fontSize: "10px",
                  fontStyle: 'italic',
                }}
                aria-label={color.name}
                disabled={!color.available}
              >
                {color.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Size grid */}
      {sortedSizes.length > 0 && (
        <div>
          <p
            className="mb-2 text-[12px] uppercase tracking-widest font-bold font-secondary text-foreground"
          >
            Size
            {selectedSize && (
              <span className="ml-2 font-normal opacity-60 normal-case tracking-normal">
                — {selectedSize}
              </span>
            )}
          </p>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: `repeat(${COLS}, 1fr)`,
              width: "100%",
            }}
          >
            {sortedSizes.map((size, index) => {
              const isSelected = selectedSize === size.label;
              const col = index % COLS;
              const row = Math.floor(index / COLS);
              const isLastRow = row === totalRows - 1;
              // A cell is the "right edge" if it's the last column, or if it's the very
              // last cell overall (covers a final partial row that doesn't reach COLS).
              const isRightEdge = col === COLS - 1 || index === sortedSizes.length - 1;
              // For a partial final row, cells directly above the missing slots also
              // need a bottom border since there's no cell below to draw one.
              const cellBelowEmpty = (row + 1) * COLS + col >= sortedSizes.length;
              // Only the four outer corners of the whole grid get rounded — each corner
              // condition targets exactly one cell (or edge cell for a ragged last row).
              const tl = index === 0 ? 6 : 0;
              const tr = row === 0 && isRightEdge ? 6 : 0;
              const br = isLastRow && isRightEdge ? 6 : 0;
              const bl = isLastRow && col === 0 ? 6 : 0;

              return (
                <button
                  key={size.label}
                  onClick={(e) => {
                    if (!size.available) return;
                    onSizeChange(size.label);
                    createSplashEffect(e.currentTarget, "var(--color-accent)");
                  }}
                  className={cn(
                    "relative font-sans text-[12px] uppercase tracking-widest flex items-center justify-center",
                    isSelected ? "text-foreground-dark" : "text-foreground"
                  )}
                  style={{
                    height: "44px",
                    padding: "5px 8px",
                    // Top/left borders are drawn by every cell; right/bottom borders are
                    // only added on edge cells so adjoining cells don't double up borders.
                    borderTop: "1px solid #2b272a",
                    borderLeft: "1px solid #2b272a",
                    borderRight: isRightEdge ? "1px solid #2b272a" : "none",
                    borderBottom: isLastRow || cellBelowEmpty ? "1px solid #2b272a" : "none",
                    borderRadius: `${tl}px ${tr}px ${br}px ${bl}px`,
                    backgroundColor: isSelected ? highlightColor : "transparent",
                    opacity: size.available ? 1 : 0.65,
                    cursor: size.available ? "pointer" : "no-drop",
                    transition: "var(--transition-base)",
                    fontWeight: '800',
                    fontStyle: 'italic',
                  }}
                  disabled={!size.available}
                >
                  {size.label}
                  {!size.available && (
                    // Diagonal strike-through overlay for sold-out sizes.
                    <svg
                      aria-hidden="true"
                      style={{
                        position: "absolute",
                        inset: 0,
                        width: "100%",
                        height: "100%",
                        pointerEvents: "none",
                      }}
                      viewBox="0 0 100 100"
                      preserveAspectRatio="none"
                    >
                      <line
                        x1="100"
                        y1="0"
                        x2="0"
                        y2="100"
                        stroke="#2b272a"
                        strokeWidth="3"
                        vectorEffect="non-scaling-stroke"
                      />
                    </svg>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
