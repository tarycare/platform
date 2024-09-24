import React, { useState } from 'react'
import { Field, FieldOption } from './types'
import { PlusCircle, Trash2 } from 'lucide-react'
import { Button } from '../ui/button'
import { Input } from '../ui/input'

interface OptionEditorProps {
    field: Field
    updateField: (field: Field) => void
}

const OptionEditor: React.FC<OptionEditorProps> = ({ field, updateField }) => {
    const [apiUrl, setApiUrl] = useState('') // State for storing API URL
    const [authorization, setAuthorization] = useState('') // State for storing optional Authorization header
    const [mapping, setMapping] = useState({
        value: '',
        label_ar: '',
        label_en: '',
    }) // State for mapping API fields

    // Function to add new item manually
    const addItem = () => {
        const newItem: FieldOption = {
            id: Date.now().toString(),
            value: '',
            label_en: '',
            label_ar: '',
        }
        // check if last option name is empty
        if (field.items && field.items.length > 0) {
            const lastItem = field.items[field.items.length - 1]
            if (!lastItem.value || !lastItem.label_en || !lastItem.label_ar) {
                alert('Please fill the last option value')
                return
            }
        }
        updateField({
            ...field,
            items: [...(field.items || []), newItem],
        })
    }

    // Function to fetch data from the API and map it to options
    const fetchApiOptions = async () => {
        if (!apiUrl) {
            alert('Please provide a valid API URL.')
            return
        }

        try {
            // Set up headers, including Authorization if provided
            const headers: HeadersInit = {}
            if (authorization) {
                headers['Authorization'] = authorization
            }

            const response = await fetch(apiUrl, { headers }) // Add headers to the API request
            const data = await response.json()
            mapApiToFields(data)
        } catch (error) {
            alert('Failed to fetch API data. Please check the API URL.')
        }
    }

    // Function to map API data to field options (replacing the existing options)
    const mapApiToFields = (data: any) => {
        if (!data || !Array.isArray(data)) {
            alert('API did not return a valid array.')
            return
        }

        // Map the API data to the field options
        const mappedItems = data.map((item) => ({
            id: Date.now().toString() + Math.random(), // Ensure unique ID
            value: item[mapping.value] || item.value, // Fallback to API's `value` if mapping is empty
            label_en: item[mapping.label_en] || item.label_en, // Fallback to API's `label_en`
            label_ar: item[mapping.label_ar] || item.label_ar, // Fallback to API's `label_ar`
        }))

        // Ensure the fetched options are valid
        const invalidItems = mappedItems.some(
            (item) => !item.value || !item.label_en || !item.label_ar
        )

        if (invalidItems) {
            alert('One or more items are missing value or labels.')
            return
        }

        // Replace existing options with the new fetched items (renew data)
        updateField({
            ...field,
            items: mappedItems,
        })
    }

    // Function to update a single item manually
    const updateItem = (updatedItem: FieldOption) => {
        const updatedItems = field.items?.map((item) =>
            item.id === updatedItem.id ? updatedItem : item
        )
        updateField({ ...field, items: updatedItems })
    }

    // Function to remove an item
    const removeItem = (itemId: string) => {
        if (window.confirm('Are you sure you want to delete this item?')) {
            const updatedItems = field.items?.filter(
                (item) => item.id !== itemId
            )
            updateField({ ...field, items: updatedItems })
        }
    }

    // Dynamically change the "Add API" button to "Update API" if there are options
    const getApiButtonLabel = () =>
        (field.items || []).length > 0 ? 'Update API' : 'Add API'

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
                    {getApiButtonLabel()} <PlusCircle className="size-4" />
                </Button>
            </div>

            {/* Input field for the API URL */}
            <Input
                type="text"
                value={apiUrl}
                onChange={(e) => setApiUrl(e.target.value)}
                placeholder="API URL"
                className="mb-2"
                onBlur={fetchApiOptions} // Trigger fetch when leaving input
            />

            {/* Input field for the optional Authorization header */}
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
            {field.items?.map((item) => (
                <div key={item.id} className="flex items-center gap-2">
                    <div className="option-item mb-4 rounded border p-2">
                        <div className="grid w-full grid-cols-4 gap-4">
                            <input
                                type="text"
                                name="value"
                                value={item.value}
                                onChange={(e) =>
                                    updateItem({
                                        ...item,
                                        value: e.target.value,
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
                                    updateItem({
                                        ...item,
                                        label_en: e.target.value,
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
                                    updateItem({
                                        ...item,
                                        label_ar: e.target.value,
                                    })
                                }
                                placeholder="Label (AR)"
                                className="rounded border p-2"
                            />
                            <div className="flex items-center justify-end gap-x-2">
                                <Button
                                    variant={'destructive'}
                                    className="p-1"
                                    onClick={() => removeItem(item.id)}
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
