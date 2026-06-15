"use client";

import { useEffect, useMemo, useRef } from "react";
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
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = items.indexOf(active.id as string);
    const newIndex = items.indexOf(over.id as string);

    const updated = arrayMove(items, oldIndex, newIndex);
    onChange(updated); // ALWAYS send changes to Redux
  };

  const midPoint = Math.ceil(items.length / 2);
  const leftCol = items.slice(0, midPoint);
  const rightCol = items.slice(midPoint);

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <h3 className="text-sm font-semibold text-gray-900 mb-1">
        Rank Importance of Features
      </h3>
      <p className="text-xs text-gray-500 mb-4">
        {"\u2192"} Drag to reorder and select your top 4 ranked priorities
      </p>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={items} strategy={verticalListSortingStrategy}>
          <div className="relative grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative space-y-2 pl-6 sm:pl-8">
              <PriorityBracket />
              {leftCol.map((item) => (
                <SortableItem
                  key={item}
                  id={item}
                  index={items.indexOf(item)}
                />
              ))}
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

function PriorityBracket() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 28 176"
      className="pointer-events-none absolute left-1 top-0 h-[176px] w-6 overflow-visible text-blue-600 drop-shadow-[0_1px_1px_rgba(37,99,235,0.2)]"
      fill="none"
      shapeRendering="geometricPrecision"
    >
      <path
        d="M27 1.5H18C10 1.5 7.5 8.5 7.5 19V68C7.5 78.5 4.75 84.5 1.5 88C4.75 91.5 7.5 97.5 7.5 108V157C7.5 167.5 10 174.5 18 174.5H27"
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
    touchAction: "none", // allow touch drag without the browser turning it into a scroll gesture
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
