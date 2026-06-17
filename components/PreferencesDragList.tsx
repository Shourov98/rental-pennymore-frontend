"use client";

import {
  useEffect,
  useMemo,
  useRef,
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

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <h3 className="text-sm font-semibold text-gray-900 mb-1">
        Rank Importance of Features
      </h3>
      <p className="text-xs mb-4" style={{ color: "#3D4148" }}>
        {"→"} Drag to reorder and select your top 4 ranked priorities
      </p>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={items} strategy={verticalListSortingStrategy}>
          <div className="relative grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
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

      {isPriority && (
        <span className="w-6 text-sm font-semibold text-gray-700">
          {index + 1}.
        </span>
      )}
      <span className="text-sm text-gray-800">{id}</span>
      {isPriority ? (
        <span className="ml-auto rounded-full bg-white px-2 py-0.5 text-[11px] font-semibold text-blue-700 whitespace-nowrap">
          Priority #{index + 1}
        </span>
      ) : null}
    </div>
  );
}
