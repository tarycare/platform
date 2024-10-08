//@ts-nocheck
import { Button } from '@/components/ui/button'

import { Routes, Route, Link, useNavigate } from 'react-router-dom'

import {
    File,
    Home,
    LineChart,
    ListFilter,
    MoreHorizontal,
    Package,
    Package2,
    PanelLeft,
    PlusCircle,
    Search,
    Settings,
    ShoppingCart,
    Users2,
} from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/card'
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip'
import { useEffect, useState } from 'react'

export const description =
    'An Facility dashboard with a sidebar navigation. The sidebar has icon navigation. The content area has a breadcrumb and search in the header. It displays a list of Facility in a table with actions.'

export default function Dashboard() {
    const isDev = process.env.NODE_ENV === 'development'

    const WP_API_URL = isDev
        ? `http://mytest.local/wp-json/facility/v1/all`
        : `/wp-json/facility/v1/all`
    const DELETE_API_URL = isDev
        ? `http://mytest.local/wp-json/facility/v1/delete`
        : `/wp-json/facility/v1/delete`

    const [facilitys, setFacilitys] = useState([])
    const [refresh, setRefresh] = useState(false)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const navigate = useNavigate()

    useEffect(() => {
        const fetchFacilitys = async () => {
            try {
                const response = await fetch(WP_API_URL)
                if (!response.ok) {
                    throw new Error('Error fetching users')
                }
                const data = await response.json()
                setFacilitys(data)
            } catch (error: any) {
                setError(error)
            } finally {
                setLoading(false)
            }
        }
        fetchFacilitys()
    }, [refresh])

    return (
        <TooltipProvider>
            <div className="mt-5 flex min-h-screen w-full flex-col bg-muted/40">
                <div className="flex flex-col sm:gap-4">
                    <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
                        <Sheet>
                            <SheetTrigger asChild>
                                <Button
                                    size="icon"
                                    variant="outline"
                                    className="sm:hidden"
                                >
                                    <PanelLeft className="h-5 w-5" />
                                    <span className="sr-only">Toggle Menu</span>
                                </Button>
                            </SheetTrigger>
                            <SheetContent side="left" className="sm:max-w-xs">
                                <nav className="grid gap-6 text-lg font-medium">
                                    <Link
                                        to="#"
                                        className="group flex h-10 w-10 shrink-0 items-center justify-center gap-2 rounded-full bg-primary text-lg font-semibold text-primary-foreground md:text-base"
                                    >
                                        <Package2 className="h-5 w-5 transition-all group-hover:scale-110" />
                                        <span className="sr-only">
                                            Acme Inc
                                        </span>
                                    </Link>
                                    <Link
                                        to="#"
                                        className="flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground"
                                    >
                                        <Home className="h-5 w-5" />
                                        Dashboard
                                    </Link>
                                    <Link
                                        to="#"
                                        className="flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground"
                                    >
                                        <ShoppingCart className="h-5 w-5" />
                                        Orders
                                    </Link>
                                    <Link
                                        to="#"
                                        className="flex items-center gap-4 px-2.5 text-foreground"
                                    >
                                        <Package className="h-5 w-5" />
                                        Facility
                                    </Link>
                                    <Link
                                        to="#"
                                        className="flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground"
                                    >
                                        <Users2 className="h-5 w-5" />
                                        Customers
                                    </Link>
                                    <Link
                                        to="#"
                                        className="flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground"
                                    >
                                        <LineChart className="h-5 w-5" />
                                        Settings
                                    </Link>
                                </nav>
                            </SheetContent>
                        </Sheet>

                        <div className="relative ms-auto flex-1 md:grow-0">
                            <Search className="absolute end-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                type="search"
                                placeholder="Search..."
                                className="w-full rounded-lg bg-background pl-8 md:w-[200px] lg:w-[320px]"
                            />
                        </div>
                    </header>
                    <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
                        <Tabs defaultValue="all">
                            <div className="flex items-center">
                                <TabsList>
                                    <TabsTrigger value="all">All</TabsTrigger>
                                    <TabsTrigger value="active">
                                        Active
                                    </TabsTrigger>
                                    <TabsTrigger value="draft">
                                        Draft
                                    </TabsTrigger>
                                    <TabsTrigger
                                        value="archived"
                                        className="hidden sm:flex"
                                    >
                                        Archived
                                    </TabsTrigger>
                                </TabsList>
                                <div className="ms-auto flex items-center gap-2">
                                    {/* <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm" className="h-7 gap-1">
                        <ListFilter className="h-3.5 w-3.5" />
                        <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                          Filter
                        </span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Filter by</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuCheckboxItem checked>
                        Active
                      </DropdownMenuCheckboxItem>
                      <DropdownMenuCheckboxItem>Draft</DropdownMenuCheckboxItem>
                      <DropdownMenuCheckboxItem>
                        Archived
                      </DropdownMenuCheckboxItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                  <Button size="sm" variant="outline" className="h-7 gap-1">
                    <File className="h-3.5 w-3.5" />
                    <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                      Export
                    </span>
                  </Button> */}
                                    <Link to="/add">
                                        {' '}
                                        <Button size="sm" className="h-7 gap-1">
                                            <PlusCircle className="h-3.5 w-3.5" />
                                            <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                                                Add Facility
                                            </span>
                                        </Button>
                                    </Link>
                                </div>
                            </div>
                            <TabsContent value="all">
                                <Card x-chunk="dashboard-06-chunk-0">
                                    <CardHeader>
                                        <CardTitle>All Facilities</CardTitle>
                                        <CardDescription>
                                            Manage your Facility by adding,
                                            editing, and deleting Facility
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    {/* <TableHead className="hidden w-[100px] sm:table-cell">
                            <span className="sr-only">img</span>
                          </TableHead> */}
                                                    <TableHead>Name</TableHead>

                                                    {/* <TableHead>Desc</TableHead> */}

                                                    <TableHead>
                                                        <span className="">
                                                            Actions
                                                        </span>
                                                    </TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {facilitys.map(
                                                    (facility: any, i) => (
                                                        <TableRow key={i}>
                                                            <TableCell>
                                                                {facility.title}
                                                            </TableCell>

                                                            {/* <TableCell>
                                                                <Badge variant="outline">
                                                                    {
                                                                        facility.content
                                                                    }
                                                                </Badge>
                                                            </TableCell> */}
                                                            <TableCell>
                                                                <DropdownMenu>
                                                                    <DropdownMenuTrigger
                                                                        asChild
                                                                    >
                                                                        <Button
                                                                            aria-haspopup="true"
                                                                            size="icon"
                                                                            variant="ghost"
                                                                        >
                                                                            <MoreHorizontal className="h-4 w-4" />
                                                                            <span className="sr-only">
                                                                                Toggle
                                                                                menu
                                                                            </span>
                                                                        </Button>
                                                                    </DropdownMenuTrigger>
                                                                    <DropdownMenuContent align="end">
                                                                        <DropdownMenuItem
                                                                            className="cursor-pointer"
                                                                            onClick={() => {
                                                                                navigate(
                                                                                    `/update/${facility.id}`
                                                                                )
                                                                            }}
                                                                        >
                                                                            Edit
                                                                        </DropdownMenuItem>

                                                                        <DropdownMenuItem
                                                                            className="cursor-pointer"
                                                                            onClick={() => {
                                                                                if (
                                                                                    !window.confirm(
                                                                                        'Are you sure you want to delete this Facility?'
                                                                                    )
                                                                                ) {
                                                                                    return
                                                                                }

                                                                                const nonce =
                                                                                    window
                                                                                        ?.appLocalizer
                                                                                        ?.nonce ||
                                                                                    ''

                                                                                fetch(
                                                                                    `${DELETE_API_URL}/${facility.id}`,
                                                                                    {
                                                                                        method: 'DELETE',
                                                                                        headers:
                                                                                            {
                                                                                                'Content-Type':
                                                                                                    'application/json',
                                                                                                'X-WP-Nonce':
                                                                                                    nonce,
                                                                                            },
                                                                                        body: JSON.stringify(
                                                                                            {
                                                                                                id: facility.id,
                                                                                            }
                                                                                        ),
                                                                                    }
                                                                                )
                                                                                    .then(
                                                                                        (
                                                                                            response
                                                                                        ) => {
                                                                                            if (
                                                                                                !response.ok
                                                                                            ) {
                                                                                                throw new Error(
                                                                                                    'Failed to delete user'
                                                                                                )
                                                                                            }
                                                                                            setRefresh(
                                                                                                !refresh
                                                                                            )
                                                                                        }
                                                                                    )
                                                                                    .catch(
                                                                                        (
                                                                                            error
                                                                                        ) => {
                                                                                            console.error(
                                                                                                'Error deleting user:',
                                                                                                error
                                                                                            )
                                                                                        }
                                                                                    )
                                                                            }}
                                                                        >
                                                                            Delete
                                                                        </DropdownMenuItem>
                                                                    </DropdownMenuContent>
                                                                </DropdownMenu>
                                                            </TableCell>
                                                        </TableRow>
                                                    )
                                                )}
                                            </TableBody>
                                        </Table>
                                    </CardContent>
                                    <CardFooter>
                                        <div className="text-xs text-muted-foreground">
                                            Showing{' '}
                                            <strong>{facilitys.length}</strong>{' '}
                                            of{' '}
                                            <strong>{facilitys.length}</strong>{' '}
                                            Facility
                                        </div>
                                    </CardFooter>
                                </Card>
                            </TabsContent>
                        </Tabs>
                    </main>
                </div>
            </div>
        </TooltipProvider>
    )
}
