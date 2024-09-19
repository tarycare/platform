// @ts-nocheck
import React, { FC, useEffect, useState } from 'react'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { MultiSelect } from '@/components/ui/multi-select'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { DateTimePickerV2 } from '@/components/date-time-picker-v2'
import { useLocation } from 'react-router-dom'

import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from '@/components/ui/command'
import { CaretSortIcon, CheckIcon } from '@radix-ui/react-icons'
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from '@/components/ui/accordion'
import { HelpCircleIcon, Loader2 } from 'lucide-react'

import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover'
import { useNavigate, useParams } from 'react-router-dom'

// Function to apply custom validation based on field configuration
const applyValidation = (field: any, value: any, languge: string) => {
    let error = ''

    // Determine which language to display
    const label = languge === 'ar' ? field.label_ar : field.label_en

    // Convert value to string for length validation checks
    const valueAsString = value?.toString() || ''
    const minLength = Number(field.min)
    const maxLength = Number(field.max)

    // Required field validation
    if (field.required && (!value || valueAsString === '')) {
        error = languge === 'ar' ? `${label} مطلوب` : `${label} is required`
        return error
    }

    // If the field is not required but the user has entered a value, check for min and max length
    if (valueAsString) {
        if (field.type.toLowerCase() === 'number') {
            // Validate length for ID number
            if (minLength && maxLength && minLength === maxLength) {
                if (valueAsString.length !== minLength) {
                    error =
                        languge === 'ar'
                            ? `${label} يجب أن يكون ${minLength} أرقام`
                            : `${label} must be exactly ${minLength} characters`
                    return error
                }
            } else {
                // Validate if the input is within the range of allowed lengths
                if (minLength && valueAsString.length < minLength) {
                    error =
                        languge === 'ar'
                            ? `${label} يجب أن يكون على الأقل ${minLength} أرقام`
                            : `${label} must be at least ${minLength} characters`
                    return error
                }
                if (maxLength && valueAsString.length > maxLength) {
                    error =
                        languge === 'ar'
                            ? `${label} يجب أن يكون على الأكثر ${maxLength} أرقام`
                            : `${label} must be no more than ${maxLength} characters`
                    return error
                }
            }
        }
    }

    return error
}

const debounce = (func: Function, delay: number) => {
    let timeoutId: any
    return (...args: any[]) => {
        clearTimeout(timeoutId)
        timeoutId = setTimeout(() => {
            func(...args)
        }, delay)
    }
}

const FormViewer: FC<FormViewerProps> = ({
    data = { sections: [] },
    languge = document.documentElement.lang,
    handleSubmission,
    handleUpdate,
    isSubmitting,
    props,
    updateData,
    updateUrl,
    isUpdating,
}) => {
    const [formState, setFormState] = useState<{ [key: string]: any }>({})
    const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({})

    useEffect(() => {
        if (isUpdating) {
            const parsedData = JSON.parse(updateData)
            setFormState(parsedData)
        }
    }, [updateData, isUpdating])

    useEffect(() => {
        console.log('Updated formState', formState)
    }, [formState])

    const debouncedTrigger = debounce((fieldName: string) => {
        validateField(fieldName, formState[fieldName])
    }, 300)

    const onSubmit = (event: React.FormEvent) => {
        event.preventDefault()
        const errors = validateForm()
        if (Object.keys(errors).length === 0) {
            const currentPath = window.location.hash // Use window.location to get the current path
            const isAdding = currentPath === '#/add' // Determine if we are on the /add route

            console.log('isAddMode', isAdding)

            if (!isAdding) {
                handleUpdate(formState)
            } else {
                handleSubmission(formState)
            }
        }
    }

    const validateField = (fieldName: string, value: any) => {
        const field = data
            .flatMap((section) => section.Fields)
            .find((f) => f.name === fieldName)

        if (field) {
            const error = applyValidation(field, value, languge) // Pass the language prop
            setFormErrors((prev) => ({ ...prev, [fieldName]: error }))
        }
    }

    const validateForm = () => {
        const errors: { [key: string]: string } = {}

        data.forEach((section) => {
            section.Fields.forEach((field: any) => {
                const value = formState[field.name]
                const error = applyValidation(field, value, languge) // Pass the language prop
                if (error) {
                    errors[field.name] = error
                }
            })
        })

        setFormErrors(errors)
        return errors
    }

    const handleFieldChange = (fieldName: string, value: any) => {
        // Find the field definition based on the fieldName
        const field = data
            .flatMap((section) => section.Fields)
            .find((f) => f.name === fieldName)

        let formattedValue = value

        // If the field type is 'date', convert the date to the desired format
        if (field && field.type.toLowerCase() === 'date') {
            const dateParts = value.split('/')
            if (dateParts.length === 3) {
                // Assuming value is in DD/MM/YYYY format, convert it to YYYY-MM-DD
                const [day, month, year] = dateParts
                formattedValue = `${year}-${month}-${day}`
            }
        }

        setFormState((prevState) => ({
            ...prevState,
            [fieldName]: formattedValue,
        }))

        // Validate the field
        validateField(fieldName, formattedValue)
    }

    const renderComponent = (field: any) => {
        const label = languge === 'ar' ? field.label_ar : field.label_en
        const placeholder =
            languge === 'ar' ? field.placeholder_ar : field.placeholder_en

        switch (field.type.toLowerCase()) {
            case 'text':
            case 'phone':
                return (
                    <Input
                        type={field.type.toLowerCase()}
                        placeholder={placeholder}
                        value={formState[field.name] || ''} // Ensure formState is used correctly here
                        onChange={(e) =>
                            handleFieldChange(field.name, e.target.value)
                        }
                        className="rounded-md border p-2 text-start"
                    />
                )

            case 'email':
                return (
                    <div>
                        <Input
                            type="text"
                            placeholder={placeholder}
                            value={formState[field.name] || ''}
                            onChange={(e) =>
                                handleFieldChange(field.name, e.target.value)
                            }
                            className="rounded-md border p-2 text-start"
                        />
                    </div>
                )

            case 'number':
                return (
                    <Input
                        type="text"
                        placeholder={placeholder}
                        value={formState[field.name] || ''}
                        onChange={(e) =>
                            handleFieldChange(field.name, e.target.value)
                        }
                        className="rounded-md border p-2 text-start"
                    />
                )

            case 'textarea':
                return (
                    <Textarea
                        placeholder={placeholder}
                        value={formState[field.name] || ''}
                        onChange={(e) =>
                            handleFieldChange(field.name, e.target.value)
                        }
                        className="col-span-12 rounded-md border bg-background p-2"
                        rows={4}
                    />
                )

            case 'checkbox':
                if (field.items && field.items?.length > 0) {
                    // Multiple checkboxes
                    return (
                        <div className="flex flex-wrap items-center gap-2">
                            {field.items?.map((item: any) => (
                                <div
                                    key={item.value}
                                    className="flex items-center gap-x-2"
                                >
                                    <Checkbox
                                        id={item.value}
                                        checked={
                                            formState[field.name]?.includes(
                                                item.value
                                            ) || false
                                        }
                                        onCheckedChange={(checked) => {
                                            let newValues =
                                                formState[field.name] || []
                                            if (checked) {
                                                newValues = [
                                                    ...newValues,
                                                    item.value,
                                                ]
                                            } else {
                                                newValues = newValues.filter(
                                                    (val: any) =>
                                                        val !== item.value
                                                )
                                            }
                                            handleFieldChange(
                                                field.name,
                                                newValues
                                            )
                                        }}
                                    />
                                    <label
                                        htmlFor={item.value}
                                        className="text-sm"
                                    >
                                        {languge === 'ar'
                                            ? item.label_ar
                                            : item.label_en}
                                    </label>
                                </div>
                            ))}
                        </div>
                    )
                } else {
                    // Single checkbox
                    return (
                        <div className="flex items-center gap-x-2">
                            <Checkbox
                                id={`${item.value}-${field.name}`}
                                checked={formState[field.name] || false}
                                onCheckedChange={(checked) =>
                                    handleFieldChange(field.name, checked)
                                }
                            />
                            <label
                                htmlFor={`${item.value}-${field.name}`}
                                className="text-sm font-medium"
                            >
                                {label}
                            </label>
                        </div>
                    )
                }

            case 'radio':
                return (
                    <div className="flex flex-wrap items-center gap-2">
                        {field.items?.map((item: any) => (
                            <div
                                key={item.value}
                                className="flex items-center text-sm font-medium"
                            >
                                <input
                                    type="radio"
                                    value={item.value}
                                    checked={
                                        formState[field.name] === item.value
                                    }
                                    onChange={() =>
                                        handleFieldChange(
                                            field.name,
                                            item.value
                                        )
                                    }
                                    id={`${item.value}-${field.name}`}
                                />
                                <label
                                    className="ms-1 translate-y-[-1px] font-normal"
                                    htmlFor={`${item.value}-${field.name}`}
                                >
                                    {languge === 'ar'
                                        ? item.label_ar
                                        : item.label_en}
                                </label>
                            </div>
                        ))}
                    </div>
                )

            case 'multiselect':
                return (
                    <MultiSelect
                        options={field.items?.map((item) => ({
                            value: item.value,
                            label_en: item.label_en,
                            label_ar: item.label_ar,
                        }))}
                        onValueChange={(values) =>
                            handleFieldChange(field.name, values)
                        }
                        defaultValue={formState[field.name] || []}
                        placeholder={placeholder}
                    />
                )

            case 'date':
                console.log(
                    `Date value for ${field.name}:`,
                    formState[field.name]
                )

                return (
                    <DateTimePickerV2
                        placeholder={placeholder}
                        selectedDate={(date) =>
                            handleFieldChange(field.name, date)
                        } // Handle date change
                        value={formState[field.name]} // Pass current date value from formState
                    />
                )

            case 'select':
                const selectedItem = field?.items?.find(
                    (item: any) => item.value === formState[field.name]
                )

                return (
                    <>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    variant="outline"
                                    role="combobox"
                                    className="justify-between text-muted-foreground hover:bg-background"
                                >
                                    {/* Display the selected label in the correct language */}
                                    {selectedItem
                                        ? languge === 'ar'
                                            ? selectedItem.label_ar
                                            : selectedItem.label_en
                                        : placeholder}
                                    <CaretSortIcon className="ms-2 h-4 w-4 shrink-0 opacity-50" />
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="p-0 text-muted-foreground">
                                <Command>
                                    <CommandInput
                                        placeholder={placeholder}
                                        className="h-9"
                                    />
                                    <CommandList>
                                        <CommandEmpty>
                                            No items found.
                                        </CommandEmpty>
                                        <CommandGroup>
                                            {field.items?.map((item: any) => (
                                                <CommandItem
                                                    key={item.value}
                                                    value={item.value}
                                                    onSelect={() =>
                                                        handleFieldChange(
                                                            field.name,
                                                            item.value
                                                        )
                                                    }
                                                >
                                                    {/* Display the label in the correct language */}
                                                    {languge === 'ar'
                                                        ? item.label_ar
                                                        : item.label_en}
                                                    <CheckIcon
                                                        className={`ms-auto h-4 w-4 ${
                                                            formState[
                                                                field.name
                                                            ] === item.value
                                                                ? 'opacity-100'
                                                                : 'opacity-0'
                                                        }`}
                                                    />
                                                </CommandItem>
                                            ))}
                                        </CommandGroup>
                                    </CommandList>
                                </Command>
                            </PopoverContent>
                        </Popover>
                    </>
                )

            default:
                return null
        }
    }

    if (!data) {
        return null
    }
    // if (!data || !formState || Object.keys(formState).length === 0) {
    //   return <div>Loading...</div>; // Avoid rendering form until data is available
    // }

    return (
        <>
            <form onSubmit={onSubmit} className="gap-y-3">
                <Accordion
                    type="multiple"
                    className="w-full"
                    defaultValue={['item-0', 'item-1', 'item-2', 'item-3']}
                >
                    {data
                        ?.sort((a, b) => Number(a.order) - Number(b.order))
                        .map((section, index) => (
                            <AccordionItem key={index} value={`item-${index}`}>
                                <AccordionTrigger>
                                    <div className="flex flex-col gap-1">
                                        <div className="ms-[5px] flex items-center gap-x-2 px-3 py-[6px]">
                                            <div className="size-5">
                                                {section.section_icon}
                                            </div>
                                            <div className="text-[16px] font-bold text-foreground">
                                                {languge === 'ar'
                                                    ? section.section_label_ar
                                                    : section.section_label_en}
                                            </div>
                                        </div>
                                        {/* desc */}
                                        {(section.section_description_ar ||
                                            section.section_description_en) && (
                                            <div className="mx-1 flex flex-col px-3 pt-[5px]">
                                                <Label className="mb-2 mt-[-12px] text-start text-sm font-normal text-slate-500">
                                                    {languge === 'ar'
                                                        ? section.section_description_ar
                                                        : section.section_description_en}
                                                </Label>
                                            </div>
                                        )}
                                        {/* <Separator className="mb-3 " /> */}
                                    </div>
                                </AccordionTrigger>
                                <AccordionContent className="grid grid-cols-12">
                                    {section.Fields?.sort(
                                        (a, b) =>
                                            Number(a.order) - Number(b.order)
                                    ).map((field) => (
                                        <div
                                            key={field.name}
                                            className={`mx-1 mb-5 mt-2 flex flex-col px-3 col-span-${
                                                field.colSpan || 6
                                            }`}
                                        >
                                            <div className="mb-[9px] flex items-center justify-between">
                                                <Label
                                                    htmlFor={field.name}
                                                    className="font-bold"
                                                >
                                                    {languge === 'ar'
                                                        ? field.label_ar
                                                        : field.label_en}
                                                    {/* red star if req */}
                                                    {field.required && (
                                                        <span className="ms-1 text-red-500">
                                                            *
                                                        </span>
                                                    )}
                                                </Label>
                                                {(field.help_en ||
                                                    field.help_ar) && (
                                                    <Popover>
                                                        <PopoverTrigger>
                                                            <HelpCircleIcon className="me-1 size-[14px] cursor-pointer text-muted-foreground hover:opacity-90" />
                                                        </PopoverTrigger>
                                                        <PopoverContent className="w-fit">
                                                            <div className="">
                                                                <p className="text-xs font-normal">
                                                                    {languge ===
                                                                    'ar'
                                                                        ? field.help_ar
                                                                        : field.help_en}
                                                                </p>
                                                            </div>
                                                        </PopoverContent>
                                                    </Popover>
                                                )}
                                            </div>
                                            {renderComponent(field)}
                                            {formErrors[field.name] && (
                                                <p className="mt-2 text-sm text-red-500">
                                                    {formErrors[field.name]}
                                                </p>
                                            )}
                                        </div>
                                    ))}
                                </AccordionContent>
                            </AccordionItem>
                        ))}
                </Accordion>
                <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? (
                        <Loader2 className="h-5 w-5 animate-spin text-background" />
                    ) : languge === 'ar' ? (
                        'إرسال'
                    ) : (
                        'Submit'
                    )}
                </Button>
            </form>
        </>
    )
}

export default FormViewer
