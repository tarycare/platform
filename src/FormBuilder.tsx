// @ts-nocheck
import { useForm } from "react-hook-form";
import { FC, useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { MultiSelect } from "@/components/ui/multi-select";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { DateTimePickerV2 } from "@/components/date-time-picker-v2";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { CaretSortIcon, CheckIcon } from "@radix-ui/react-icons";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

// Function to apply custom validation based on field configuration
const applyValidation = (field: any) => {
  const rules: any = {};

  if (field.required) {
    rules.required = `${field.label_en || field.label_ar} is required`;
  }

  if (field.min) {
    rules.minLength = {
      value: Number(field.min),
      message: `${field.label_en || field.label_ar} must be at least ${
        field.min
      } characters`,
    };
  }

  if (field.max) {
    rules.maxLength = {
      value: Number(field.max),
      message: `${field.label_en || field.label_ar} must be no more than ${
        field.max
      } characters`,
    };
  }

  return rules;
};

const debounce = (func: Function, delay: number) => {
  let timeoutId: any;
  return (...args: any[]) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      func(...args);
    }, delay);
  };
};

const DynamicForm: FC<DynamicFormProps> = ({
  data = { sections: [] }, // Default to an object with an empty sections array to avoid undefined error
  languge,
  handleSubmission,
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    trigger,
  } = useForm();

  // Dynamic state for form fields
  const [formState, setFormState] = useState<{ [key: string]: any }>({});

  const debouncedTrigger = debounce(trigger, 300);

  const onSubmit = (data: any) => {
    handleSubmission(data);
  };

  // Dynamic field state handler
  const handleFieldChange = (fieldName: string, value: any) => {
    setFormState((prevState) => ({
      ...prevState,
      [fieldName]: value,
    }));
    setValue(fieldName, value);
    debouncedTrigger(fieldName);
  };
  // Dynamic field state handler
  const handleSelectChange = (fieldName: string, value: any, item: any) => {
    setFormState((prevState) => ({
      ...prevState,
      [fieldName]: languge === "ar" ? item.label_ar : item.label_en,
    }));
    setValue(fieldName, value);
    debouncedTrigger(fieldName);
  };

  const renderComponent = (field: any) => {
    const label = languge === "ar" ? field.label_ar : field.label_en;
    const placeholder =
      languge === "ar" ? field.placeholder_ar : field.placeholder_en;

    switch (field.type.toLowerCase()) {
      case "text":
      case "email":
      case "phone":
        return (
          <Input
            type={field.type.toLowerCase()}
            placeholder={placeholder}
            value={formState[field.name] || ""}
            onChange={(e) => handleFieldChange(field.name, e.target.value)}
            {...register(field.name, applyValidation(field))}
            className="border p-2 rounded-md bg-background"
          />
        );
      case "number":
        return (
          <Input
            type="text"
            placeholder={placeholder}
            value={formState[field.name] || ""}
            onChange={(e) => handleFieldChange(field.name, e.target.value)}
            {...register(field.name, applyValidation(field))}
            className="border p-2 rounded-md bg-background"
          />
        );
      case "textarea":
        return (
          <Textarea
            placeholder={placeholder}
            value={formState[field.name] || ""}
            onChange={(e) => handleFieldChange(field.name, e.target.value)}
            {...register(field.name, applyValidation(field))}
            className="border p-2 rounded-md bg-background"
          />
        );
      case "checkbox":
        return (
          <div className="flex items-center space-x-2">
            <Checkbox
              id={field.name}
              checked={formState[field.name] || false}
              onCheckedChange={(checked) =>
                handleFieldChange(field.name, checked)
              }
              {...register(field.name)}
            />
            <label htmlFor={field.name} className="text-sm font-medium">
              {label}
            </label>
          </div>
        );
      case "radio":
        return (
          <div>
            {field.items?.map((item: any) => (
              <div key={item.value} className="flex items-center">
                <input
                  type="radio"
                  value={item.value}
                  checked={formState[field.name] === item.value}
                  onChange={() => handleFieldChange(field.name, item.value)}
                  {...register(field.name, applyValidation(field))}
                />
                <label className="ms-2">
                  {languge === "ar" ? item.label_ar : item.label_en}
                </label>
              </div>
            ))}
          </div>
        );
      case "multiselect":
        return (
          <MultiSelect
            options={field.items.map((item) => ({
              value: item.value,
              label_en: item.label_en,
              label_ar: item.label_ar,
            }))}
            onValueChange={(values) => handleFieldChange(field.name, values)}
            defaultValue={formState[field.name] || []}
            placeholder={placeholder}
          />
        );
      case "date":
        return (
          <DateTimePickerV2
            placeholder={placeholder}
            selectedDate={(date) => handleFieldChange(field.name, date)}
          />
        );
      case "select":
        return (
          <>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  className="w-[200px] justify-between text-muted-foreground"
                >
                  {formState[field.name] || placeholder}
                  <CaretSortIcon className="ms-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[200px] p-0 text-muted-foreground">
                <Command>
                  <CommandInput placeholder={placeholder} className="h-9" />
                  <CommandList>
                    <CommandEmpty>No items found.</CommandEmpty>
                    <CommandGroup>
                      {field.items?.map((item: any) => (
                        <CommandItem
                          key={item.value}
                          value={item.value}
                          onSelect={() =>
                            handleSelectChange(field.name, item.value, item)
                          }
                        >
                          {languge === "ar" ? item.label_ar : item.label_en}
                          <CheckIcon
                            className={`ms-auto h-4 w-4 ${
                              formState[field.name] === item.value
                                ? "opacity-100"
                                : "opacity-0"
                            }`}
                          />
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
            {errors[field.name] && (
              <p className="text-red-500 text-sm mt-2">
                {errors[field.name]?.message}
              </p>
            )}
          </>
        );
      default:
        return null;
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-2">
      <Accordion
        type="multiple"
        className="w-full"
        defaultValue={[
          "item-1",
          "item-2",
          "item-3",
          "item-0",
          "item-4",
          "item-5",
          "item-6",
          "item-7",
          "item-8",
          "item-9",
        ]}
      >
        {data?.map((section, index) => (
          <AccordionItem key={index} value={`item-${index}`}>
            <AccordionTrigger>
              <div className="flex items-center gap-x-2 py-2 pb-0">
                <div>{section.section_icon}</div>
                <div>
                  {languge === "ar"
                    ? section.section_label_ar
                    : section.section_label_en}
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              {section.Fields?.map((field) => (
                <div key={field.name} className="flex flex-col mb-4 mx-1">
                  <Label htmlFor={field.name} className="font-medium mb-2">
                    {languge === "ar" ? field.label_ar : field.label_en}
                  </Label>
                  {renderComponent(field)}
                  {errors[field.name] && (
                    <p className="text-red-500 text-sm mt-2">
                      {errors[field.name]?.message}
                    </p>
                  )}
                </div>
              ))}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
      <Button
        type="submit"
        className="bg-blue-500 text-white py-2 px-4 rounded-md"
      >
        Submit
      </Button>
    </form>
  );
};

export default DynamicForm;
