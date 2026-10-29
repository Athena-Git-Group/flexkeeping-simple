import { CLEANING_FLAW_RECORDS } from "@/pages/workday/analytics/data";
import { FacetDashboard, PanelConfig } from "@/pages/workday/analytics/shared";

const LEFT: PanelConfig[] = [
  { kind: "facet", titleKey: "panels.code", field: "code" },
  { kind: "facet", titleKey: "panels.category", field: "category" },
  { kind: "facet", titleKey: "panels.priority", field: "priority" },
  { kind: "facet", titleKey: "panels.creationDate", field: "date" },
  { kind: "facet", titleKey: "panels.createdBy", field: "createdBy" },
  { kind: "facet", titleKey: "panels.groupCreatedBy", field: "createdByGroup" },
  { kind: "static", titleKey: "panels.scheduleFor" },
];

const RIGHT: PanelConfig[] = [
  { kind: "facet", titleKey: "panels.rooms", field: "room" },
  { kind: "facet", titleKey: "panels.completed", field: "completed" },
  { kind: "facet", titleKey: "panels.completedBy", field: "completedBy" },
  { kind: "static", titleKey: "panels.groupCompletedBy" },
  { kind: "static", titleKey: "panels.assignmentType", valueKey: "facets.cleaningFlaw" },
  { kind: "static", titleKey: "panels.canceled", valueKey: "facets.active" },
  { kind: "static", titleKey: "panels.canceledBy", valueKey: "facets.active" },
  { kind: "static", titleKey: "panels.groupCanceledBy" },
  { kind: "static", titleKey: "panels.hasTodoList", valueKey: "facets.no" },
];

export function CleaningFlawPage() {
  return (
    <FacetDashboard
      headerKey="headers.cleaningFlaw"
      sectionKey="sections.cleaningFlaws"
      radioName="cleaning-flaw-period"
      module="cleaning"
      seedRecords={CLEANING_FLAW_RECORDS}
      leftPanels={LEFT}
      rightPanels={RIGHT}
      csvFilename="cleaning-flaws.csv"
    />
  );
}
