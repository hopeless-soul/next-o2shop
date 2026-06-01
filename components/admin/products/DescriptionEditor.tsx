'use client'

import { useRef, useState } from 'react'
import { GripVertical, Minus, PencilOff, Plus, Trash2 } from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/admin/ui/select'
import type { DescriptionBlock } from '@/lib/api/admin-products'

const inputCls =
  'h-9 px-2.5 rounded-[4px] border border-[var(--admin-border-input)] bg-[var(--admin-bg)] text-[14px] text-[var(--admin-text-primary)] outline-none focus:border-[var(--admin-ring)] focus:ring-2 focus:ring-[var(--admin-ring)]/30 w-full'

interface Props {
  blocks: DescriptionBlock[]
  onChange: (blocks: DescriptionBlock[]) => void
}

export default function DescriptionEditor({ blocks, onChange }: Props) {
  const dragIndexRef = useRef<number | null>(null)
  const [draggingIdx, setDraggingIdx] = useState<number | null>(null)

  function addBlock() {
    onChange([...blocks, { type: 'text', content: '' }])
  }

  function removeBlock(index: number) {
    onChange(blocks.filter((_, i) => i !== index))
  }

  function changeType(index: number, type: 'text' | 'points') {
    onChange(
      blocks.map((b, i) => {
        if (i !== index) return b
        return type === 'text' ? { type: 'text', content: '' } : { type: 'points', items: [''] }
      })
    )
  }

  function updateContent(index: number, content: string) {
    onChange(
      blocks.map((b, i) => {
        if (i !== index || b.type !== 'text') return b
        return { ...b, content }
      })
    )
  }

  function updateItem(blockIndex: number, itemIndex: number, value: string) {
    onChange(
      blocks.map((b, i) => {
        if (i !== blockIndex || b.type !== 'points') return b
        return { ...b, items: b.items.map((item, j) => (j === itemIndex ? value : item)) }
      })
    )
  }

  function addItem(blockIndex: number) {
    onChange(
      blocks.map((b, i) => {
        if (i !== blockIndex || b.type !== 'points') return b
        return { ...b, items: [...b.items, ''] }
      })
    )
  }

  function removeItem(blockIndex: number, itemIndex: number) {
    onChange(
      blocks.map((b, i) => {
        if (i !== blockIndex || b.type !== 'points') return b
        return { ...b, items: b.items.filter((_, j) => j !== itemIndex) }
      })
    )
  }

  function handleDragStart(e: React.DragEvent, idx: number) {
    dragIndexRef.current = idx
    setDraggingIdx(idx)
    // Replace the browser's default ghost (which captures the whole row including portals)
    // with a small pill that follows the cursor cleanly.
    const ghost = document.createElement('div')
    ghost.style.cssText =
      'position:fixed;top:-1000px;left:-1000px;padding:5px 10px;' +
      'background:white;border:1px solid #d1d5db;border-radius:4px;' +
      'font-size:12px;color:#6b7280;white-space:nowrap;pointer-events:none;' +
      'box-shadow:0 2px 8px rgba(0,0,0,.12);'
    ghost.textContent = blocks[idx].type === 'text' ? 'Text section' : 'List section'
    document.body.appendChild(ghost)
    e.dataTransfer.setDragImage(ghost, 0, 0)
    requestAnimationFrame(() => { try { document.body.removeChild(ghost) } catch { /* already removed */ } })
  }

  function handleDragOver(e: React.DragEvent, idx: number) {
    e.preventDefault()
    const from = dragIndexRef.current
    if (from === null || from === idx) return
    const next = [...blocks]
    const [item] = next.splice(from, 1)
    next.splice(idx, 0, item)
    dragIndexRef.current = idx
    onChange(next)
  }

  function handleDrop() {
    dragIndexRef.current = null
  }

  function handleDragEnd() {
    dragIndexRef.current = null
    setDraggingIdx(null)
  }

  return (
    <div className="space-y-2">
      {blocks.map((block, blockIndex) => (
        <div
          key={blockIndex}
          draggable
          onDragStart={e => handleDragStart(e, blockIndex)}
          onDragOver={e => handleDragOver(e, blockIndex)}
          onDrop={handleDrop}
          onDragEnd={handleDragEnd}
          className={`flex gap-3 items-start transition-opacity duration-100 ${draggingIdx === blockIndex ? 'opacity-30' : ''}`}
        >
          <GripVertical className="size-4 text-[var(--admin-text-muted)] cursor-grab shrink-0 mt-2.5" />

          <div className="w-[160px] shrink-0">
            <Select
              value={block.type}
              onValueChange={(v) => changeType(blockIndex, v as 'text' | 'points')}
            >
              <SelectTrigger className="w-full">
                <SelectValue>
                  {block.type === 'text' ? 'text' : 'list'}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="text">text</SelectItem>
                <SelectItem value="points">list</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex-1 space-y-1.5">
            {block.type === 'text' ? (
              <input
                value={block.content}
                onChange={e => updateContent(blockIndex, e.target.value)}
                onDragStart={e => e.stopPropagation()}
                className={inputCls}
                placeholder="Text content"
              />
            ) : (
              <>
                {block.items.map((item, itemIndex) => (
                  <div key={itemIndex} className="flex gap-2 items-center">
                    <input
                      value={item}
                      onChange={e => updateItem(blockIndex, itemIndex, e.target.value)}
                      onDragStart={e => e.stopPropagation()}
                      className={inputCls}
                      placeholder={`Item ${itemIndex + 1}`}
                    />
                    {block.items.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeItem(blockIndex, itemIndex)}
                        className="p-1 rounded-[4px] text-[var(--admin-text-muted)] hover:text-[var(--admin-destructive)] hover:bg-[var(--admin-status-error-bg)] transition-colors shrink-0"
                      >
                        <PencilOff className="size-3.5" />
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => addItem(blockIndex)}
                  className="flex items-center gap-1 text-[12px] text-[var(--admin-text-secondary)] hover:text-[var(--admin-text-primary)] transition-colors"
                >
                  <Plus className="size-3.5" />
                  add list item
                </button>
              </>
            )}
          </div>

          <button
            type="button"
            onClick={() => removeBlock(blockIndex)}
            className="p-1 rounded-[4px] text-[var(--admin-text-muted)] hover:text-[var(--admin-destructive)] hover:bg-[var(--admin-status-error-bg)] transition-colors shrink-0 mt-1"
          >
            <Trash2 className="size-4" />
          </button>
        </div>
      ))}

      <button
        type="button"
        onClick={addBlock}
        className="flex items-center gap-1 text-[13px] text-[var(--admin-text-secondary)] hover:text-[var(--admin-text-primary)] transition-colors mt-1"
      >
        <Plus className="size-4" />
        add section
      </button>
    </div>
  )
}
