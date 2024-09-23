import React, { useEffect, useState } from 'react'
import SectionEditor from './SectionEditor'
import PreviewForm from './PreviewForm'
import { FormConfig, Section } from './types'
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from '../ui/accordion'
import { Button } from '../ui/button'

import { v4 as uuidv4 } from 'uuid'

const FormBuilder: React.FC = () => {
    const [formConfig, setFormConfig] = useState<FormConfig>({
        sections: [], // Ensures sections are always initialized as an array
    })

    const fetchUrl =
        'https://api.airtable.com/v0/app9i3YvEiYbCo4XN/apps/recdETedrTkAm2BIR'
    const [isLoading, setIsLoading] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)

    useEffect(() => {
        async function fetchData() {
            setIsLoading(true)
            setIsSubmitting(true)
            try {
                const response = await fetch(fetchUrl, {
                    method: 'GET',
                    headers: {
                        Authorization:
                            'Bearer pat4Qsb1Mw7JFJFh7.6c8455ef5b19cc8e9fc0f452a62bee582a4e04ac0cb954463b6acad99f72de5d',
                    },
                })
                const data = await response.json()
                const fields = data.fields
                const JSONData = JSON.parse(fields.JSONData)

                // Set formConfig state with updated sections or an empty array as fallback
                setFormConfig({
                    sections: JSONData.sections || [], // Fallback to an empty array if sections is undefined
                })
            } catch (error) {
                console.error('Error fetching form data:', error)
            } finally {
                setIsLoading(false)
                setIsSubmitting(false)
            }
        }

        if (fetchUrl) {
            fetchData()
        }
    }, [fetchUrl])

    const addSection = () => {
        setFormConfig((prev) => ({
            ...prev,
            sections: [
                ...prev.sections,
                {
                    id: new Date().getTime().toString(),
                    section_label_en: 'New Section',
                    section_label_ar: 'قسم جديد',
                    section_description_en: '',
                    section_description_ar: '',
                    section_icon: '',
                    Fields: [],
                    order: prev.sections.length,
                    sectionName: 'section',
                },
            ],
        }))
    }

    const updateSection = (updatedSection: Section) => {
        setFormConfig((prev) => ({
            ...prev,
            sections: prev.sections?.map((section) =>
                section.id === updatedSection.id ? updatedSection : section
            ),
        }))
    }

    const removeSection = (sectionId: string) => {
        if (window.confirm('Are you sure you want to delete this section?')) {
            setFormConfig((prev) => ({
                ...prev,
                sections: prev.sections?.filter(
                    (section) => section.id !== sectionId
                ),
            }))
        }
    }

    const moveSection = (direction: 'up' | 'down', sectionId: string) => {
        setFormConfig((prev) => {
            const sections = [...prev.sections]
            const index = sections.findIndex(
                (section) => section.id === sectionId
            )

            if (index < 0) return prev

            const targetIndex = direction === 'up' ? index - 1 : index + 1

            if (targetIndex < 0 || targetIndex >= sections.length) return prev

            // Swap sections
            const temp = sections[index]
            sections[index] = sections[targetIndex]
            sections[targetIndex] = temp

            // Update order values
            sections.forEach((section, idx) => {
                section.order = idx
            })

            return { ...prev, sections }
        })
    }

    return (
        <div className="form-builder p-4">
            <h2 className="mb-4 text-2xl font-bold">Form Builder</h2>
            <Button onClick={addSection} className="mb-3">
                Add Section
            </Button>
            <div className="flex gap-2">
                <Accordion
                    type="single"
                    className="flex w-full flex-1 flex-col gap-2 rounded p-2"
                    collapsible
                >
                    {formConfig.sections?.map((section, index) => (
                        <div>
                            <SectionEditor
                                key={`section-${section.id}}`}
                                section={section}
                                updateSection={updateSection}
                                removeSection={removeSection}
                                moveSection={moveSection}
                                isFirst={index === 0}
                                isLast={
                                    index === formConfig.sections.length - 1
                                }
                            />
                        </div>
                    ))}
                </Accordion>

                {/* Preview the form */}
                {formConfig.sections.length > 0 && (
                    <div className="w-[800px] p-2">
                        <PreviewForm data={formConfig.sections} />
                    </div>
                )}
            </div>

            {/* Display generated JSON */}
            <Accordion type="single" className="mt-4 w-full" collapsible>
                <AccordionItem value={`json`} className="flex-1">
                    <AccordionTrigger className="flex items-center gap-2">
                        <h2 className="px-2 py-2 text-[16px] font-bold">
                            Generated JSON
                        </h2>
                    </AccordionTrigger>
                    <AccordionContent className="pt-2">
                        <pre className="rounded bg-gray-100 p-4" dir="ltr">
                            {JSON.stringify(formConfig.sections, null, 2)}
                        </pre>
                    </AccordionContent>
                </AccordionItem>
            </Accordion>
        </div>
    )
}

export default FormBuilder
