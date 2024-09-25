// @ts-nocheck
import React, { useEffect, useState } from 'react'
import OptionEditor from './OptionEditor'
import { Field } from './types'
import {
    Accordion,
    AccordionItem,
    AccordionTrigger,
    AccordionContent,
} from '../ui/accordion'
import { Input } from '../ui/input'
import { Button } from '../ui/button'
import {
    ArrowDownCircle,
    ArrowUpCircleIcon,
    AtSign,
    CalendarClockIcon,
    CircleDot,
    FileDigit,
    Image,
    List,
    Logs,
    SquareCheck,
    Text,
    Trash2,
    TypeIcon,
} from 'lucide-react'
import { IconTypography } from '@tabler/icons-react'

interface FieldEditorProps {
    field: Field
    updateField: (field: Field) => void
    removeField: (fieldId: string) => void
    moveField: (direction: 'up' | 'down', fieldId: string) => void
    isFirst: boolean
    isLast: boolean
}

const FieldEditor: React.FC<FieldEditorProps> = ({
    field,
    updateField,
    removeField,
    moveField,
    isFirst,
    isLast,
}) => {
    const handleFieldChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
    ) => {
        const { name, value, type, checked } = e.target
        updateField({
            ...field,
            [name]: type === 'checkbox' ? checked : value,
        })
    }

    const [lang, setLang] = useState(document.documentElement.lang)
    useEffect(() => {
        setLang(document.documentElement.lang)
    }, [document.documentElement.lang])

    const moveOption = (direction: 'up' | 'down', optionId: string) => {
        const updatedOptions = [...(field.items || [])]
        const index = updatedOptions.findIndex((item) => item.id === optionId)

        if (index < 0) return

        const targetIndex = direction === 'up' ? index - 1 : index + 1

        if (targetIndex < 0 || targetIndex >= updatedOptions.length) return

        // Swap options
        const temp = updatedOptions[index]
        updatedOptions[index] = updatedOptions[targetIndex]
        updatedOptions[targetIndex] = temp

        // Update order values
        updatedOptions.forEach((item, idx) => {
            item.order = idx
        })

        updateField({ ...field, items: updatedOptions })
    }

    const getIconByType = (type: string) => {
        switch (type) {
            case 'text':
                return <TypeIcon />
            case 'email':
                return <AtSign />
            case 'number':
                return <FileDigit />
            case 'textarea':
                return <Text />
            case 'checkbox':
                return <SquareCheck />
            case 'radio':
                return <CircleDot />
            case 'select':
                return <List />
            case 'multiselect':
                return <Logs />
            case 'date':
                return <CalendarClockIcon />
            case 'upload_image':
                return <Image />
            default:
                return null
        }
    }

    return (
        <div className="flex items-center gap-2">
            <AccordionItem value={`field-${field.order}`} className="flex-1">
                <div className="rounded-md bg-white px-4 py-[6px]">
                    <div className="flex items-center gap-2">
                        <div className="flex items-center gap-x-2">
                            <Button
                                disabled={isFirst}
                                onClick={() => moveField('up', field.id)}
                                className="p-1"
                            >
                                <ArrowUpCircleIcon className="size-4" />
                            </Button>
                            <p className="rounded-sm bg-[#f1f1f1] p-[2px] px-2 font-bold">
                                {Number(field.order) + 1}
                            </p>
                            <Button
                                disabled={isLast}
                                onClick={() => moveField('down', field.id)}
                                className="p-1"
                            >
                                <ArrowDownCircle className="size-4" />
                            </Button>
                            <Button
                                variant={'destructive'}
                                className="p-1"
                                onClick={() => removeField(field.id)}
                            >
                                <Trash2 className="size-4" />
                            </Button>
                        </div>
                        <div className="w-full">
                            <AccordionTrigger className="flex w-full flex-1 items-center">
                                <div className="flex items-center gap-2">
                                    <div className="text-[16px] font-semibold">
                                        {lang === 'ar'
                                            ? field.label_ar
                                            : field.label_en || 'New Field'}
                                    </div>
                                    {/* icon by type */}
                                    <div className="mx-5 text-[14px] text-gray-500">
                                        {getIconByType(field.type)}
                                    </div>
                                </div>
                            </AccordionTrigger>
                        </div>
                    </div>
                    <AccordionContent className="pt-2">
                        <div className="grid w-full grid-cols-12 gap-2 p-2">
                            <label className="col-span-6 flex items-center">
                                <Input
                                    type="checkbox"
                                    name="required"
                                    checked={field.required}
                                    onChange={handleFieldChange}
                                />
                                Required
                            </label>
                            <label className="col-span-6 flex items-center">
                                <Input
                                    type="checkbox"
                                    name="showInList"
                                    checked={field.showInList}
                                    onChange={handleFieldChange}
                                />
                                Show in List
                            </label>
                            <label className="col-span-6">
                                <div className="mb-1">Type:</div>
                                <select
                                    name="type"
                                    value={field.type}
                                    onChange={handleFieldChange}
                                    className="h-[36px] w-full"
                                    id="field-type"
                                >
                                    <option value="text">Text</option>
                                    <option value="email">Email</option>
                                    <option value="number">Number</option>
                                    <option value="textarea">Textarea</option>
                                    <option value="checkbox">Checkbox</option>
                                    <option value="radio">Radio</option>
                                    <option value="select">Select</option>
                                    <option value="multiselect">
                                        Multi Select
                                    </option>
                                    <option value="date">Date</option>
                                    <option value="upload_image">
                                        Upload Image
                                    </option>
                                </select>
                            </label>
                            <label className="col-span-6">
                                <div className="mb-1">Column Span (3-12):</div>
                                <Input
                                    type="number"
                                    name="colSpan"
                                    value={field.colSpan}
                                    onChange={handleFieldChange}
                                    min="3"
                                    max="12"
                                    className="w-full rounded border p-2"
                                />
                            </label>
                            <Input
                                type="text"
                                name="name"
                                value={field.name}
                                onChange={handleFieldChange}
                                placeholder="Field Name (unique identifier)"
                                className="col-span-6"
                            />
                            <Input
                                type="text"
                                name="label_en"
                                value={field.label_en}
                                onChange={handleFieldChange}
                                placeholder="Label (EN)"
                                className="col-span-6"
                            />
                            <Input
                                type="text"
                                name="label_ar"
                                value={field.label_ar}
                                onChange={handleFieldChange}
                                placeholder="Label (AR)"
                                className="col-span-6"
                            />
                            <Input
                                type="text"
                                name="help_en"
                                value={field.help_en}
                                onChange={handleFieldChange}
                                placeholder="Help (EN)"
                                className="col-span-6"
                            />
                            <Input
                                type="text"
                                name="help_ar"
                                value={field.help_ar}
                                onChange={handleFieldChange}
                                placeholder="Help (AR)"
                                className="col-span-6"
                            />
                            <Input
                                type="text"
                                name="placeholder_en"
                                value={field.placeholder_en}
                                onChange={handleFieldChange}
                                placeholder="Placeholder (EN)"
                                className="col-span-6"
                            />
                            <Input
                                type="text"
                                name="placeholder_ar"
                                value={field.placeholder_ar}
                                onChange={handleFieldChange}
                                placeholder="Placeholder (AR)"
                                className="col-span-6"
                            />
                            {field.type === 'number' && (
                                <>
                                    <Input
                                        type="number"
                                        name="min"
                                        value={field.min}
                                        onChange={handleFieldChange}
                                        placeholder="Min characters"
                                        className="col-span-6"
                                    />
                                    <Input
                                        type="number"
                                        name="max"
                                        value={field.max}
                                        onChange={handleFieldChange}
                                        placeholder="Max characters"
                                        className="col-span-6"
                                    />
                                </>
                            )}
                        </div>

                        {[
                            'select',
                            'radio',
                            'checkbox',
                            'multiselect',
                        ].includes(field.type) && (
                            <OptionEditor
                                field={field}
                                updateField={updateField}
                                moveOption={moveOption}
                            />
                        )}
                    </AccordionContent>
                </div>
            </AccordionItem>
        </div>
    )
}

export default FieldEditor
