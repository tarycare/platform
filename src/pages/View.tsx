// @ts-nocheck
import React, { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { Label } from '@/components/ui/label'
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from '@/components/ui/accordion'
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover'
import { HelpCircleIcon, CheckIcon, Dot, Loader2, BookOpen } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import DocumnetManager from './DocumnetManager'
import DocumentList from './DocumentList'
import { IconUpload } from '@tabler/icons-react'
import { Button } from '@/components/ui/button'
import DocAiGen from '@/components/DocAiGen'
import TextOpenAi from '@/components/textOpenai'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

function DataView({ type }: { type: string }) {
    const { id, formId } = useParams() // Get user ID from the URL params
    const navigate = useNavigate() // Initialize useNavigate

    const [formSections, setFormSections] = useState([])
    const [submittedData, setSubmittedData] = useState({})
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState(null)
    const [showUpload, setShowUpload] = useState(false)
    const [refreshList, setRefreshList] = useState(false)
    const [postData, setPostData] = useState(null)

    const [htmlLang, setHtmlLang] = useState(
        window.document.documentElement.lang
    )

    const fetchUrl =
        type === 'submission'
            ? `/wp-json/form/v1/get/${formId}`
            : `/wp-json/form/v1/get?title=${type}`

    const WP_API_URL = `/wp-json/${type}/v1/get`

    useEffect(() => {
        async function fetchForm() {
            setIsLoading(true)
            try {
                const response = await fetch(fetchUrl, { method: 'GET' })
                const data = await response.json()

                // Fetch additional data for fields with apiData
                const sectionsWithItems = await Promise.all(
                    data.sections.map(async (section) => {
                        const fieldsWithItems = await Promise.all(
                            section.Fields.map(async (field) => {
                                if (field.apiData && field.apiData.url) {
                                    try {
                                        const apiResponse = await fetch(
                                            field.apiData.url
                                        )
                                        const apiData = await apiResponse.json()
                                        field.items = apiData.map((item) => ({
                                            id: item.id,
                                            value: item.value,
                                            label_en: item.label_en,
                                            label_ar: item.label_ar,
                                        }))
                                    } catch (apiError) {
                                        console.error(
                                            'Error fetching apiData:',
                                            apiError
                                        )
                                    }
                                }
                                return field
                            })
                        )
                        return { ...section, Fields: fieldsWithItems }
                    })
                )

                setFormSections(sectionsWithItems)
            } catch (error) {
                console.error('Error fetching form data:', error)
                setError(error)
            } finally {
                setIsLoading(false)
            }
        }

        fetchForm()
    }, [fetchUrl])

    useEffect(() => {
        async function fetchData() {
            setIsLoading(true)
            try {
                const response = await fetch(`${WP_API_URL}/${id}`)
                if (!response.ok) {
                    throw new Error('Error fetchin  data')
                }
                const data = await response.json()
                setPostData(data)
                console.log('postData:', data)
                setSubmittedData(data)
            } catch (error) {
                console.error('Error fetching data:', error)
                setError(error)
            } finally {
                setIsLoading(false)
            }
        }

        fetchData()
    }, [WP_API_URL, id])

    const renderSection = (section) => {
        return (
            <div key={section.id}>
                <h2>
                    {htmlLang === 'ar'
                        ? section.section_label_ar
                        : section.section_label_en}
                </h2>
                {section.Fields.map((field) => renderField(field))}
            </div>
        )
    }
    const handleCloseUpload = () => {
        setShowUpload(false)
    }
    const renderField = (field) => {
        const value = submittedData[field.name]
        let displayValue = value

        if (Array.isArray(value)) {
            displayValue = value
                .map((val) => {
                    const item = field.items.find(
                        (item) => item.id === val || item.value === val
                    )
                    return item
                        ? htmlLang === 'ar'
                            ? item.label_ar
                            : item.label_en
                        : val
                })
                .join(' - ')
        }
        // field.type === 'select'
        if (field.type === 'select' && field.items && field.items.length > 0) {
            const selectedItem = field.items.find(
                (item) => item.id === value || item.value === value
            )
            return (
                <div
                    key={field.id}
                    style={{ marginBottom: '10px' }}
                    className="flex flex-col"
                >
                    <strong className="font-bold">
                        {htmlLang === 'ar' ? field.label_ar : field.label_en}:
                    </strong>
                    <div>{selectedItem ? selectedItem.label_en : value}</div>
                </div>
            )
        }

        if (
            (field.type === 'checkbox' || field.type === 'radio') &&
            field.items &&
            field.items.length > 0
        ) {
            return (
                <div
                    key={field.id}
                    style={{ marginBottom: '10px' }}
                    className="flex flex-col gap-2"
                >
                    <strong className="font-bold">
                        {htmlLang === 'ar' ? field.label_ar : field.label_en}:
                    </strong>
                    <ul>
                        {field.items.map((item) => {
                            const isSelected = Array.isArray(value)
                                ? value.includes(item.id) ||
                                  value.includes(item.value)
                                : value === item.id || value === item.value
                            return (
                                <li
                                    key={item.value}
                                    className="flex items-center"
                                >
                                    {isSelected ? (
                                        <CheckIcon className="mr-2 text-green-500" />
                                    ) : (
                                        <Dot className="mr-2 text-black" />
                                    )}
                                    {htmlLang === 'ar'
                                        ? item.label_ar
                                        : item.label_en}
                                </li>
                            )
                        })}
                    </ul>
                </div>
            )
        }

        return (
            <div
                key={field.id}
                style={{ marginBottom: '10px' }}
                className="flex flex-col gap-2"
            >
                <strong>
                    {htmlLang === 'ar' ? field.label_ar : field.label_en}:
                </strong>
                {field.type.includes('image') ? (
                    <Avatar>
                        <AvatarImage src={value} alt={field.label_en} />
                        <AvatarFallback>
                            {field.label_en.slice(0, 2)}
                        </AvatarFallback>
                    </Avatar>
                ) : (
                    // if the field is a select field, display the label of the selected item

                    displayValue || '-'
                )}
            </div>
        )
    }

    // Menu items

    const [policies, setPolicies] = useState({
        label_ar: 'السياسات',
        label_en: 'Policies',
        descriptionـar: 'السياسات الخاصة بالموظفين',
        description_en: 'Policies related to staff',
        name: 'policies',
        published: true,
        items: [
            {
                label_ar: 'الخصوصية',
                label_en: 'Purpose',
                icon: BookOpen,
                name: 'doc-ai-policies-purpose',
                prompt: `Write cleaning and maintenance department be as details as you can do not hold back:
1.⁠Purpose and goals.
2.⁠ ⁠Definitions
3.⁠ ⁠applicable Scope.
4.⁠ ⁠Policy standard.
5.⁠ ⁠Procedures details.
6.⁠ ⁠Responsibility and staff roles.
7.⁠ ⁠References.
add points and title and group it together in headers and descriptions. at least 2000 words
    `,
            },
            {
                label_ar: 'المسؤولية',
                label_en: 'Responsibility',
                icon: BookOpen,
                name: 'doc-ai-policies-responsibility',
                prompt: 'Responsibility of the policy',
            },
            {
                label_ar: 'النطاق',
                label_en: 'Scope',
                icon: BookOpen,
                name: 'doc-ai-policies-scope',
                prompt: 'Scope of the policy',
            },
        ],
    })
    const [selectedPolicyItems, setSelectedPolicyItems] = useState(null)

    const [selectedPolicyIndex, setSelectedPolicyIndex] = useState(0)

    const documents = {
        label_ar: 'المستندات',
        label_en: 'Documents',
        name: 'documents',
        published: true,
        items: [
            {
                label_ar: 'المستند 1',
                label_en: 'Document 1',
                icon: BookOpen,
                document: {
                    name: 'doc-ai-documents-1',
                    description: 'Description of the document',
                },
            },
            {
                label_ar: 'المستند 2',
                label_en: 'Document 2',
                icon: BookOpen,
                document: {
                    name: 'doc-ai-documents-2',
                    description: 'Description of the document',
                },
            },
        ],
    }

    useEffect(() => {
        setSelectedPolicyItems(policies.items[selectedPolicyIndex])
    }, [policies, selectedPolicyIndex])

    console.log('selectedPolicyItems:', selectedPolicyItems)

    if (isLoading) {
        return (
            <div>
                <Loader2 className="h-5 w-5 animate-spin text-black" />
            </div>
        )
    }

    if (error) {
        return <div>Error: {error.message}</div>
    }

    return (
        <div className="w-full">
            <div className="my-2 flex items-center gap-2">
                <Button
                    variant="outline"
                    onClick={() => navigate(`/update/${id}`)}
                >
                    {htmlLang === 'ar' ? 'تعديل' : 'Edit'}
                </Button>
                <Button onClick={() => navigate('/')} variant="outline">
                    {htmlLang !== 'ar' ? 'All' : 'الكل'}
                </Button>
            </div>
            <Accordion
                type="multiple"
                className="mt-4 w-full"
                defaultValue={[
                    'item-0',
                    'item-1',
                    'item-2',
                    'item-3',
                    'item-4',
                    'item-5',
                ]}
            >
                {formSections.map((section, index) => (
                    <AccordionItem
                        key={index}
                        value={`item-${index}`}
                        className="mb-3"
                    >
                        <AccordionTrigger>
                            <div className="flex flex-col gap-1">
                                <div className="ms-[5px] flex items-center gap-x-2 px-3 py-[6px]">
                                    {section.section_icon && (
                                        <div className="size-5">
                                            {section.section_icon}
                                        </div>
                                    )}
                                    <div className="text-[16px] font-bold text-foreground">
                                        {htmlLang === 'ar'
                                            ? section.section_label_ar
                                            : section.section_label_en}
                                    </div>
                                </div>
                                {(section.section_description_ar ||
                                    section.section_description_en) && (
                                    <div className="mx-1 flex flex-col px-3 pt-[5px]">
                                        <Label className="mb-2 mt-[-12px] text-start text-sm font-normal text-slate-500">
                                            {htmlLang === 'ar'
                                                ? section.section_description_ar
                                                : section.section_description_en}
                                        </Label>
                                    </div>
                                )}
                            </div>
                        </AccordionTrigger>
                        <AccordionContent className="grid grid-cols-12">
                            {section.Fields.map((field) => (
                                <div
                                    key={field.name}
                                    className={`mx-1 mt-2 flex flex-col px-3 col-span-${
                                        field.colSpan || 6
                                    }`}
                                >
                                    {renderField(field)}
                                </div>
                            ))}
                        </AccordionContent>
                    </AccordionItem>
                ))}
            </Accordion>

            <Tabs
                defaultValue="doc"
                className=""
                dir={htmlLang === 'ar' ? 'rtl' : 'ltr'}
            >
                <TabsList>
                    <TabsTrigger value="doc">Documents</TabsTrigger>
                    <TabsTrigger value={policies.name}>
                        {htmlLang === 'ar'
                            ? policies.label_ar
                            : policies.label_en}
                    </TabsTrigger>
                </TabsList>
                <TabsContent value="doc" className="w-full">
                    <Button
                        className="my-5 flex items-center gap-2"
                        onClick={() => setShowUpload(!showUpload)}
                    >
                        <IconUpload /> Upload Document
                    </Button>
                    {showUpload && (
                        <DocumnetManager
                            appName="document"
                            itemId={id}
                            setRefreshList={setRefreshList}
                            refreshList={refreshList}
                            onClose={handleCloseUpload} // Pass the close handler
                        />
                    )}
                    <div className="mt-5">
                        <DocumentList
                            appName="document"
                            itemId={id} // Staff
                            refreshList={refreshList}
                        />
                    </div>
                </TabsContent>
                <TabsContent value={policies.name}>
                    <div className="relative mt-5 flex gap-5">
                        {/* sidebar */}
                        <div className="sticky start-0 top-[50px] flex h-fit w-[170px] flex-col gap-2 rounded-md bg-[#f1f1f1] px-3 py-2">
                            {policies.items.map((item, index) => (
                                <div
                                    onClick={() =>
                                        setSelectedPolicyIndex(index)
                                    }
                                    key={index}
                                    className={`flex w-full items-center gap-2 rounded-md px-2 py-2 hover:cursor-pointer ${
                                        selectedPolicyIndex === index
                                            ? 'bg-primary font-bold text-white hover:bg-primary hover:text-white'
                                            : 'text-black hover:bg-primary/10 hover:text-primary'
                                    }`}
                                >
                                    <item.icon size={14} />
                                    <span>
                                        {htmlLang === 'ar'
                                            ? item.label_ar
                                            : item.label_en}
                                    </span>
                                </div>
                            ))}
                        </div>
                        <div className="flex-1">
                            <DocAiGen
                                postData={postData}
                                type={type}
                                selectedDocAi={selectedPolicyItems}
                            />
                        </div>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    )
}

export default DataView
