import { useTranslation } from "react-i18next";
import { REPAIR_RECORDS } from "@/pages/workday/analytics/data";
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
  { kind: "collapsed", titleKey: "panels.groupCompletedBy" },
  { kind: "collapsed", titleKey: "panels.assignmentType" },
  { kind: "collapsed", titleKey: "panels.canceled" },
  { kind: "collapsed", titleKey: "panels.canceledBy" },
  { kind: "collapsed", titleKey: "panels.groupCanceledBy" },
  { kind: "collapsed", titleKey: "panels.hasTodoList" },
  { kind: "collapsed", titleKey: "panels.forOutsource" },
];

export function RepairsAnalyticsPage() {
  const { t } = useTranslation();
  return (
    <FacetDashboard
      headerKey="headers.repair"
      sectionKey="sections.maintenance"
      radioName="repairs-period"
      module="maintenance"
      seedRecords={REPAIR_RECORDS}
      leftPanels={LEFT}
      rightPanels={RIGHT}
      csvFilename="maintenance.csv"
      sectionChip={t("workday.analytics.sections.roomsChip", { room: "308" })}
    />
  );
}
