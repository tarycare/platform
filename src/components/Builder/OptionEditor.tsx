// @ts-nocheck
import React, { useState, useEffect } from 'react'
import { Field, FieldOption } from './types'
import {
    ArrowDownCircle,
    ArrowUpCircleIcon,
    PlusCircle,
    Trash2,
} from 'lucide-react'
import { Button } from '../ui/button'
import { Input } from '../ui/input'

interface OptionEditorProps {
    field: Field
    updateField: (field: Field) => void
    moveOption: (direction: 'up' | 'down', itemId: string) => void
}

const OptionEditor: React.FC<OptionEditorProps> = ({
    field,
    updateField,
    moveOption,
}) => {
    const [apiUrl, setApiUrl] = useState(field.apiData?.url || '')
    const [authorization, setAuthorization] = useState(
        field.apiData?.header || ''
    )
    const [mapping, setMapping] = useState({
        value: field.apiData?.mapping?.value || '',
        label_en: field.apiData?.mapping?.label_en || '',
        label_ar: field.apiData?.mapping?.label_ar || '',
    })

    // Function to add new item manually
    const addItem = () => {
        const newItem: FieldOption = {
            id: Date.now().toString(),
            value: '',
            label_en: '',
            label_ar: '',
            order: field.items ? field.items.length : 0,
        }
        // Logic to validate last option, then add the new one
        updateField({
            ...field,
            items: [...(field.items || []), newItem],
        })
    }

    // Fetch items from API when URL is provided
    const fetchApiOptions = async () => {
        if (!apiUrl) {
            alert('Please provide a valid API URL.')
            return
        }

        try {
            const headers: HeadersInit = {}
            if (authorization) {
                headers['Authorization'] = authorization
            }

            const response = await fetch(apiUrl, { headers })
            const data = await response.json()
            mapApiToFields(data)
        } catch (error) {
            alert('Failed to fetch API data. Please check the API URL.')
        }
    }

    // Map API data to field options
    const mapApiToFields = (data: any) => {
        if (!data || !Array.isArray(data)) {
            alert('API did not return a valid array.')
            return
        }

        const mappedItems = data.map((item) => ({
            id: Date.now().toString() + Math.random(),
            value: item[mapping.value] || item.value,
            label_en: item[mapping.label_en] || item.label_en,
            label_ar: item[mapping.label_ar] || item.label_ar,
            order: field.items ? field.items.length : 0,
        }))

        updateField({
            ...field,
            items: mappedItems, // Store the items fetched from API
        })
    }

    // Save the `apiData` when changed
    useEffect(() => {
        updateField({
            ...field,
            apiData: { url: apiUrl, header: authorization, mapping },
        })
    }, [apiUrl, authorization, mapping])

    return (
        <div className="option-editor mt-4">
            <div className="flex items-center gap-4">
                <Button
                    onClick={addItem}
                    className="mb-4 flex items-center gap-2"
                >
                    Add Options <PlusCircle className="size-4" />
                </Button>
                <Button
                    onClick={fetchApiOptions}
                    className="mb-4 flex items-center gap-2"
                >
                    Fetch from API <PlusCircle className="size-4" />
                </Button>
            </div>

            <Input
                type="text"
                value={apiUrl}
                onChange={(e) => setApiUrl(e.target.value)}
                placeholder="API URL"
                className="mb-2"
            />
            <Input
                type="text"
                value={authorization}
                onChange={(e) => setAuthorization(e.target.value)}
                placeholder="Authorization (optional)"
                className="mb-2"
            />
            <div className="grid grid-cols-3 gap-4">
                <Input
                    type="text"
                    value={mapping.value}
                    onChange={(e) =>
                        setMapping({ ...mapping, value: e.target.value })
                    }
                    placeholder="Map Value"
                    className="mb-2"
                />
                <Input
                    type="text"
                    value={mapping.label_en}
                    onChange={(e) =>
                        setMapping({ ...mapping, label_en: e.target.value })
                    }
                    placeholder="Map Label (EN)"
                    className="mb-2"
                />
                <Input
                    type="text"
                    value={mapping.label_ar}
                    onChange={(e) =>
                        setMapping({ ...mapping, label_ar: e.target.value })
                    }
                    placeholder="Map Label (AR)"
                    className="mb-2"
                />
            </div>

            {/* Display the fetched or manually added options */}
            {field.items?.map((item, idx) => (
                <div key={item.id} className="flex items-center gap-2">
                    <div className="option-item mb-4 rounded border p-2">
                        <div className="grid w-full grid-cols-4 gap-4">
                            <input
                                type="text"
                                name="value"
                                value={item.value}
                                onChange={(e) =>
                                    updateField({
                                        ...field,
                                        items: field.items?.map((itm) =>
                                            itm.id === item.id
                                                ? {
                                                      ...itm,
                                                      value: e.target.value,
                                                  }
                                                : itm
                                        ),
                                    })
                                }
                                placeholder="Value"
                                className="rounded border p-2"
                            />
                            <input
                                type="text"
                                name="label_en"
                                value={item.label_en}
                                onChange={(e) =>
                                    updateField({
                                        ...field,
                                        items: field.items?.map((itm) =>
                                            itm.id === item.id
                                                ? {
                                                      ...itm,
                                                      label_en: e.target.value,
                                                  }
                                                : itm
                                        ),
                                    })
                                }
                                placeholder="Label (EN)"
                                className="rounded border p-2"
                            />
                            <input
                                type="text"
                                name="label_ar"
                                value={item.label_ar}
                                onChange={(e) =>
                                    updateField({
                                        ...field,
                                        items: field.items?.map((itm) =>
                                            itm.id === item.id
                                                ? {
                                                      ...itm,
                                                      label_ar: e.target.value,
                                                  }
                                                : itm
                                        ),
                                    })
                                }
                                placeholder="Label (AR)"
                                className="rounded border p-2"
                            />
                            <div className="flex items-center justify-end gap-x-2">
                                <Button
                                    onClick={() => moveOption('up', item.id)}
                                    disabled={idx === 0}
                                    className="p-1"
                                >
                                    <ArrowUpCircleIcon className="size-4" />
                                </Button>
                                <Button
                                    onClick={() => moveOption('down', item.id)}
                                    disabled={idx === field?.items.length - 1}
                                    className="p-1"
                                >
                                    <ArrowDownCircle className="size-4" />
                                </Button>
                                <Button
                                    variant={'destructive'}
                                    className="p-1"
                                    onClick={() =>
                                        updateField({
                                            ...field,
                                            items: field.items?.filter(
                                                (itm) => itm.id !== item.id
                                            ),
                                        })
                                    }
                                >
                                    <Trash2 className="size-4" />
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    )
}

export default OptionEditor
