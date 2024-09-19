// @ts-nocheck
import { CalendarIcon } from "@radix-ui/react-icons";
import { format } from "date-fns";
import { useState } from "react";
import { cn } from "../lib/utils";
import { Button } from "./ui/button";
import { Calendar } from "./ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";

export function DateTimePickerV2({
  selectedDate = () => {}, // Callback for when a date is selected
  placeholder, // Placeholder text
  value = "", // Date value passed from formState
  lang = "en", // Language (optional)
}: {
  selectedDate: (date: string) => void;
  placeholder: string;
  value?: string; // Add value prop to accept the initial date from formState
}) {
  const [isOpen, setIsOpen] = useState(false);

  // convert date format from dd-MM-yyyy to dd/MM/yyyy
  const dateValue = value.split("-").join("/");

  const [date, setDate] = useState<Date | null>(
    value ? new Date(dateValue) : null // Initialize with the date from formState, if available
  );

  const handleDateChange = (selected: Date | null) => {
    if (selected) {
      setDate(selected);
      const formattedDate = format(selected, "dd/MM/yyyy"); // Format to dd/MM/yyyy
      selectedDate(formattedDate); // Pass the selected date back to the parent
      setIsOpen(false); // Close the calendar
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
              onClick={() => setIsOpen(true)}
            >
              {date ? (
                `${format(date, "dd-MM-yyyy")} `
              ) : (
                <span>{value ? value : placeholder}</span>
              )}
              <CalendarIcon className="ms-auto h-4 w-4 opacity-50" />
            </div>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              captionLayout="dropdown"
              selected={date}
              onSelect={handleDateChange}
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
