"use client";

import type { ProductColor, ProductSize } from "@/lib/mock-data";

interface VariantPickerProps {
  colors: ProductColor[];
  sizes: ProductSize[];
  selectedColor: string | null;
  selectedSize: string | null;
  onColorChange: (name: string) => void;
  onSizeChange: (label: string) => void;
}

export default function VariantPicker({
  colors,
  sizes,
  selectedColor,
  selectedSize,
  onColorChange,
  onSizeChange,
}: VariantPickerProps) {
  return (
    <div className="flex flex-col gap-4">
      {/* Color swatches */}
      {colors.length > 0 && (
        <div>
          <p
            className="mb-2 text-[12px] uppercase tracking-widest font-bold"
            style={{ fontFamily: "var(--font-secondary)", color: "var(--color-foreground)" }}
          >
            Color
            {selectedColor && (
              <span className="ml-2 font-normal opacity-60 normal-case tracking-normal">
                — {selectedColor}
              </span>
            )}
          </p>
          <div className="flex flex-wrap gap-2" style={{ marginBottom: "var(--space-4)" }}>
            {colors.map((color) => (
              <button
                key={color.name}
                onClick={() => color.available && onColorChange(color.name)}
                title={color.name}
                className="relative flex items-center justify-center font-sans text-[12px] uppercase tracking-widest"
                style={{
                  width: "149px",
                  height: "30px",
                  borderRadius: "var(--radius-swatch)",
                  backgroundColor: color.hex,
                  border:
                    selectedColor === color.name
                      ? "2px solid var(--color-foreground-dark)"
                      : "2px solid var(--color-border)",
                  opacity: color.available ? 1 : 0.65,
                  cursor: color.available ? "pointer" : "no-drop",
                  transition: "var(--transition-base)",
                  color:
                    color.hex === "#f5f5f5" || color.hex === "#f5f5dc" || color.hex === "#d2b48c"
                      ? "var(--color-foreground)"
                      : "var(--color-on-dark)",
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

      {/* Size selector */}
      {sizes.length > 0 && (
        <div>
          <p
            className="mb-2 text-[12px] uppercase tracking-widest font-bold"
            style={{ fontFamily: "var(--font-secondary)", color: "var(--color-foreground)" }}
          >
            Size
            {selectedSize && (
              <span className="ml-2 font-normal opacity-60 normal-case tracking-normal">
                — {selectedSize}
              </span>
            )}
          </p>
          <div className="flex flex-wrap gap-2">
            {sizes.map((size) => (
              <button
                key={size.label}
                onClick={() => size.available && onSizeChange(size.label)}
                className="font-sans text-[12px] uppercase tracking-widest flex items-center justify-center"
                style={{
                  minWidth: "44px",
                  height: "44px",
                  padding: "5px 8px",
                  border:
                    selectedSize === size.label
                      ? "2px solid var(--color-foreground-dark)"
                      : "2px solid var(--color-border)",
                  backgroundColor:
                    selectedSize === size.label
                      ? "var(--color-foreground-dark)"
                      : "transparent",
                  color:
                    selectedSize === size.label
                      ? "var(--color-on-dark)"
                      : "var(--color-foreground)",
                  opacity: size.available ? 1 : 0.65,
                  cursor: size.available ? "pointer" : "no-drop",
                  textDecoration: size.available ? "none" : "line-through",
                  transition: "var(--transition-base)",
                }}
                disabled={!size.available}
              >
                {size.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
