import ReactDOM from "react-dom/client";
import { ThemeProvider } from "./components/theme-provider";
import { ModeToggle } from "./components/mode-toggle";
import { Toaster } from "@/components/ui/toaster";
import {
  createHashRouter,
  RouterProvider,
  RouteObject,
} from "react-router-dom";

import AddOrUpdateStaff from "./pages/AddOrUpdateStaff";
import StaffDetails from "./pages/StaffDetails";
import NotFound from "./components/NotFound";
import App from "./app";
import "./index.css";
import Home from "./pages/Home";

// Define routes for the app
const routes: RouteObject[] = [
  {
    path: "/",
    element: (
      <div>
        {/* <App /> */}
        <div className="w-[800px]">
          <Home />
        </div>
      </div>
    ),
  },
  {
    path: "/update/:id", // For editing a specific staff member
    element: <AddOrUpdateStaff />,
  },
  {
    path: "/add", // For adding a new staff member
    element: <AddOrUpdateStaff />,
  },
  {
    path: "/view/:id", // For viewing staff details
    element: <StaffDetails />,
  },
  {
    path: "*", // Catch-all route for undefined paths
    element: <NotFound />,
  },
];

// Create a HashRouter to manage the navigation inside the WordPress admin
const router = createHashRouter(routes);

const rootElement = document.getElementById("wp-react-app");

if (rootElement) {
  const root = ReactDOM.createRoot(rootElement);
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
  );
}
