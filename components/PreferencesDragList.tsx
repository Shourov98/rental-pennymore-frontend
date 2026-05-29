"use client";

import { useEffect, useRef } from "react";
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
export default function PreferencesDragList({ onChange, initialList }: Props) {
  const items = initialList?.length ? initialList : defaultPreferencesList;
  const hasSeededDefaults = useRef(false);
  useEffect(() => {
    if (initialList && initialList.length > 0) {
      hasSeededDefaults.current = false;
      return;
    }
    if (!hasSeededDefaults.current) {
      onChange(defaultPreferencesList);
      hasSeededDefaults.current = true;
    }
  }, [initialList, onChange]);

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
      <p className="text-xs text-gray-500 mb-4">Drag to reorder.</p>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={items} strategy={verticalListSortingStrategy}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
    touchAction: "none", // allow touch drag without the browser turning it into a scroll gesture
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={`flex items-center gap-3 bg-gray-50 border rounded-lg px-4 py-2 select-none
        ${
          isDragging
            ? "shadow-xl bg-white scale-[1.02] z-50"
            : "border-gray-200 hover:bg-gray-100"
        }`}
    >
      <div className="cursor-grab active:cursor-grabbing">
        <GripVertical size={16} className="text-zinc-500" />
      </div>

      <span className="w-6 text-sm font-semibold text-gray-700">
        {index + 1}.
      </span>
      <span className="text-sm text-gray-800">{id}</span>
    </div>
  );
}
