//@ts-nocheck
import React, { useState } from "react";
import {
  DndContext,
  closestCenter,
  useDroppable,
  useDraggable,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { PiTextTDuotone } from "react-icons/pi";
import { TbSectionFilled, TbNumbers } from "react-icons/tb";
import { MdDateRange, MdAlternateEmail } from "react-icons/md";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { X } from "lucide-react";
import { GrDrag } from "react-icons/gr";
import { CSS } from "@dnd-kit/utilities";

// Sidebar items (sections and fields)
const sidebarItems = [
  {
    id: "section",
    label: "Section",
    type: "section",
    icon: TbSectionFilled,
  },
  {
    id: "text",
    label: "Text",
    placeholder: "Enter text",
    type: "text",
    icon: PiTextTDuotone,
  },
  {
    id: "number",
    label: "Number",
    placeholder: "Enter a number",
    type: "number",
    icon: TbNumbers,
  },
  {
    id: "email",
    label: "Email",
    placeholder: "Enter an email",
    type: "email",
    icon: MdAlternateEmail,
  },
  {
    id: "date",
    label: "Date",
    placeholder: "Enter a date",
    type: "date",
    icon: MdDateRange,
  },
];

function CreateForm() {
  const [sections, setSections] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);

  // Generate unique IDs
  const generateId = () => Math.random().toString(36).substr(2, 9);

  // Sensors for drag-and-drop
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5, // Start dragging after moving 5 pixels
      },
    })
  );

  // Handle drag and drop events
  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (!over) return;

    const activeData = active.data.current;
    const overData = over.data.current;

    if (activeData.type === "sidebar") {
      // Dragging from sidebar
      if (active.id === "section" && over.id === "main-container") {
        // Add new section
        const newSection = {
          id: generateId(),
          title: "New Section",
          description: "",
          fields: [],
        };
        setSections((prev) => [...prev, newSection]);
      } else if (
        active.id !== "section" &&
        overData &&
        overData.type === "fields"
      ) {
        // Add field to section
        const sectionId = overData.sectionId;
        const fieldData = sidebarItems.find((item) => item.id === active.id);
        const newField = {
          ...fieldData,
          id: generateId(),
        };

        setSections((prev) =>
          prev.map((section) =>
            section.id === sectionId
              ? { ...section, fields: [...section.fields, newField] }
              : section
          )
        );
      }
    } else if (activeData.type === "field") {
      // Reordering fields within the same section
      if (
        overData &&
        overData.type === "field" &&
        activeData.sectionId === overData.sectionId
      ) {
        const sectionId = activeData.sectionId;
        const oldIndex = activeData.index;
        const newIndex = overData.index;

        setSections((prev) =>
          prev.map((section) =>
            section.id === sectionId
              ? {
                  ...section,
                  fields: arrayMove(section.fields, oldIndex, newIndex),
                }
              : section
          )
        );
      }
    } else if (activeData.type === "section" && overData.type === "section") {
      // Reordering sections
      const oldIndex = activeData.index;
      const newIndex = overData.index;

      setSections((prev) => arrayMove(prev, oldIndex, newIndex));
    }
  };

  // Render settings panel
  const renderSettings = (item) => {
    if (!item) return null;

    if (item.type === "section") {
      return (
        <div className="p-5 bg-zinc-100 w-60 ">
          <div className="flex justify-between items-center">
            <h2 className="font-bold text-lg">Section Settings</h2>
            <X
              size={20}
              className="cursor-pointer"
              onClick={() => setSelectedItem(null)}
            />
          </div>
          <div className="mt-5">
            <Label htmlFor="title" className="font-medium">
              Title
            </Label>
            <Input
              id="title"
              value={item.title}
              onChange={(e) =>
                handleSectionChange(item.id, "title", e.target.value)
              }
              className="mt-2"
            />
            <Label htmlFor="description" className="font-medium mt-5">
              Description
            </Label>
            <Input
              id="description"
              value={item.description}
              onChange={(e) =>
                handleSectionChange(item.id, "description", e.target.value)
              }
              className="mt-2"
            />
          </div>
        </div>
      );
    } else {
      // Field settings
      return (
        <div className="p-5 bg-zinc-100 w-60 ">
          <div className="flex justify-between items-center">
            <h2 className="font-bold text-lg">Field Settings</h2>
            <X
              size={20}
              className="cursor-pointer"
              onClick={() => setSelectedItem(null)}
            />
          </div>
          <div className="my-5">
            <Label htmlFor="label" className="font-medium">
              Label
            </Label>
            <Input
              id="label"
              value={item.label}
              onChange={(e) =>
                handleFieldChange(
                  item.sectionId,
                  item.id,
                  "label",
                  e.target.value
                )
              }
              className="my-2"
            />
            <Label htmlFor="placeholder" className="font-medium mt-5">
              Placeholder
            </Label>
            <Input
              id="placeholder"
              value={item.placeholder}
              onChange={(e) =>
                handleFieldChange(
                  item.sectionId,
                  item.id,
                  "placeholder",
                  e.target.value
                )
              }
              className="mt-2"
            />
          </div>
        </div>
      );
    }
  };

  // Update section properties
  const handleSectionChange = (sectionId, key, value) => {
    setSections((prev) =>
      prev.map((section) =>
        section.id === sectionId ? { ...section, [key]: value } : section
      )
    );
    // Update selected item to reflect changes in settings panel
    if (selectedItem && selectedItem.id === sectionId) {
      setSelectedItem((prev) => ({ ...prev, [key]: value }));
    }
  };

  // Update field properties
  const handleFieldChange = (sectionId, fieldId, key, value) => {
    setSections((prev) =>
      prev.map((section) =>
        section.id === sectionId
          ? {
              ...section,
              fields: section.fields.map((field) =>
                field.id === fieldId ? { ...field, [key]: value } : field
              ),
            }
          : section
      )
    );
    // Update selected item to reflect changes in settings panel
    if (selectedItem && selectedItem.id === fieldId) {
      setSelectedItem((prev) => ({ ...prev, [key]: value }));
    }
  };

  // Draggable sidebar items
  const DraggableSidebarItem = ({ item }) => {
    const { attributes, listeners, setNodeRef, transform, isDragging } =
      useDraggable({
        id: item.id,
        data: { type: "sidebar" },
      });

    const style = {
      transform: CSS.Translate.toString(transform),
      opacity: isDragging ? 0.5 : 1,
    };

    return (
      <div
        ref={setNodeRef}
        style={style}
        className={`bg-white flex flex-col items-center justify-center ${
          item.id === "section"
            ? "aspect-video col-span-12"
            : "aspect-square col-span-4"
        } rounded-md cursor-move hover:bg-[#f1f1f1] hover:border-2 hover:border-foreground`}
        {...listeners}
        {...attributes}
      >
        {React.createElement(item.icon, { size: 20 })}
        <div className="font-medium">{item.label}</div>
      </div>
    );
  };

  // Droppable main container
  const MainContainer = ({ children }) => {
    const { setNodeRef, isOver } = useDroppable({
      id: "main-container",
      data: { accepts: ["section"] },
    });

    return (
      <div
        ref={setNodeRef}
        className={`flex flex-col w-full min-h-40 p-2 border ${
          isOver ? "border-blue-500 bg-blue-50" : "border-transparent"
        }`}
        onClick={() => setSelectedItem(null)} // Deselect on click outside
      >
        {children}
      </div>
    );
  };

  // Section component with droppable fields area
  const SectionComponent = ({ section, index }) => {
    const {
      attributes,
      listeners,
      setNodeRef,
      transform,
      transition,
      isDragging,
    } = useSortable({
      id: section.id,
      data: { type: "section", index },
    });

    const style = {
      transform: CSS.Translate.toString(transform),
      transition,
      opacity: isDragging ? 0.5 : 1,
    };

    return (
      <div
        ref={setNodeRef}
        style={style}
        className={`bg-slate-50 w-full rounded-md flex flex-col p-5 mt-3 ${
          isDragging ? "z-50" : ""
        }`}
        onClick={(e) => {
          e.stopPropagation(); // Prevent triggering parent click
          setSelectedItem({ ...section, type: "section" });
        }}
      >
        <div className="flex justify-between items-center">
          <h2 className="font-bold text-lg">{section.title}</h2>
          <div {...attributes} {...listeners}>
            <GrDrag size={20} className="text-gray-500 cursor-move" />
          </div>
        </div>
        <h6>{section.description}</h6>
        <FieldsDroppableArea section={section} />
      </div>
    );
  };

  // Droppable area for fields within a section
  const FieldsDroppableArea = ({ section }) => {
    const { setNodeRef, isOver } = useDroppable({
      id: `fields-${section.id}`,
      data: { type: "fields", sectionId: section.id, accepts: ["field"] },
    });

    return (
      <div
        ref={setNodeRef}
        className={`mt-5 p-2 min-h-[50px] border ${
          isOver ? "border-blue-500 bg-blue-50" : "border-transparent"
        }`}
      >
        <SortableContext
          items={section.fields.map((field) => field.id)}
          strategy={verticalListSortingStrategy}
        >
          {section.fields.map((field, index) => (
            <SortableField
              key={field.id}
              field={field}
              index={index}
              sectionId={section.id}
              onClick={() =>
                setSelectedItem({ ...field, sectionId: section.id })
              }
            />
          ))}
        </SortableContext>
      </div>
    );
  };

  // Sortable field component
  const SortableField = ({ field, index, sectionId, onClick }) => {
    const {
      attributes,
      listeners,
      setNodeRef,
      transform,
      transition,
      isDragging,
    } = useSortable({
      id: field.id,
      data: { type: "field", sectionId, index },
    });

    const style = {
      transform: CSS.Translate.toString(transform),
      transition,
      opacity: isDragging ? 0.5 : 1,
    };

    return (
      <div
        ref={setNodeRef}
        style={style}
        className="mt-5 flex flex-col gap-1 cursor-pointer"
        onClick={(e) => {
          e.stopPropagation(); // Prevent triggering parent click
          onClick();
        }}
      >
        <div className="flex gap-3 items-center">
          <Label htmlFor={field.id} className="font-bold">
            {field.label}
          </Label>
        </div>
        <div className="flex items-center justify-between gap-2">
          <Input
            placeholder={field.placeholder}
            id={field.id}
            name={field.id}
            readOnly
            className="cursor-pointer"
          />
          <div {...attributes} {...listeners}>
            <GrDrag size={20} className="text-gray-500 cursor-move" />
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex h-[calc(100vh-10rem)] w-full rounded-md overflow-hidden mt-5">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        {/* Main Container */}
        <div className="flex justify-start items-start w-full flex-1 bg-[#f1f1f1] p-5">
          <MainContainer>
            <SortableContext
              items={sections.map((section) => section.id)}
              strategy={verticalListSortingStrategy}
            >
              {sections.map((section, index) => (
                <SectionComponent
                  key={section.id}
                  section={section}
                  index={index}
                />
              ))}
            </SortableContext>
          </MainContainer>
        </div>

        {/* Sidebar */}
        <div className={`bg-zinc-100 ${!selectedItem ? "block" : "hidden"}`}>
          <div className="grid grid-cols-12 w-60 gap-3 p-5">
            {sidebarItems.map((item) => (
              <DraggableSidebarItem key={item.id} item={item} />
            ))}
          </div>
        </div>

        {/* Settings Sidebar */}
        {selectedItem && (
          <div className="bg-zinc-100 w-60">{renderSettings(selectedItem)}</div>
        )}
      </DndContext>
    </div>
  );
}

export default CreateForm;
