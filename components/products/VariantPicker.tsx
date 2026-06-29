"use client";

import { cn } from "@/lib/utils";
import type { ProductColor, ProductSize } from "@/lib/types";

const LETTER_SIZE_ORDER = ["2xs", "xs", "s", "m", "l", "xl", "2xl", "3xl"];
const COLS = 4;

function isNumberBased(sizes: ProductSize[]): boolean {
  return sizes.length > 0 && sizes.every((s) => !isNaN(Number(s.label)));
}

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
  const totalRows = Math.ceil(sortedSizes.length / COLS);

  return (
    <div className="flex flex-col gap-4">
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
                onClick={() => color.available && onColorChange(color.name)}
                title={color.name}
                className={cn(
                  "relative flex items-center justify-center font-sans text-[12px] uppercase tracking-widest font-secondary",
                  selectedColor === color.name && "color-swatch-selected",
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
              const isRightEdge = col === COLS - 1 || index === sortedSizes.length - 1;
              const cellBelowEmpty = (row + 1) * COLS + col >= sortedSizes.length;
              const tl = index === 0 ? 6 : 0;
              const tr = row === 0 && isRightEdge ? 6 : 0;
              const br = isLastRow && isRightEdge ? 6 : 0;
              const bl = isLastRow && col === 0 ? 6 : 0;

              return (
                <button
                  key={size.label}
                  onClick={() => size.available && onSizeChange(size.label)}
                  className={cn(
                    "relative font-sans text-[12px] uppercase tracking-widest flex items-center justify-center overflow-hidden",
                    isSelected ? "text-foreground-dark" : "text-foreground"
                  )}
                  style={{
                    height: "44px",
                    padding: "5px 8px",
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
