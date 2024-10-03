import ReactDOM from 'react-dom/client'
import { ThemeProvider } from './components/theme-provider'
import { ModeToggle } from './components/mode-toggle'
import { Toaster } from '@/components/ui/toaster'
import { createHashRouter, RouterProvider, RouteObject } from 'react-router-dom'

import AddOrUpdateStaff from './pages/staff/AddOrUpdateStaff'
import StaffDetails from './pages/staff/StaffDetails'
import NotFound from './components/NotFound'
import './index.css'
import CreateForm from './components/CreateForm'
import CreateAndUpdateFormPage from './pages/CreateAndUpdateFormPage'
import List from './pages/equipment/ListEquipments'
import CRUD_Equipment from './pages/equipment/AddOrUpdateEquipment'

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
                    <CRUD_Equipment />
                </div>
            </div>
        ),
    },
    {
        path: '/add', // For adding a new staff member
        element: (
            <div>
                <div className="w-full lg:w-[800px]">
                    <CRUD_Equipment />
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
]

// Create a HashRouter to manage the navigation inside the WordPress admin
const router = createHashRouter(routes)

const rootElement = document.getElementById('equipment')

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
