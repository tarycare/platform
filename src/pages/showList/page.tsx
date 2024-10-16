// @ts-nocheck
import { z } from 'zod'

// import { columns } from './components/columns'
import { DataTable } from './components/data-table'
import { UserNav } from './components/user-nav'
import { taskSchema } from './data/schema'
import { useEffect, useState } from 'react'
import { useLocation, useNavigate, useParams, usetypes } from 'react-router-dom'
import { Checkbox } from '@/components/ui/checkbox'
import { DataTableColumnHeader } from './components/data-table-column-header'
import { IconEye, IconPencil, IconTrash } from '@tabler/icons-react'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

export default function List({ type }: { type: string }) {
    console.log('Singular form of page:', type)
    const { id } = useParams()

    const all_url = `/wp-json/${type}/v1/all/${type === 'submission' && id ? id : ''}`
    const DELETE_API_URL = `/wp-json/${type}/v1/delete`

    const [dataRows, setDataRows] = useState([])
    const [refresh, setRefresh] = useState(false)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const navigate = useNavigate()

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch(all_url)
                if (!response.ok) {
                    throw new Error('Error fetching users')
                }
                const data = await response.json()

                setDataRows(data)
            } catch (error: any) {
                setError(error)
            } finally {
                setLoading(false)
            }
        }
        fetchData()
    }, [refresh, all_url])

    const fetchUrl =
        type === 'submission'
            ? `/wp-json/form/v1/get/${id}`
            : `/wp-json/form/v1/get?title=${type}`

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

                            // if the field contain image
                            if (field.name.includes('image')) {
                                return (
                                    <Avatar>
                                        <AvatarImage
                                            src={value}
                                            alt={field.label_en}
                                        />
                                        <AvatarFallback>
                                            {type === 'staff'
                                                ? row.original.first_name
                                                      ?.charAt(0)
                                                      .toUpperCase() +
                                                  ' ' +
                                                  row.original.last_name
                                                      ?.charAt(0)
                                                      .toUpperCase()
                                                : row.original.title
                                                      ?.charAt(0)
                                                      .toUpperCase()}
                                        </AvatarFallback>
                                    </Avatar>
                                )
                            }
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
                            {/* view button eye */}

                            <button
                                onClick={() => {
                                    if (type === 'form') {
                                        navigate(
                                            `/form-submissions/${row.original.id}`
                                        )
                                    } else if (type === 'submission') {
                                        navigate(
                                            `/${id}/view-submission/${row.original.id}`
                                        )
                                    } else {
                                        navigate(`/view/${row.original.id}`)
                                    }
                                }}
                            >
                                <IconEye className="size-4" />
                            </button>
                            <button
                                onClick={() => {
                                    if (type === 'form') {
                                        navigate(`/update/${row.original.id}`)
                                    } else if (type === 'submission') {
                                        navigate(
                                            `/${id}/update/${row.original.id}`
                                        )
                                    } else {
                                        navigate(`/update/${row.original.id}`)
                                    }
                                }}
                            >
                                <IconPencil className="size-4" />
                            </button>
                            <button
                                onClick={() => {
                                    if (
                                        !window.confirm(
                                            'Are you sure you want to delete this row?'
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
    }, [fetchUrl, type, id, refresh])

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
                    data={dataRows}
                    columns={columns}
                    formSections={formSections}
                    loading={loading}
                    type={type}
                />
            </div>
        </>
    )
}
