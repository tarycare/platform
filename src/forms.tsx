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
import FormBuilder from './components/Builder/Formbuilder'
import SubmmisionsList from './pages/form/SubmmisionsList'
import CRUD_Submission from './pages/form/AddOrUpdateSubmission'

import List from './pages/showList/page'
import View from './pages/View'
import AddUpdate from './pages/AddUpdate'

// Define routes for the app
const routes: RouteObject[] = [
    {
        path: '/',
        element: <List type="form" />,
    },
    {
        path: '/view/:id', // For viewing staff details
        element: <View type="form" />,
    },
    {
        path: '/update/:id', // For editing a specific form
        element: (
            <div>
                <div className="w-full">
                    <FormBuilder />
                </div>
            </div>
        ),
    },
    {
        path: '/add', // For adding a new form
        element: (
            <div>
                <div className="w-full">
                    <FormBuilder />
                </div>
            </div>
        ),
    },
    {
        path: '/form-submissions/:id', // For viewing form submissions
        element: <List type="submission" />,
    },
    {
        path: ':formId/view-submission/:id', // For viewing form submissions
        element: <View type="submission" />,
    },
    {
        path: ':formId/add',
        element: <AddUpdate type="submission" />,
    },

    {
        path: ':formId/update/:id',
        element: <AddUpdate type="submission" />,
    },
]

// Create a HashRouter to manage the navigation inside the WordPress admin
const router = createHashRouter(routes)

const rootElement = document.getElementById('forms')

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
