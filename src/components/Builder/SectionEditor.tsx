// SectionEditor.tsx
import React, { useEffect, useState } from 'react'
import FieldEditor from './FieldEditor'
import { Section, Field } from './types'
import {
    Accordion,
    AccordionItem,
    AccordionTrigger,
    AccordionContent,
} from '../ui/accordion'
import { Input } from '../ui/input'
import { Textarea } from '../ui/textarea'
import { Button } from '../ui/button'
import { ArrowDownCircleIcon, ArrowUpCircleIcon, Trash2 } from 'lucide-react'
import { IconPlus } from '@tabler/icons-react'

import { v4 as uuid } from 'uuid'
interface SectionEditorProps {
    section: Section
    updateSection: (section: Section) => void
    removeSection: (sectionId: string) => void
    moveSection: (direction: 'up' | 'down', sectionId: string) => void
    isFirst: boolean
    isLast: boolean
}

const SectionEditor: React.FC<SectionEditorProps> = ({
    section,
    updateSection,
    removeSection,
    moveSection,
    isFirst,
    isLast,
}) => {
    const updateField = (updatedField: Field) => {
        const updatedFields = section.Fields.map((field) =>
            field.id === updatedField.id ? updatedField : field
        )
        updateSection({ ...section, Fields: updatedFields })
    }

    const addField = () => {
        const newField: Field = {
            id: uuid(),
            name: '',
            label_en: '',
            label_ar: '',
            type: 'text',
            placeholder_en: '',
            placeholder_ar: '',
            required: false,
            order: section.Fields.length,
            colSpan: 6,
            items: [],
        }
        if (section.Fields.length > 0) {
            const lastField = section.Fields[section.Fields.length - 1]
            if (!lastField.name) {
                alert('Please fill the last field name')
                return
            }
        }
        const updatedFields = [...section.Fields, newField].map(
            (field, index) => ({
                ...field,
                order: index,
            })
        )

        updateSection({
            ...section,
            Fields: updatedFields,
        })
    }

    const removeField = (fieldId: string) => {
        if (window.confirm('Are you sure you want to delete this field?')) {
            const updatedFields = section.Fields.filter(
                (field) => field.id !== fieldId
            )
            updateSection({ ...section, Fields: updatedFields })
        }
    }

    const handleSectionChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        const { name, value } = e.target
        updateSection({ ...section, [name]: value })
    }

    const moveField = (direction: 'up' | 'down', fieldId: string) => {
        const updatedFields = [...section.Fields]
        const index = updatedFields.findIndex((field) => field.id === fieldId)

        if (index < 0) return

        const targetIndex = direction === 'up' ? index - 1 : index + 1

        if (targetIndex < 0 || targetIndex >= updatedFields.length) return

        // Swap fields
        const temp = updatedFields[index]
        updatedFields[index] = updatedFields[targetIndex]
        updatedFields[targetIndex] = temp

        // Update order values
        updatedFields.forEach((field, idx) => {
            field.order = idx
        })

        updateSection({ ...section, Fields: updatedFields })
    }
    const [lang, setLang] = useState(document.documentElement.lang)
    useEffect(() => {
        setLang(document.documentElement.lang)
    }, [document.documentElement.lang])

    return (
        <div className="flex items-center gap-2">
            <AccordionItem
                value={`section-${section.order}`}
                className="flex-1"
            >
                <div className="py-[6px] ps-4">
                    <div className="section-editor">
                        <div className="flex items-center gap-2">
                            <div className="flex items-center gap-x-2">
                                <Button
                                    disabled={isFirst}
                                    onClick={() =>
                                        moveSection('up', section.id)
                                    }
                                    className="p-1"
                                >
                                    <ArrowUpCircleIcon className="size-5" />
                                </Button>

                                <p className="rounded-sm bg-background p-1 px-2 font-bold">
                                    {/* order number */} {section.order + 1}
                                </p>
                                <Button
                                    disabled={isLast}
                                    onClick={() =>
                                        moveSection('down', section.id)
                                    }
                                    className="p-1"
                                >
                                    <ArrowDownCircleIcon className="size-5" />
                                </Button>
                                <Button
                                    variant={'destructive'}
                                    className="p-1"
                                    onClick={() => removeSection(section.id)}
                                >
                                    <Trash2 className="size-4" />
                                </Button>
                            </div>
                            <div className="w-full">
                                <AccordionTrigger className="flex items-center gap-2">
                                    <div className="text-[16px] font-semibold">
                                        {lang === 'ar'
                                            ? section.section_label_ar
                                            : section.section_label_en}
                                    </div>
                                </AccordionTrigger>
                            </div>
                        </div>
                        <AccordionContent className="pe-4 pt-2">
                            <div className="grid grid-cols-2 gap-2 p-2">
                                <Input
                                    type="text"
                                    name="section_label_en"
                                    value={section.section_label_en}
                                    onChange={handleSectionChange}
                                    placeholder="Section Label (EN)"
                                />
                                <Input
                                    type="text"
                                    name="section_label_ar"
                                    value={section.section_label_ar}
                                    onChange={handleSectionChange}
                                    placeholder="Section Label (AR)"
                                />
                                <Textarea
                                    name="section_description_en"
                                    value={section.section_description_en}
                                    onChange={handleSectionChange}
                                    placeholder="Section Description (EN)"
                                />
                                <Textarea
                                    name="section_description_ar"
                                    value={section.section_description_ar}
                                    onChange={handleSectionChange}
                                    placeholder="Section Description (AR)"
                                />
                                <Input
                                    type="text"
                                    name="section_icon"
                                    value={section.section_icon}
                                    onChange={handleSectionChange}
                                    placeholder="Section Icon (optional)"
                                    className="w-[200px]"
                                />
                            </div>
                            <div className="my-3 flex gap-2">
                                <Button
                                    onClick={addField}
                                    variant={'outline'}
                                    className="flex items-center gap-2"
                                >
                                    Add Field <IconPlus size={14} />
                                </Button>
                            </div>
                            <div>
                                <Accordion
                                    type="single"
                                    collapsible
                                    className="mt-2 flex flex-col gap-3"
                                >
                                    {section.Fields.map((field, index) => (
                                        <FieldEditor
                                            key={`field--${field.id}`} // Ensure FieldEditor also has a unique key
                                            field={field}
                                            updateField={updateField}
                                            removeField={removeField}
                                            moveField={moveField}
                                            isFirst={index === 0}
                                            isLast={
                                                index ===
                                                section.Fields.length - 1
                                            }
                                        />
                                    ))}
                                </Accordion>
                            </div>
                        </AccordionContent>
                    </div>
                </div>
            </AccordionItem>
        </div>
    )
}

export default SectionEditor
