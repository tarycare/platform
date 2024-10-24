// @ts-nocheck
import React, { useEffect, useState } from 'react'
import SectionEditor from './SectionEditor'
import TabEditor from './TabEditor'
import PreviewForm from './PreviewForm'
import { FormConfig, PolisiesTab, Section } from './types'
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
import { BookOpen, CopyIcon } from 'lucide-react'
import { Switch } from '../ui/switch'

const FormBuilder: React.FC = () => {
    const navigate = useNavigate() // Initialize useNavigate

    const [formConfig, setFormConfig] = useState<FormConfig>({
        title: '',
        sections: [],
        policies: {},
        documents: {},
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
                    policies: data.policies || {},
                    documents: data.documents || {},
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

    const togglePolicies = (checked: boolean) => {
        console.log('Policies:', checked)
        if (checked) {
            setFormConfig((prev) => ({
                ...prev,
                policies: {
                    id: uuidv4(),
                    label_ar: 'السياسات',
                    label_en: 'Policies',
                    descriptionـar: 'السياسات الخاصة ',
                    description_en: 'Policies related to ...',
                    name: 'policies',
                    published: checked,
                    items: [
                        {
                            id: uuidv4(),
                            label_ar: 'السياسة العامة',
                            label_en: 'General Policy',
                            icon: BookOpen,
                            name: 'doc-ai-policies-general',
                            prompt: `generate policy`,
                            order: 0,
                        },
                    ],
                },
            }))
        } else {
            // hide the policies
            setFormConfig((prev) => ({
                ...prev,
                policies: {
                    ...prev.policies,
                    published: checked,
                },
            }))
        }
    }

    const updateTab = (updatedTab: PolisiesTab) => {
        setFormConfig((prev) => ({
            ...prev,
            policies: prev.policies?.map((tab) =>
                tab.id === updatedTab.id ? updatedTab : tab
            ),
        }))
    }

    const toggleDocuments = (checked: boolean) => {
        console.log('Documents:', checked)
        if (checked) {
            setFormConfig((prev) => ({
                ...prev,
                documents: {
                    ...prev.documents,
                    published: checked,
                },
            }))
        } else {
            setFormConfig((prev) => ({
                ...prev,
                documents: {
                    ...prev.documents,
                    published: checked,
                },
            }))
        }
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
                policies: formConfig.policies,
                documents: formConfig.documents,
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

    const handleCopyJson = () => {
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard
                .writeText(JSON.stringify(formConfig, null, 2))
                .then(() => toast.success('JSON copied to clipboard'))
                .catch((err) => toast.error('Failed to copy JSON'))
        } else {
            // Fallback for unsupported browsers
            const textArea = document.createElement('textarea')
            textArea.value = JSON.stringify(formConfig, null, 2)
            document.body.appendChild(textArea)
            textArea.select()
            try {
                document.execCommand('copy')
                toast.success('JSON copied to clipboard')
            } catch (err) {
                toast.error('Failed to copy JSON')
            }
            document.body.removeChild(textArea)
        }
    }

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

            <div className="flex w-full items-center justify-between">
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
                <div className="flex justify-center">
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
            </div>

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
            <div className="flex flex-col gap-3">
                {/* Buttons */}
                <div className="flex items-center justify-start gap-5">
                    <Button
                        onClick={addSection}
                        className="flex items-center gap-2"
                        variant={'outline'}
                        size={'sm'}
                    >
                        Add Section
                        <IconNewSection size={20} />
                    </Button>

                    {
                        //   at least one section is required to show the policies and documents
                        formConfig.sections.length > 0 && (
                            <>
                                <div className="flex items-center space-x-2">
                                    <Switch
                                        id="Policies"
                                        onCheckedChange={togglePolicies}
                                        checked={formConfig.policies.published}
                                    />
                                    <Label htmlFor="Policies">Policies</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Switch
                                        id="Documents"
                                        onCheckedChange={toggleDocuments}
                                        checked={formConfig.documents.published}
                                    />
                                    <Label htmlFor="Documents">Documents</Label>
                                </div>
                            </>
                        )
                    }
                </div>
                <div className="flex w-full gap-2">
                    <div className="w-full">
                        <Accordion
                            type="single"
                            className="flex w-full flex-1 flex-col gap-2 rounded p-2"
                            collapsible
                        >
                            {formConfig.sections?.map((section, index) => (
                                <SectionEditor
                                    key={`section-build-${section.id}`}
                                    section={section}
                                    updateSection={updateSection}
                                    removeSection={removeSection}
                                    moveSection={moveSection}
                                    duplicateSection={() =>
                                        duplicateSection(section.id)
                                    }
                                    isFirst={index === 0}
                                    isLast={
                                        index === formConfig.sections.length - 1
                                    }
                                />
                            ))}
                        </Accordion>
                        {/* Accordion for Polcies */}
                        {formConfig.policies.published && (
                            <Accordion
                                type="single"
                                className="flex w-full flex-1 flex-col gap-2 rounded p-2"
                                collapsible
                            >
                                <TabEditor
                                    section={formConfig.policies}
                                    updateTab={(updatedTab) =>
                                        setFormConfig((prev) => ({
                                            ...prev,
                                            policies: updatedTab,
                                        }))
                                    }
                                    moveSection={() => {}}
                                    isFirst={true}
                                    isLast={true}
                                />
                            </Accordion>
                        )}
                    </div>
                    {/* Preview the form */}
                    {formConfig.sections.length > 0 && (
                        <div className="w-[800px] shrink-0 p-2">
                            <PreviewForm data={formConfig.sections} />
                        </div>
                    )}
                </div>
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
                            <div className="flex items-center gap-2 px-2 py-2 text-[16px] font-bold">
                                <IconJson size={20} />
                                Generated JSON
                            </div>
                            <Button
                                onClick={handleCopyJson}
                                className="flex items-center gap-2"
                                variant={'outline'}
                                size={'sm'}
                            >
                                <CopyIcon size={14} />
                            </Button>
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
