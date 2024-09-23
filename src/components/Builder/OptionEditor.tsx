// @ts-nocheck
import React from 'react'
import { Field, FieldOption } from './types'
import { Button } from '../ui/button'
import {
    ArrowDownCircle,
    ArrowUpCircleIcon,
    PlusCircle,
    Trash2,
} from 'lucide-react'

interface OptionEditorProps {
    field: Field
    updateField: (field: Field) => void
}

const OptionEditor: React.FC<OptionEditorProps> = ({ field, updateField }) => {
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

    const updateItem = (updatedItem: FieldOption) => {
        const updatedItems = field.items?.map((item) =>
            item.id === updatedItem.id ? updatedItem : item
        )
        updateField({ ...field, items: updatedItems })
    }

    const removeItem = (itemId: string) => {
        if (window.confirm('Are you sure you want to delete this item?')) {
            const updatedItems = field.items?.filter(
                (item) => item.id !== itemId
            )
            updateField({ ...field, items: updatedItems })
        }
    }

    return (
        <div className="option-editor mt-4">
            <Button onClick={addItem} className="mb-4 flex items-center gap-2">
                Add Options <PlusCircle className="size-4" />
            </Button>
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
                                {/* <Button className="p-1">
                                    <ArrowUpCircleIcon className="size-4" />
                                </Button>
                                <Button className="p-1">
                                    <ArrowDownCircle className="size-4" />
                                </Button> */}
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
