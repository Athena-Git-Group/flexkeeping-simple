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
import { WorkdayShell } from "@/pages/workday/WorkdayShell";
import { RoomsOverviewPage } from "@/pages/workday/RoomsOverviewPage";
import { TasksShowcasePage } from "@/pages/workday/TasksShowcasePage";
import { ChatPage } from "@/pages/workday/ChatPage";
import { AllocationPage } from "@/pages/workday/AllocationPage";
import { SchedulePage } from "@/pages/workday/SchedulePage";
import { WorkflowBuilderPage } from "@/pages/workday/WorkflowBuilderPage";
import { CleaningTimesPage } from "@/pages/workday/CleaningTimesPage";
import { CleaningFlawPage } from "@/pages/workday/CleaningFlawPage";
import { RepairsAnalyticsPage } from "@/pages/workday/RepairsAnalyticsPage";
import { BiDashboardPage } from "@/pages/workday/BiDashboardPage";
import { MobileDemoPage } from "@/pages/workday/MobileDemoPage";
import { MaintenancePage } from "@/pages/workday/MaintenancePage";
import { SopsPage } from "@/pages/workday/SopsPage";
import { ChecklistEditorPage } from "@/pages/workday/ChecklistEditorPage";
import { LostFoundPage } from "@/pages/workday/LostFoundPage";
import { ModulesPage } from "@/pages/workday/ModulesPage";

const router = createBrowserRouter([
  { path: "/field", element: <FieldView /> },
  { path: "/mobile", element: <MobileDemoPage /> },
  {
    path: "/",
    element: <WorkdayShell />,
    children: [
      { index: true, element: <RoomsOverviewPage /> },
      { path: "tasks", element: <TasksShowcasePage /> },
      { path: "chat", element: <ChatPage /> },
      { path: "allocation", element: <AllocationPage /> },
      { path: "schedule", element: <SchedulePage /> },
      { path: "workflow", element: <WorkflowBuilderPage /> },
      { path: "analytics/cleaning-times", element: <CleaningTimesPage /> },
      { path: "analytics/cleaning-flaw", element: <CleaningFlawPage /> },
      { path: "analytics/repairs", element: <RepairsAnalyticsPage /> },
      { path: "bi", element: <BiDashboardPage /> },
      { path: "maintenance", element: <MaintenancePage /> },
      { path: "sops", element: <SopsPage /> },
      { path: "checklists", element: <ChecklistEditorPage /> },
      { path: "lost-found", element: <LostFoundPage /> },
      { path: "modules", element: <ModulesPage /> },
    ],
  },
  { path: "/workday/*", element: <Navigate to="/" replace /> },
  {
    path: "/legacy",
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
