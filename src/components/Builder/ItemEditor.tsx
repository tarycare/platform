// @ts-nocheck
import React, { useEffect, useState } from 'react'
import OptionEditor from './OptionEditor'
import { PolicyItem } from './types'
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
    Binary,
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
import { GrClone } from 'react-icons/gr'
import { Textarea } from '../ui/textarea'

interface ItemEditorProps {
    item: PolicyItem
    updateItem: (item: PolicyItem) => void
    removeItem: (itemId: string) => void
    moveItem: (direction: 'up' | 'down', itemId: string) => void
    duplicateItem: (item: PolicyItem) => void
    isFirst: boolean
    isLast: boolean
}

const ItemEditor: React.FC<ItemEditorProps> = ({
    item,
    updateItem,
    removeItem,
    moveItem,
    duplicateItem,
    isFirst,
    isLast,
}) => {
    const [showMoveDropdown, setShowMoveDropdown] = useState(false)

    const handleItemChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
    ) => {
        const { name, value, type, checked } = e.target
        updateItem({
            ...item,
            [name]: type === 'checkbox' ? checked : value,
        })
    }

    const [lang, setLang] = useState(document.documentElement.lang)
    useEffect(() => {
        setLang(document.documentElement.lang)
    }, [document.documentElement.lang])

    const moveOption = (direction: 'up' | 'down', optionId: string) => {
        const updatedOptions = [...(item.items || [])]
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

        updateItem({ ...item, items: updatedOptions })
    }

    const getIconByType = (type: string) => {
        switch (type) {
            case 'text':
                return <TypeIcon size={16} />
            case 'email':
                return <AtSign size={16} />
            case 'number':
                return <Binary size={16} />
            case 'textarea':
                return <Text size={16} />
            case 'checkbox':
                return <SquareCheck size={16} />
            case 'radio':
                return <CircleDot size={16} />
            case 'select':
                return <List size={16} />
            case 'multiselect':
                return <Logs size={16} />
            case 'date':
                return <CalendarClockIcon size={16} />
            case 'upload_image':
                return <Image size={16} />
            case 'file':
                return <FileDigit size={16} />
            default:
                return null
        }
    }

    return (
        <div className="flex items-center gap-2">
            <AccordionItem value={`item-${item.order}`} className="flex-1">
                <div className="rounded-md bg-white px-4 py-[6px]">
                    <div className="flex items-center gap-2">
                        <div className="flex items-center gap-x-2">
                            <Button
                                disabled={isFirst}
                                onClick={() => moveItem('up', item.id)}
                                className="p-1"
                            >
                                <ArrowUpCircleIcon className="size-4" />
                            </Button>
                            <p className="rounded-sm bg-[#f1f1f1] p-[2px] px-2 font-bold">
                                {Number(item.order) + 1}
                            </p>
                            <Button
                                disabled={isLast}
                                onClick={() => moveItem('down', item.id)}
                                className="p-1"
                            >
                                <ArrowDownCircle className="size-4" />
                            </Button>

                            <Button
                                className="p-1"
                                onClick={() => duplicateItem(item)}
                            >
                                <GrClone className="size-4" />
                            </Button>

                            <Button
                                variant={'destructive'}
                                className="p-1"
                                onClick={() => removeItem(item.id)}
                            >
                                <Trash2 className="size-4" />
                            </Button>
                        </div>
                        <div className="w-full">
                            <AccordionTrigger className="flex w-full flex-1 items-center">
                                <div className="flex items-center gap-2">
                                    <div className="text-[16px] font-semibold">
                                        {lang === 'ar'
                                            ? item.label_ar
                                            : item.label_en || 'New Item'}
                                    </div>
                                    {/* icon by type */}
                                    <div className="mx-5 text-[14px] text-gray-500">
                                        {getIconByType(item.type)}
                                    </div>
                                </div>
                            </AccordionTrigger>
                        </div>
                    </div>
                    <AccordionContent className="pt-2">
                        <div className="grid w-full grid-cols-12 gap-2 p-2">
                            {/* <label className="col-span-6 flex items-center">
                                <Input
                                    type="checkbox"
                                    name="showInList"
                                    checked={item.published}
                                    onChange={handleItemChange}
                                />
                                Published
                            </label> */}

                            <Input
                                type="hidden"
                                name="name"
                                value={item.name}
                                onChange={handleItemChange}
                                placeholder="Item Name (unique identifier)"
                                className="col-span-6"
                            />
                            <Input
                                type="text"
                                name="label_en"
                                value={item.label_en}
                                onChange={handleItemChange}
                                placeholder="Enter Policy name (EN)"
                                className="col-span-6"
                            />
                            <Input
                                type="text"
                                name="label_ar"
                                value={item.label_ar}
                                onChange={handleItemChange}
                                placeholder="Enter Policy name (AR)"
                                className="col-span-6"
                            />

                            <Textarea
                                name="prompt"
                                value={item.prompt}
                                onChange={handleItemChange}
                                placeholder="Enter prompt"
                                className="col-span-12"
                                rows={10}
                            />
                        </div>

                        {[
                            'select',
                            'radio',
                            'checkbox',
                            'multiselect',
                        ].includes(item.type) && (
                            <OptionEditor
                                item={item}
                                updateItem={updateItem}
                                moveOption={moveOption}
                            />
                        )}
                    </AccordionContent>
                </div>
            </AccordionItem>
        </div>
    )
}

export default ItemEditor
