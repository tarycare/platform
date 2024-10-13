'use client'

import { Cross2Icon } from '@radix-ui/react-icons'
import { Table } from '@tanstack/react-table'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { DataTableViewOptions } from './data-table-view-options'

import { DataTableFacetedFilter } from './data-table-faceted-filter'

interface DataTableToolbarProps<TData> {
    table: Table<TData>
    formSections: any
}

export function DataTableToolbar<TData>({
    table,
    formSections,
}: DataTableToolbarProps<TData>) {
    console.log('formSections', formSections)
    // [
    //     {
    //         "id": "6",
    //         "order": "1",
    //         "section_description_en": "Department details information",
    //         "section_description_ar": "معلومات القسم الشاملة",
    //         "section_label_en": "Department Information",
    //         "section_label_ar": "بيانات القسم",
    //         "section_icon": "💼",
    //         "Fields": [
    //             {
    //                 "name": "title",
    //                 "id": "44",
    //                 "label_en": "Department Name",
    //                 "label_ar": "اسم القسم",
    //                 "type": "text",
    //                 "order": 1,
    //                 "placeholder_en": "Enter department name",
    //                 "placeholder_ar": "أدخل اسم القسم",
    //                 "showInList": true,
    //                 "colSpan": "6"
    //             },
    //             {
    //                 "name": "code",
    //                 "id": "45",
    //                 "label_en": "Department Code",
    //                 "label_ar": "رمز القسم",
    //                 "type": "text",
    //                 "order": 2,
    //                 "placeholder_en": "Enter department code",
    //                 "placeholder_ar": "أدخل رمز القسم",
    //                 "showInList": true,
    //                 "colSpan": "6"
    //             },
    //             {
    //                 "name": "facilities",
    //                 "id": "49",
    //                 "label_en": "Associated Facilities",
    //                 "label_ar": "المرافق المرتبطة بالقسم",
    //                 "type": "multiselect",
    //                 "order": 3,
    //                 "placeholder_en": "Select associated facilities",
    //                 "placeholder_ar": "حدد المرافق المرتبطة",
    //                 "showInList": true,
    //                 "colSpan": "12",
    //                 "apiData": {
    //                     "url": "http://mytest.local/wp-json/Facility/v1/select",
    //                     "header": "",
    //                     "mapping": {
    //                         "value": "",
    //                         "label_en": "",
    //                         "label_ar": ""
    //                     }
    //                 },
    //                 "items": [
    //                     {
    //                         "id": "167",
    //                         "value": "167",
    //                         "label_en": "Room 7",
    //                         "label_ar": "Room 7",
    //                         "label": "Room 7"
    //                     },
    //                     {
    //                         "id": "166",
    //                         "value": "166",
    //                         "label_en": "Room 6",
    //                         "label_ar": "Room 6",
    //                         "label": "Room 6"
    //                     },
    //                     {
    //                         "id": "165",
    //                         "value": "165",
    //                         "label_en": "Room 5",
    //                         "label_ar": "Room 5",
    //                         "label": "Room 5"
    //                     },
    //                     {
    //                         "id": "164",
    //                         "value": "164",
    //                         "label_en": "Room 4",
    //                         "label_ar": "Room 4",
    //                         "label": "Room 4"
    //                     },
    //                     {
    //                         "id": "73",
    //                         "value": "73",
    //                         "label_en": "Room 03",
    //                         "label_ar": "Room 03",
    //                         "label": "Room 03"
    //                     }
    //                 ]
    //             },
    //             {
    //                 "id": "2c12db77-10f6-417c-87ff-81b5c123b2e1",
    //                 "name": "field-name-249196dd",
    //                 "label_en": "Dep Type",
    //                 "label_ar": "نوع القسم",
    //                 "type": "radio",
    //                 "placeholder_en": "",
    //                 "placeholder_ar": "",
    //                 "required": false,
    //                 "order": 4,
    //                 "colSpan": "6",
    //                 "items": [
    //                     {
    //                         "id": "1728728199269",
    //                         "value": "1",
    //                         "label_en": "Fire",
    //                         "label_ar": "",
    //                         "order": 0
    //                     },
    //                     {
    //                         "id": "1728728213271",
    //                         "value": "2",
    //                         "label_en": "Ice",
    //                         "label_ar": "",
    //                         "order": 1
    //                     }
    //                 ],
    //                 "apiData": {
    //                     "url": "",
    //                     "header": "",
    //                     "mapping": {
    //                         "value": "",
    //                         "label_en": "",
    //                         "label_ar": ""
    //                     }
    //                 },
    //                 "showInList": true
    //             }
    //         ]
    //     },
    //     {
    //         "id": "8bea4b5d-b29c-4268-bf78-8a538d3fad65",
    //         "section_label_en": "Department Check List",
    //         "section_label_ar": "قائمة التحقق للقسم",
    //         "section_description_en": "Select all the items that apply on this department",
    //         "section_description_ar": "اختر جميع العناصر التي تنطبق على هذا القسم",
    //         "section_icon": "",
    //         "Fields": [],
    //         "order": 1,
    //         "sectionName": "section"
    //     },
    //     {
    //         "id": "edaf5a4b-fc63-47a9-a0e2-a2e58493458e",
    //         "section_label_en": "New Section",
    //         "section_label_ar": "قسم جديد",
    //         "section_description_en": "",
    //         "section_description_ar": "",
    //         "section_icon": "",
    //         "Fields": [],
    //         "order": 2,
    //         "sectionName": "section"
    //     }
    // ]
    const fieldWithItems = formSections.flatMap((section: any) =>
        section.Fields.filter(
            (field: any) => field.type === 'select' || field.type === 'radio'
        )
    )

    console.log('fieldWithItems', fieldWithItems)
    const isFiltered = table.getState().columnFilters.length > 0

    return (
        <div className="flex items-center justify-between">
            <div className="flex flex-1 items-center space-x-2">
                <Input
                    placeholder="Filter tasks..."
                    value={
                        (table
                            .getColumn('title')
                            ?.getFilterValue() as string) ?? ''
                    }
                    onChange={(event) =>
                        table
                            .getColumn('title')
                            ?.setFilterValue(event.target.value)
                    }
                    className="h-8 w-[150px] lg:w-[250px]"
                />
                {fieldWithItems.map((field: any) => {
                    return (
                        <DataTableFacetedFilter
                            column={table.getColumn(field.name)}
                            title={field.label_en}
                            options={field.items.map((item: any) => ({
                                label: item.label_en,
                                value: item.value,
                            }))}
                        />
                    )
                })}

                {isFiltered && (
                    <Button
                        variant="ghost"
                        onClick={() => table.resetColumnFilters()}
                        className="h-8 px-2 lg:px-3"
                    >
                        Reset
                        <Cross2Icon className="ml-2 h-4 w-4" />
                    </Button>
                )}
            </div>
            <DataTableViewOptions table={table} />
        </div>
    )
}
