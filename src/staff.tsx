import ReactDOM from 'react-dom/client'
import { ThemeProvider } from './components/theme-provider'
import { ModeToggle } from './components/mode-toggle'
import { Toaster } from '@/components/ui/toaster'
import { createHashRouter, RouterProvider, RouteObject } from 'react-router-dom'

import AddOrUpdateStaff from './pages/staff/AddOrUpdateStaff'
import StaffDetails from './pages/StaffDetails'
import NotFound from './components/NotFound'
import './index.css'
import CreateForm from './components/CreateForm'
import CreateAndUpdateFormPage from './pages/CreateAndUpdateFormPage'
import List from './pages/staff/List'
import FormBuilder from './components/Builder/Formbuilder'

// Define routes for the app
const routes: RouteObject[] = [
    {
        path: '/',
        element: <List />,
    },
    {
        path: '/update/:id', // For editing a specific staff member
        element: (
            <div>
                <div className="w-full lg:w-[800px]">
                    <AddOrUpdateStaff />
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
                    <AddOrUpdateStaff />
                </div>
            </div>
        ),
    },
    {
        path: '/view/:id', // For viewing staff details
        element: <StaffDetails />,
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
                <div className="ms-auto">
                    <ModeToggle />
                </div>
            </div>
            <RouterProvider router={router} />
            <Toaster />
        </ThemeProvider>
    )
}
