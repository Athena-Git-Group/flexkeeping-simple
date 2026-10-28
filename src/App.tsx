import { createBrowserRouter, Navigate, RouterProvider } from "react-router-dom";
import { AppShell } from "@/components/shell/AppShell";
import { DashboardPage } from "@/pages/DashboardPage";
import { HousekeepingPage } from "@/pages/HousekeepingPage";
import { TasksPage } from "@/pages/TasksPage";
import { RoomAllocationPage } from "@/pages/RoomAllocationPage";
import { LostAndFoundPage } from "@/pages/LostAndFoundPage";
import { GuestRelationsPage } from "@/pages/GuestRelationsPage";
import { AuditsPage } from "@/pages/AuditsPage";
import { SettingsLayout } from "@/pages/settings/SettingsLayout";
import { StaffPage } from "@/pages/settings/StaffPage";
import { RolesPage } from "@/pages/settings/RolesPage";
import { PropertyPage } from "@/pages/settings/PropertyPage";
import { FieldView } from "@/pages/field/FieldView";

const router = createBrowserRouter([
  { path: "/field", element: <FieldView /> },
  {
    path: "/",
    element: <AppShell />,
    children: [
      { index: true, element: <DashboardPage /> },
      { path: "housekeeping", element: <HousekeepingPage /> },
      { path: "tasks", element: <TasksPage /> },
      { path: "allocation", element: <RoomAllocationPage /> },
      { path: "lost-and-found", element: <LostAndFoundPage /> },
      { path: "guest-relations", element: <GuestRelationsPage /> },
      { path: "audits", element: <AuditsPage /> },
      {
        path: "settings",
        element: <SettingsLayout />,
        children: [
          { index: true, element: <Navigate to="staff" replace /> },
          { path: "staff", element: <StaffPage /> },
          { path: "roles", element: <RolesPage /> },
          { path: "property", element: <PropertyPage /> },
        ],
      },
    ],
  },
]);

export function App() {
  return <RouterProvider router={router} />;
}
