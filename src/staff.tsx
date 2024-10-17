import ReactDOM from 'react-dom/client'
import { ThemeProvider } from './components/theme-provider'
import { ModeToggle } from './components/mode-toggle'
import { Toaster } from '@/components/ui/toaster'
import { createHashRouter, RouterProvider, RouteObject } from 'react-router-dom'

import NotFound from './components/NotFound'
import './index.css'
import CreateForm from './components/CreateForm'

import FormBuilder from './components/Builder/Formbuilder'
import List from './pages/List/page'
import View from './pages/View'
import AddUpdate from './pages/AddUpdate'

// Define routes for the app
const routes: RouteObject[] = [
    {
        path: '/',
        element: (
            <List
                type="staff"
                title={{ title_en: 'Staff', title_ar: 'الموظفين' }}
                description={{
                    description_en: 'List of all staff members',
                    description_ar: 'قائمة بجميع الموظفين',
                }}
            />
        ),
    },
    {
        path: '/view/:id', // For viewing staff details
        element: <View type="staff" />,
    },

    {
        path: '/update/:id', // For editing a specific staff member
        element: (
            <div>
                <div className="w-full lg:w-[800px]">
                    <AddUpdate type="staff" />
                </div>
            </div>
        ),
    },
    {
        path: '/add', // For adding a new staff member
        element: (
            <div>
                <div className="w-full lg:w-[800px]">
                    {/* <CreateAndUpdateFormPage /> */}
                    <AddUpdate type="staff" />
                </div>
            </div>
        ),
    },

    {
        path: '*', // Catch-all route for undefined paths
        element: <NotFound />,
    },
    {
        path: '/create', // Catch-all route for undefined paths
        element: <CreateForm />,
    },
    {
        path: '/form-builder',
        element: <FormBuilder />,
    },
]

// Create a HashRouter to manage the navigation inside the WordPress admin
const router = createHashRouter(routes)

const rootElement = document.getElementById('staff')

if (rootElement) {
    const root = ReactDOM.createRoot(rootElement)
    root.render(
        <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
            <div className="flex w-full">
                <div className="ms-auto">{/* <ModeToggle /> */}</div>
            </div>
            <RouterProvider router={router} />
            <Toaster />
        </ThemeProvider>
    )
}
