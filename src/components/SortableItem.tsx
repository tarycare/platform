//@ts-nocheck
import React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GrDrag } from "react-icons/gr";
import { Input } from "./ui/input";
import { Label } from "./ui/label";

export function SortableItem({ id, field, onClick }) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} className="mt-5 flex flex-col gap-1">
      <Label htmlFor={id} className="font-bold">
        {field.label}
      </Label>
      <div className="flex gap-3 items-center">
        <Input
          placeholder={field.placeholder}
          id={id}
          name={id}
          readOnly
          className="cursor-pointer"
          onClick={onClick}
        />
        <GrDrag
          size={20}
          className="text-gray-500 cursor-move"
          {...listeners}
          {...attributes}
        />
      </div>
    </div>
  );
}
