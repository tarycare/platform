import { MoreHorizontal } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
// the hook
import { useTranslation } from "react-i18next";
import First from "./pages/first";
import Second from "./pages/second";

import { HashRouter as Router, Route, Routes, NavLink } from "react-router-dom";

export default function AppExample() {
  const { t, i18n } = useTranslation();
  console.log("NODE_ENV:", process.env.NODE_ENV); // Should log "development"
  // check html dir attribute it if rtl  set i18n.language to ar else en..
  if (document.documentElement.dir === "rtl") {
    i18n.changeLanguage("ar");
  } else {
    i18n.changeLanguage("en");
  }

  // Dynamically determine the basename
  //   const base = "/wp-admin/admin.php?page=wprk-settings";
  const base = window.location.pathname;
  console.log("base:", base);

  return (
    <div>
      <Router>
        <div className="flex gap-2 items-center mb-3">
          {/* NavLink for Home with static and dynamic classes */}
          <NavLink
            to="/"
            className={({ isActive }) =>
              `px-4 py-2 rounded-md ${
                isActive
                  ? "bg-blue-500 text-white hover:bg-blue-600 hover:text-white"
                  : "text-black"
              }`
            }
          >
            {t("Home")}
          </NavLink>

          {/* NavLink for About with static and dynamic classes */}
          <NavLink
            to="/about"
            className={({ isActive }) =>
              `px-4 py-2 rounded-md ${
                isActive
                  ? "bg-blue-500 text-white hover:bg-blue-600 hover:text-white"
                  : "text-black"
              }`
            }
          >
            {t("About")}
          </NavLink>
        </div>
        <Routes>
          <Route path="/" element={<First />} />
          <Route path="/about" element={<Second />} />
        </Routes>
      </Router>

      <Card>
        <CardHeader>
          <CardTitle>{t("Products")}</CardTitle>
          <CardDescription>{t("product desc")}</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="hidden w-[100px] sm:table-cell">
                  <span>{t("Image")}</span>
                </TableHead>
                <TableHead>{t("Product Name")}</TableHead>
                <TableHead>{t("Status")}</TableHead>
                <TableHead className="hidden md:table-cell">
                  {t("Price")}
                </TableHead>
                <TableHead className="hidden md:table-cell">
                  {t("Inventory")}
                </TableHead>
                <TableHead className="hidden md:table-cell">
                  {t("Last Updated")}
                </TableHead>
                <TableHead>
                  <span className="sr-only">{t("Actions")}</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="hidden sm:table-cell">
                  <img
                    src="https://random.imagecdn.app/64/64"
                    className="rounded-md"
                  />
                </TableCell>
                <TableCell className="font-medium">
                  Laser Lemonade Machine
                </TableCell>
                <TableCell>
                  <Badge variant="outline">{t("Draft")}</Badge>
                </TableCell>
                <TableCell className="hidden md:table-cell">$499.99</TableCell>
                <TableCell className="hidden md:table-cell">25</TableCell>
                <TableCell className="hidden md:table-cell">
                  2023-07-12 10:42 AM
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button aria-haspopup="true" size="icon" variant="ghost">
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">Toggle menu</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuItem>Edit</DropdownMenuItem>
                      <DropdownMenuItem>Delete</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="hidden sm:table-cell">
                  <img
                    src="https://random.imagecdn.app/64/64"
                    className="rounded-md"
                  />
                </TableCell>
                <TableCell className="font-medium">
                  Hypernova Headphones
                </TableCell>
                <TableCell>
                  <Badge variant="outline">{t("Active")}</Badge>
                </TableCell>
                <TableCell className="hidden md:table-cell">$129.99</TableCell>
                <TableCell className="hidden md:table-cell">100</TableCell>
                <TableCell className="hidden md:table-cell">
                  2023-10-18 03:21 PM
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button aria-haspopup="true" size="icon" variant="ghost">
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">Toggle menu</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuItem>Edit</DropdownMenuItem>
                      <DropdownMenuItem>Delete</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="hidden sm:table-cell">
                  <img
                    src="https://random.imagecdn.app/64/64"
                    className="rounded-md"
                  />
                </TableCell>
                <TableCell className="font-medium">
                  AeroGlow Desk Lamp
                </TableCell>
                <TableCell>
                  <Badge variant="outline">{t("Active")}</Badge>
                </TableCell>
                <TableCell className="hidden md:table-cell">$39.99</TableCell>
                <TableCell className="hidden md:table-cell">50</TableCell>
                <TableCell className="hidden md:table-cell">
                  2023-11-29 08:15 AM
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button aria-haspopup="true" size="icon" variant="ghost">
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">Toggle menu</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuItem>Edit</DropdownMenuItem>
                      <DropdownMenuItem>Delete</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="hidden sm:table-cell">
                  <img
                    src="https://random.imagecdn.app/64/64"
                    className="rounded-md"
                  />
                </TableCell>
                <TableCell className="font-medium">
                  TechTonic Energy Drink
                </TableCell>
                <TableCell>
                  <Badge variant="secondary">{t("Draft")}</Badge>
                </TableCell>
                <TableCell className="hidden md:table-cell">$2.99</TableCell>
                <TableCell className="hidden md:table-cell">0</TableCell>
                <TableCell className="hidden md:table-cell">
                  2023-12-25 11:59 PM
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button aria-haspopup="true" size="icon" variant="ghost">
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">Toggle menu</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuItem>Edit</DropdownMenuItem>
                      <DropdownMenuItem>Delete</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="hidden sm:table-cell">
                  <img
                    src="https://random.imagecdn.app/64/64"
                    className="rounded-md"
                  />
                </TableCell>
                <TableCell className="font-medium">
                  Gamer Gear Pro Controller
                </TableCell>
                <TableCell>
                  <Badge variant="outline">{t("Active")}</Badge>
                </TableCell>
                <TableCell className="hidden md:table-cell">$59.99</TableCell>
                <TableCell className="hidden md:table-cell">75</TableCell>
                <TableCell className="hidden md:table-cell">
                  2024-01-01 12:00 AM
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button aria-haspopup="true" size="icon" variant="ghost">
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">Toggle menu</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuItem>Edit</DropdownMenuItem>
                      <DropdownMenuItem>Delete</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="hidden sm:table-cell">
                  <img
                    src="https://random.imagecdn.app/64/64"
                    className="rounded-md"
                  />
                </TableCell>
                <TableCell className="font-medium">
                  Luminous VR Headset
                </TableCell>
                <TableCell>
                  <Badge variant="outline">{t("Active")}</Badge>
                </TableCell>
                <TableCell className="hidden md:table-cell">$199.99</TableCell>
                <TableCell className="hidden md:table-cell">30</TableCell>
                <TableCell className="hidden md:table-cell">
                  2024-02-14 02:14 PM
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button aria-haspopup="true" size="icon" variant="ghost">
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">Toggle menu</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuItem>Edit</DropdownMenuItem>
                      <DropdownMenuItem>Delete</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
        <CardFooter>
          <div className="text-xs text-muted-foreground">
            Showing <strong>1-10</strong> of <strong>32</strong> products
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
