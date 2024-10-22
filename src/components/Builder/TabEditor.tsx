// TabEditor.tsx
import React, { useEffect, useState } from 'react'
import { PolisiesTab, PolicyItem } from './types'
import {
    Accordion,
    AccordionItem,
    AccordionTrigger,
    AccordionContent,
} from '../ui/accordion'
import { Input } from '../ui/input'
import { Textarea } from '../ui/textarea'
import { Button } from '../ui/button'
import {
    ArrowDownCircleIcon,
    ArrowUpCircleIcon,
    BookOpen,
    Trash2,
} from 'lucide-react'
import { IconPlus } from '@tabler/icons-react'

import { v4 as uuid } from 'uuid'
import { GrClone } from 'react-icons/gr'
import ItemEditor from './ItemEditor'
interface TabEditorProps {
    section: PolisiesTab
    updateTab: (section: PolisiesTab) => void

    moveSection: (direction: 'up' | 'down', sectionId: string) => void

    isFirst: boolean
    isLast: boolean
}

const TabEditor: React.FC<TabEditorProps> = ({ section, updateTab }) => {
    const updateItem = (updatedItem: PolicyItem) => {
        const updatedItems = section.items.map((item) =>
            item.id === updatedItem.id ? updatedItem : item
        )
        updateTab({ ...section, items: updatedItems })
    }

    const addItem = () => {
        const newItem: PolicyItem = {
            id: uuid(),
            name: `doc-ai-policies-${uuid().slice(0, 8)}`,
            label_en: '',
            label_ar: '',
            order: section.items.length,
            icon: BookOpen,
            prompt: '',
            published: true,
        }
        if (section.items.length > 0) {
            const lastItem = section.items[section.items.length - 1]
            if (!lastItem.name) {
                alert('Please fill the last item name')
                return
            }
        }
        const updateditems = [...section.items, newItem].map((item, index) => ({
            ...item,
            order: index,
        }))

        updateTab({
            ...section,
            items: updateditems as PolicyItem[],
        })
    }

    const removeItem = (itemId: string) => {
        if (window.confirm('Are you sure you want to delete this item?')) {
            const updateditems = section.items.filter(
                (item) => item.id !== itemId
            )
            updateTab({ ...section, items: updateditems })
        }
    }

    const handleSectionChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        const { name, value } = e.target
        console.log(`Changing ${name} to ${value}`) // Debugging log

        updateTab({ ...section, [name]: value })
    }

    const moveItem = (direction: 'up' | 'down', itemId: string) => {
        const updatedItems = [...section.items]
        const index = updatedItems.findIndex((item) => item.id === itemId)

        if (index < 0) return

        const targetIndex = direction === 'up' ? index - 1 : index + 1

        if (targetIndex < 0 || targetIndex >= updatedItems.length) return

        // Swap items
        const temp = updatedItems[index]
        updatedItems[index] = updatedItems[targetIndex]
        updatedItems[targetIndex] = temp

        // Update order values
        updatedItems.forEach((item, idx) => {
            item.order = idx
        })

        updateTab({ ...section, items: updatedItems })
    }

    const duplicateItem = (item: PolicyItem) => {
        const newItem = { ...item, id: uuid() }
        // item.name new uuid
        newItem.name = `item-name-${uuid().slice(0, 8)}`

        const updatedItems = [...section.items, newItem].map((f, index) => ({
            ...f,
            order: index,
        }))
        updateTab({ ...section, items: updatedItems })
    }

    const [lang, setLang] = useState(document.documentElement.lang)
    useEffect(() => {
        setLang(document.documentElement.lang)
    }, [document.documentElement.lang])

    return (
        <div className="flex items-center gap-2">
            <AccordionItem
                value={`section-${section.name}`}
                className="flex-1 bg-blue-50"
            >
                <div className="py-[6px] ps-4">
                    <div className="section-editor">
                        <div className="flex items-center gap-2">
                            <div className="w-full">
                                <AccordionTrigger className="flex items-center gap-2">
                                    <div className="text-[16px] font-semibold">
                                        {lang === 'ar'
                                            ? section.label_ar
                                            : section.label_en}
                                    </div>
                                </AccordionTrigger>
                            </div>
                        </div>
                        <AccordionContent className="pe-4 pt-2">
                            <div className="grid grid-cols-2 gap-2 p-2">
                                <Input
                                    type="text"
                                    name="label_en"
                                    value={section.label_en}
                                    onChange={handleSectionChange}
                                    placeholder="Section Label (EN)"
                                />
                                <Input
                                    type="text"
                                    name="label_ar"
                                    value={section.label_ar}
                                    onChange={handleSectionChange}
                                    placeholder="Section Label (AR)"
                                />
                                <Textarea
                                    name="description_en"
                                    value={section.description_en}
                                    onChange={handleSectionChange}
                                    placeholder="Section Description (EN)"
                                />
                                <Textarea
                                    name="description_ar"
                                    value={section.description_ar}
                                    onChange={handleSectionChange}
                                    placeholder="Section Description (AR)"
                                />
                            </div>
                            <div className="my-3 flex gap-2">
                                <Button
                                    onClick={addItem}
                                    variant={'outline'}
                                    className="flex items-center gap-2"
                                >
                                    Add Policy <IconPlus size={14} />
                                </Button>
                            </div>
                            <div>
                                <Accordion
                                    type="single"
                                    collapsible
                                    className="mt-2 flex flex-col gap-3"
                                >
                                    {section.items.map((item, index) => (
                                        <ItemEditor
                                            key={`item--${item.id}`} // Ensure ItemEditor also has a unique key
                                            item={item}
                                            updateItem={updateItem}
                                            removeItem={removeItem}
                                            moveItem={moveItem}
                                            duplicateItem={duplicateItem}
                                            isFirst={index === 0}
                                            isLast={
                                                index ===
                                                section.items.length - 1
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

export default TabEditor
