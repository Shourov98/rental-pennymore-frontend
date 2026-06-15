"use client";

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { defaultPreferencesList } from "@/store/slices/preferenceSlice";

import {
  DndContext,
  closestCenter,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";

import {
  SortableContext,
  useSortable,
  arrayMove,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";

import { CSS } from "@dnd-kit/utilities";
import { GripVertical } from "lucide-react";

interface Props {
  onChange: (list: string[]) => void;
  initialList?: string[];
}

function areListsEqual(first: string[], second: string[]) {
  return (
    first.length === second.length &&
    first.every((item, index) => item === second[index])
  );
}

function normalizePreferencesList(list?: string[]) {
  if (!list?.length) return defaultPreferencesList;

  const defaultItems = new Set(defaultPreferencesList);
  const knownItems = list.filter((item) => defaultItems.has(item));
  const missingItems = defaultPreferencesList.filter(
    (item) => !knownItems.includes(item),
  );
  const normalized = [...knownItems, ...missingItems];

  return normalized.length === defaultPreferencesList.length
    ? normalized
    : defaultPreferencesList;
}

// Scales the original 176px bracket path proportionally to any target height.
function generateBracketPath(h: number): string {
  const s = h / 176;
  const y = (v: number) => parseFloat((v * s).toFixed(3));
  return (
    `M27 ${y(1.5)}H18` +
    `C10 ${y(1.5)} 7.5 ${y(8.5)} 7.5 ${y(19)}` +
    `V${y(68)}` +
    `C7.5 ${y(78.5)} 4.75 ${y(84.5)} 1.5 ${y(88)}` +
    `C4.75 ${y(91.5)} 7.5 ${y(97.5)} 7.5 ${y(108)}` +
    `V${y(157)}` +
    `C7.5 ${y(167.5)} 10 ${y(174.5)} 18 ${y(174.5)}H27`
  );
}

export default function PreferencesDragList({ onChange, initialList }: Props) {
  const items = useMemo(
    () => normalizePreferencesList(initialList),
    [initialList],
  );
  const hasSeededDefaults = useRef(false);

  useEffect(() => {
    if (initialList && initialList.length > 0) {
      hasSeededDefaults.current = false;
      if (!areListsEqual(initialList, items)) {
        onChange(items);
      }
      return;
    }
    if (!hasSeededDefaults.current) {
      onChange(defaultPreferencesList);
      hasSeededDefaults.current = true;
    }
  }, [initialList, items, onChange]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 200,
        tolerance: 5,
      },
    }),
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = items.indexOf(active.id as string);
    const newIndex = items.indexOf(over.id as string);

    const updated = arrayMove(items, oldIndex, newIndex);
    onChange(updated);
  };

  const midPoint = Math.ceil(items.length / 2);
  const leftCol = items.slice(0, midPoint);
  const rightCol = items.slice(midPoint);

  // Measure the exact top/height of the first 4 items in the left column so the
  // bracket SVG is always pixel-perfect regardless of item height or screen size.
  const leftColRef = useRef<HTMLDivElement>(null);
  const [bracket, setBracket] = useState({ top: 0, height: 176 });

  const measureBracket = useCallback(() => {
    const container = leftColRef.current;
    if (!container) return;
    const children = Array.from(container.children);
    if (children.length < 4) return;

    const containerRect = container.getBoundingClientRect();
    const firstRect = children[0].getBoundingClientRect();
    const fourthRect = children[3].getBoundingClientRect();

    const top = Math.round(firstRect.top - containerRect.top);
    const height = Math.round(fourthRect.bottom - firstRect.top);

    setBracket((prev) => {
      if (prev.top === top && prev.height === height) return prev;
      return { top, height };
    });
  }, []);

  // Synchronous measurement on every render to avoid flash of misaligned bracket.
  useLayoutEffect(() => {
    measureBracket();
  }, [measureBracket, items]);

  // Re-measure whenever the column resizes (e.g. window resize, font load).
  useEffect(() => {
    if (typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(measureBracket);
    if (leftColRef.current) observer.observe(leftColRef.current);
    return () => observer.disconnect();
  }, [measureBracket]);

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <h3 className="text-sm font-semibold text-gray-900 mb-1">
        Rank Importance of Features
      </h3>
      <p className="text-xs text-gray-500 mb-4">
        {"→"} Drag to reorder and select your top 4 ranked priorities
      </p>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={items} strategy={verticalListSortingStrategy}>
          <div className="relative grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Left column: bracket is a sibling of the items wrapper, not the
                items themselves, so space-y-2 doesn't add margin before item 1. */}
            <div className="relative pl-6 sm:pl-8">
              <PriorityBracket top={bracket.top} height={bracket.height} />
              <div className="space-y-2" ref={leftColRef}>
                {leftCol.map((item) => (
                  <SortableItem
                    key={item}
                    id={item}
                    index={items.indexOf(item)}
                  />
                ))}
              </div>
            </div>

            <div className="space-y-2">
              {rightCol.map((item) => (
                <SortableItem
                  key={item}
                  id={item}
                  index={items.indexOf(item)}
                />
              ))}
            </div>
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
}

function PriorityBracket({ top, height }: { top: number; height: number }) {
  if (height <= 0) return null;
  return (
    <svg
      aria-hidden="true"
      viewBox={`0 0 28 ${height}`}
      className="pointer-events-none absolute left-1 w-6 overflow-visible text-blue-600 drop-shadow-[0_1px_1px_rgba(37,99,235,0.2)]"
      style={{ top, height }}
      fill="none"
      shapeRendering="geometricPrecision"
    >
      <path
        d={generateBracketPath(height)}
        stroke="currentColor"
        strokeLinecap="butt"
        strokeLinejoin="miter"
        strokeMiterlimit="10"
        strokeWidth="2.5"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}

function SortableItem({ id, index }: { id: string; index: number }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    touchAction: "none",
  };
  const isPriority = index < 4;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={`flex items-center gap-3 border rounded-lg px-4 py-2 select-none
        ${
          isDragging
            ? "shadow-xl bg-white scale-[1.02] z-50"
            : isPriority
              ? "border-blue-200 bg-blue-50 hover:bg-blue-100"
              : "border-gray-200 bg-gray-50 hover:bg-gray-100"
        }`}
    >
      <div className="cursor-grab active:cursor-grabbing">
        <GripVertical size={16} className="text-zinc-500" />
      </div>

      <span className="w-6 text-sm font-semibold text-gray-700">
        {index + 1}.
      </span>
      <span className="text-sm text-gray-800">{id}</span>
      {isPriority ? (
        <span className="ml-auto rounded-full bg-white px-2 py-0.5 text-[11px] font-semibold text-blue-700">
          Priority #{index + 1}
        </span>
      ) : null}
    </div>
  );
}
