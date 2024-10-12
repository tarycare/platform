// @ts-nocheck
import { z } from 'zod'

// import { columns } from './components/columns'
import { DataTable } from './components/data-table'
import { UserNav } from './components/user-nav'
import { taskSchema } from './data/schema'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Checkbox } from '@/components/ui/checkbox'
import { DataTableColumnHeader } from './components/data-table-column-header'
import { IconPencil, IconTrash } from '@tabler/icons-react'
import { Badge } from '@/components/ui/badge'

export default function TaskPage() {
    const isDev = process.env.NODE_ENV === 'development'

    const WP_API_URL = isDev
        ? `http://mytest.local/wp-json/department/v1/all`
        : `/wp-json/department/v1/all`
    const DELETE_API_URL = isDev
        ? `http://mytest.local/wp-json/department/v1/delete`
        : `/wp-json/department/v1/delete`

    const baseUrl = isDev ? 'http://mytest.local' : ''

    const [departments, setDepartments] = useState([])
    const [refresh, setRefresh] = useState(false)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const navigate = useNavigate()

    useEffect(() => {
        const fetchDepartments = async () => {
            try {
                const response = await fetch(WP_API_URL)
                if (!response.ok) {
                    throw new Error('Error fetching users')
                }
                const data = await response.json()

                setDepartments(data)
            } catch (error: any) {
                setError(error)
            } finally {
                setLoading(false)
            }
        }
        fetchDepartments()
    }, [refresh])

    const fetchUrl = `${baseUrl}/wp-json/form/v1/get?title=Department`

    const [formSections, setFormSections] = useState([])
    const [columns, setColumns] = useState([])

    useEffect(() => {
        async function fetchForm() {
            setLoading(true)
            try {
                const response = await fetch(fetchUrl, { method: 'GET' })
                const data = await response.json()

                // Fetch additional data for fields with apiData
                const sectionsWithItems = await Promise.all(
                    data.sections.map(async (section: any) => {
                        const fieldsWithItems = await Promise.all(
                            // filter fields with showInList
                            section.Fields.filter(
                                (field: any) => field.showInList
                            ).map(async (field: any) => {
                                if (field.apiData && field.apiData.url) {
                                    try {
                                        const apiResponse = await fetch(
                                            field.apiData.url
                                        )
                                        const apiData = await apiResponse.json()
                                        field.items = apiData.map(
                                            (item: any) => ({
                                                id: item.value,
                                                value: item.value,
                                                label_en: item.label_en,
                                                label_ar: item.label_ar,
                                                label: item.label_en,
                                            })
                                        )
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

                setFormSections(sectionsWithItems as any)
                // console.log(sectionsWithItems, 'sectionsWithItems')
                const columns = sectionsWithItems.flatMap((section: any) =>
                    section.Fields.map((field: any) => ({
                        accessorKey: field.name,
                        showInList: field.showInList,
                        header: ({ column }: any) => (
                            <DataTableColumnHeader
                                column={column}
                                title={field.label_en}
                            />
                        ),
                        cell: ({ row }: any) => {
                            const value = row.original[field.name]
                            if (field.type === 'checkbox') {
                                return <Checkbox checked={value} />
                            }
                            if (
                                (field.items &&
                                    (field.type === 'select' ||
                                        field.type === 'multiselect' ||
                                        field.type === 'radio')) ||
                                field.type === 'checkbox'
                            ) {
                                const selectedItems = Array.isArray(value)
                                    ? value
                                    : [value]
                                const labels = selectedItems.map((val: any) => {
                                    const item = field.items.find(
                                        (item: any) => item.value === val
                                    )
                                    return item ? item.label_en : val
                                })

                                return (
                                    <div>
                                        {labels
                                            .slice(0, 3)
                                            .map(
                                                (
                                                    label: string,
                                                    index: number
                                                ) =>
                                                    label ? (
                                                        <Badge
                                                            key={index}
                                                            variant={'outline'}
                                                        >
                                                            {label}
                                                        </Badge>
                                                    ) : (
                                                        <div>-</div>
                                                    )
                                            )}
                                        {labels.length > 3 && (
                                            <Badge variant={'outline'}>
                                                +{labels.length - 3}
                                            </Badge>
                                        )}
                                    </div>
                                )
                            }
                            return value ? <span>{value}</span> : '-'
                        },
                    }))
                )

                // append id column
                columns.unshift({
                    accessorKey: 'id',
                    showInList: true,
                    header: ({ column }: any) => (
                        <DataTableColumnHeader column={column} title="ID" />
                    ),
                    cell: ({ row }: any) => <span>{row.original.id}</span>,

                    enableHiding: false,
                })

                // append actions column with icons edit and delete
                columns.push({
                    accessorKey: 'actions',
                    id: 'actions',
                    showInList: true,
                    header: ({ column }: any) => (
                        <DataTableColumnHeader
                            column={column}
                            title="Actions"
                        />
                    ),
                    cell: ({ row }: any) => (
                        <div className="flex space-x-2">
                            <button
                                onClick={() =>
                                    navigate(`/update/${row.original.id}`)
                                }
                            >
                                <IconPencil className="size-4" />
                            </button>
                            <button
                                onClick={() => {
                                    if (
                                        !window.confirm(
                                            'Are you sure you want to delete this Department?'
                                        )
                                    ) {
                                        return
                                    }

                                    // igonre lint error

                                    const nonce =
                                        window?.appLocalizer?.nonce || ''

                                    fetch(
                                        `${DELETE_API_URL}/${row.original.id}`,
                                        {
                                            method: 'DELETE',
                                            headers: {
                                                'Content-Type':
                                                    'application/json',
                                                'X-WP-Nonce': nonce,
                                            },
                                            body: JSON.stringify({
                                                id: row.original.id,
                                            }),
                                        }
                                    )
                                        .then((response) => {
                                            if (!response.ok) {
                                                throw new Error(
                                                    'Failed to delete user'
                                                )
                                            }
                                            setRefresh(!refresh)
                                        })
                                        .catch((error) => {
                                            console.error(
                                                'Error deleting user:',
                                                error
                                            )
                                        })
                                }}
                            >
                                <IconTrash className="size-4" />
                            </button>
                        </div>
                    ),
                })

                setColumns(columns)
            } catch (error) {
                console.error('Error fetching form data:', error)
                setError(error as any)
            } finally {
                setLoading(false)
            }
        }

        fetchForm()
    }, [fetchUrl])

    return (
        <>
            <div className="h-full flex-1 flex-col space-y-8 p-8 md:flex">
                <div className="flex items-center justify-between space-y-2">
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight">
                            Welcome back!
                        </h2>
                        <p className="text-muted-foreground">
                            Here&apos;s a list of your tasks for this month!
                        </p>
                    </div>
                    <div className="flex items-center space-x-2">
                        <UserNav />
                    </div>
                </div>
                <DataTable
                    data={departments}
                    columns={columns}
                    formSections={formSections}
                />
            </div>
        </>
    )
}
