// @ts-nocheck
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
import { Input } from '../ui/input'
import { v4 as uuidv4 } from 'uuid'
import { useNavigate, useParams } from 'react-router-dom'
import { useToast } from './components/ui/use-toast'
import { toast, Toaster } from 'sonner'
import {
    IconBookUpload,
    IconCirclePlus,
    IconCirclePlus2,
    IconDeviceFloppy,
    IconJson,
    IconNewSection,
    IconPlus,
    IconSend,
    IconUpload,
} from '@tabler/icons-react'
import { Label } from '../ui/label'

const FormBuilder: React.FC = () => {
    const navigate = useNavigate() // Initialize useNavigate

    const [formConfig, setFormConfig] = useState<FormConfig>({
        title: '',
        sections: [],
    })

    const { id } = useParams()
    const isUpdating = Boolean(id)

    const fetchUrl = `/wp-json/form/v1/get/${id}`
    const addUrl = `/wp-json/form/v1/add`
    const updateUrl = `/wp-json/form/v1/update/${id}`

    const [isLoading, setIsLoading] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [jsonInput, setJsonInput] = useState('') // State for raw JSON input

    useEffect(() => {
        if (!isUpdating) return

        async function fetchData() {
            setIsLoading(true)
            try {
                const response = await fetch(fetchUrl, {
                    method: 'GET',
                })
                const data = await response.json()
                console.log('Fetched form data:', data)

                setFormConfig({
                    title: data.title || '',
                    sections: data.sections || [],
                })
                toast.success('Form data loaded successfully')
            } catch (error) {
                console.error('Error fetching form data:', error)
                toast.error('Failed to load form data')
            } finally {
                setIsLoading(false)
            }
        }

        fetchData()
    }, [fetchUrl, isUpdating])

    const addSection = () => {
        setFormConfig((prev) => ({
            ...prev,
            sections: [
                ...prev.sections,
                {
                    id: uuidv4(),
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

            if (targetIndex < 0 || targetIndex >= sections.length)
                return prev

                // Swap sections
            ;[sections[index], sections[targetIndex]] = [
                sections[targetIndex],
                sections[index],
            ]

            // Update order values
            sections.forEach((section, idx) => {
                section.order = idx
            })

            return { ...prev, sections }
        })
    }

    const duplicateSection = (sectionId: string) => {
        const section = formConfig.sections.find(
            (section) => section.id === sectionId
        )

        if (!section) return

        const newSection = {
            ...section,
            id: uuidv4(), // Generate a new unique ID for the duplicated section
            order: formConfig.sections.length, // Set the order to the end of the list
        }

        setFormConfig((prev) => ({
            ...prev,
            sections: [...prev.sections, newSection],
        }))
    }

    const handleSubmit = async () => {
        setIsSubmitting(true)
        try {
            const url = isUpdating ? updateUrl : addUrl
            const method = isUpdating ? 'PUT' : 'POST'
            const nonce = window?.appLocalizer?.nonce || ''

            const payload = {
                title: formConfig.title,
                sections: formConfig.sections,
            }
            !isUpdating && (payload.is_app_form = 0)

            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'X-WP-Nonce': nonce,
                },
                body: JSON.stringify(payload),
            })

            if (!response.ok) {
                toast.error('Failed to save form data')

                throw new Error('Network response was not ok')
            }

            const data = await response.json()
            console.log('Form saved successfully:', data)
            toast.success('Form saved successfully', {
                dir: 'ltr',
            })

            const id = data.post_id
            // Optionally redirect or show a success message
            !isUpdating && navigate(`/update/${id}`)
        } catch (error) {
            console.error('Error submitting form data:', error)
            toast.error('Failed to save form data')
            // Optionally show an error message
        } finally {
            setIsSubmitting(false)
        }
    }

    // Load JSON handler
    const handleLoadJson = () => {
        try {
            const parsedJson = JSON.parse(jsonInput)
            if (parsedJson.sections) {
                setFormConfig(parsedJson)
                toast.success('JSON data loaded successfully')
            } else {
                toast.error('Invalid JSON format. Please check the structure.')
            }
        } catch (error) {
            console.error('Invalid JSON:', error)
            toast.error('Failed to parse JSON. Please check the format.')
        }
    }

    const htmlLang = document.documentElement.lang

    return (
        <div className="form-builder p-4">
            <Toaster
                richColors
                position={
                    document.documentElement.lang === 'ar'
                        ? 'bottom-center'
                        : 'bottom-center'
                }
            />

            <h2 className="mb-4 text-2xl font-bold">
                {document.documentElement.lang === 'ar' ? (
                    <div dir="rtl" className="flex items-center gap-2">
                        {formConfig.title
                            ? 'عنوان النموذج : ' + formConfig.title
                            : 'بناء النموذج'}
                    </div>
                ) : (
                    <div className="flex items-center gap-2">
                        {formConfig.title
                            ? 'Form Title: ' + formConfig.title
                            : 'Form Builder'}
                    </div>
                )}
            </h2>

            {/* Form Title Input */}
            <Label>
                <div className="mb-2 font-bold">
                    {document.documentElement.lang === 'ar'
                        ? 'عنوان النموذج'
                        : 'Form Title'}
                </div>
                <Input
                    type="text"
                    value={formConfig.title}
                    onChange={(e) =>
                        setFormConfig({ ...formConfig, title: e.target.value })
                    }
                    placeholder="Enter form title"
                    className="mb-4 max-w-sm"
                />
            </Label>

            {/* Main Content */}
            <div className="flex gap-2">
                <Accordion
                    type="single"
                    className="flex w-full flex-1 flex-col gap-2 rounded p-2"
                    collapsible
                >
                    {/* Buttons */}
                    <div className="mb-3 flex justify-center">
                        <Button
                            onClick={addSection}
                            className="flex items-center gap-2"
                            variant={'outline'}
                        >
                            Add Section
                            <IconNewSection size={20} />
                        </Button>
                    </div>
                    {formConfig.sections?.map((section, index) => (
                        <SectionEditor
                            key={`section-build-${section.id}`}
                            section={section}
                            updateSection={updateSection}
                            removeSection={removeSection}
                            moveSection={moveSection}
                            duplicateSection={() =>
                                duplicateSection(section.id)
                            } // Pass the function correctly
                            isFirst={index === 0}
                            isLast={index === formConfig.sections.length - 1}
                        />
                    ))}
                </Accordion>

                {/* Preview the form */}
                {formConfig.sections.length > 0 && (
                    <div className="w-[800px] p-2">
                        <div className="mb-5 flex justify-center">
                            <Button
                                onClick={handleSubmit}
                                disabled={
                                    formConfig.title === '' ||
                                    formConfig.sections.length === 0 ||
                                    isSubmitting
                                }
                            >
                                {isUpdating ? (
                                    <div className="flex items-center gap-2">
                                        Update Form
                                        <IconDeviceFloppy size={20} />
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-2">
                                        <IconSend size={20} />
                                        Add Form
                                    </div>
                                )}
                            </Button>
                        </div>
                        <PreviewForm data={formConfig.sections} />
                    </div>
                )}
            </div>

            {/* Paste json to load it in textarea with button load data  */}
            <Accordion
                type="single"
                className="mt-4 w-full"
                collapsible
                dir="ltr"
            >
                <AccordionItem value="load-json" className="flex-1">
                    <AccordionTrigger
                        className="flex items-center gap-2"
                        dir="ltr"
                    >
                        <div className="flex items-center gap-2 px-2 py-2 text-[16px] font-bold">
                            <IconBookUpload size={20} />
                            Load local JSON
                        </div>
                    </AccordionTrigger>
                    <AccordionContent className="p-5 pt-2" dir="ltr">
                        <div className="mt-5 flex flex-col gap-5">
                            <textarea
                                rows="10"
                                placeholder="Paste your json here"
                                className="p-2 text-left"
                                value={jsonInput} // bind textarea value to state
                                onChange={(e) => setJsonInput(e.target.value)} // update state on change
                            ></textarea>
                            <Button
                                onClick={handleLoadJson}
                                className="flex items-center gap-2"
                            >
                                Load Data
                                <IconBookUpload size={20} />
                            </Button>
                        </div>
                    </AccordionContent>
                </AccordionItem>
            </Accordion>

            {/* Display generated JSON */}
            <Accordion
                type="single"
                className="mt-4 w-full"
                collapsible
                dir="ltr"
            >
                <AccordionItem value="json" className="flex-1">
                    <AccordionTrigger
                        className="flex items-center gap-2"
                        dir="ltr"
                    >
                        <div className="flex items-center gap-2 px-2 py-2 text-[16px] font-bold">
                            <IconJson size={20} />
                            Generated JSON
                        </div>
                    </AccordionTrigger>
                    <AccordionContent className="pt-2" dir="ltr">
                        <pre className="rounded bg-gray-100 p-4" dir="ltr">
                            {JSON.stringify(formConfig, null, 2)}
                        </pre>
                    </AccordionContent>
                </AccordionItem>
            </Accordion>
        </div>
    )
}

export default FormBuilder
