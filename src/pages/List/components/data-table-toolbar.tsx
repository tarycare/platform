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
    type: string
}

export function DataTableToolbar<TData>({
    table,
    formSections,
    type,
}: DataTableToolbarProps<TData>) {
    console.log('formSections', formSections)

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
                    placeholder="search ..."
                    // value={
                    //     (table
                    //         .getColumn(type === 'staff' ? 'email' : 'title')
                    //         ?.getFilterValue() as string) ?? ''
                    // }
                    onChange={(e) =>
                        table.setGlobalFilter(String(e.target.value))
                    }
                    className="h-8 w-[150px] lg:w-[250px]"
                />
                {fieldWithItems.map((field: any) => {
                    console.log(field, 'table.getColumn(field.name)')
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
