// @ts-nocheck
import { CalendarIcon } from "@radix-ui/react-icons";
import { format } from "date-fns";
import { useState } from "react";
import { cn } from "../lib/utils";
import { Button } from "./ui/button";
import { Calendar } from "./ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";

export function DateTimePickerV2({
  selectedDate = () => {}, // Default to an empty function if not provided
  placeholder, // Corrected the typo here
  lang = "en", // Default to "en" if not provided
}: {
  selectedDate: (date: string) => void;
  placeholder: string; // Corrected the typo here
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [date, setDate] = useState<Date | null>(null);

  const handleDateChange = (selected: Date | null) => {
    if (selected) {
      setDate(selected);
      const formattedDate = format(selected, "dd/MM/yyyy");
      selectedDate(formattedDate); // Pass the selected date back to the parent
      setIsOpen(false); // Close the calendar after selecting a date
    }
  };

  return (
    <>
      <div className="flex  gap-4">
        <Popover open={isOpen} onOpenChange={setIsOpen}>
          <PopoverTrigger asChild>
            <div
              variant={"outline"}
              className={cn(
                "w-full flex items-center dark:bg-transparent bg-white border cursor-pointer py-[8px] pb-[6px] font-medium px-2 rounded-sm hover:text-accent-foreground hover:bg-background",
                !date && "text-muted-foreground"
              )}
              onClick={() => setIsOpen(true)} // Open the calendar when clicking the trigger
            >
              {date ? (
                `${format(date, "dd/MM/yyyy")}`
              ) : (
                <span>{placeholder && placeholder}</span> // Use placeholder correctly
              )}
              <CalendarIcon className="ms-auto h-4 w-4 opacity-50" />
            </div>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              captionLayout="dropdown"
              selected={date}
              onSelect={handleDateChange} // Call handleDateChange when a date is selected
              fromYear={1940}
              toYear={new Date().getFullYear() + 20}
              lang={lang}
            />
          </PopoverContent>
        </Popover>
      </div>
    </>
  );
}