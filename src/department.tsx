import './index.css'

import ReactDOM from 'react-dom/client'
import { ThemeProvider } from './components/theme-provider'
import { ModeToggle } from './components/mode-toggle'
import { Toaster } from '@/components/ui/toaster'
import { createHashRouter, RouterProvider, RouteObject } from 'react-router-dom'

import NotFound from './components/NotFound'
import AddUpdate from './pages/AddUpdate'
import View from './pages/View'
import List from './pages/List/page'

// Define routes for the app
const routes: RouteObject[] = [
    {
        path: '/',
        element: (
            <List
                type="department"
                title={{ title_en: 'Departments', title_ar: 'الأقسام' }}
                description={{
                    description_en: 'List of all departments',
                    description_ar: 'قائمة بجميع الأقسام',
                }}
            />
        ),
    },
    {
        path: '/view/:id', // For viewing staff details
        element: <View type="department" />,
    },
    {
        path: '/update/:id', // For editing a specific staff member
        element: (
            <div>
                <div className="w-full lg:w-[800px]">
                    <AddUpdate type="department" />
                </div>
            </div>
        ),
    },
    {
        path: '/add', // For adding a new staff member
        element: (
            <div>
                <div className="w-full lg:w-[800px]">
                    <AddUpdate type="department" />
                </div>
            </div>
        ),
    },

    {
        path: '*', // Catch-all route for undefined paths
        element: <NotFound />,
    },
]

// Create a HashRouter to manage the navigation inside the WordPress admin
const router = createHashRouter(routes)

const rootElement = document.getElementById('department')

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
