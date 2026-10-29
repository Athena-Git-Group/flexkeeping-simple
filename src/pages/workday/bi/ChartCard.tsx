// Card shell shared by every chart: Superset-style header (funnel icon,
// applied-filter badge, ⋮ menu), PNG export of the embedded SVG, and a small
// "view data" modal listing the numbers behind the chart.

import { useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { useTranslation } from "react-i18next";
import { downloadSvgAsPng } from "./chartUtils";

const SUPERSET_BLUE = "#20A7C9";

export interface DataRow {
  label: string;
  value: number | string;
}

function FunnelIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" aria-hidden>
      <path d="M1.5 2h13L9.5 8.5V14l-3-1.5V8.5L1.5 2z" fill="none" stroke="#879399" strokeWidth="1.3" strokeLinejoin="round" />
    </svg>
  );
}

export function ChartCard({
  title,
  filterCount,
  exportName,
  data,
  children,
}: {
  title: string;
  filterCount: number;
  exportName: string;
  data: DataRow[];
  children: ReactNode;
}) {
  const { t } = useTranslation();
  const bodyRef = useRef<HTMLDivElement>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  const handleDownload = () => {
    setMenuOpen(false);
    const svg = bodyRef.current?.querySelector("svg");
    if (svg) downloadSvgAsPng(svg, exportName);
  };

  return (
    <div className="rounded-md border border-gray-200 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-gray-100 px-4 py-2.5">
        <h3 className="text-[13px] font-semibold text-[#333]">{title}</h3>
        <div className="flex items-center gap-2.5">
          <FunnelIcon />
          {filterCount > 0 && (
            <span
              className="flex h-[18px] w-[18px] items-center justify-center rounded-full text-[10px] font-semibold text-white"
              style={{ backgroundColor: SUPERSET_BLUE }}
            >
              {filterCount}
            </span>
          )}
          <div className="relative">
            <button
              className="px-1 text-[15px] leading-none text-[#879399] hover:text-[#333]"
              onClick={() => setMenuOpen((o) => !o)}
              aria-label="menu"
            >
              ⋮
            </button>
            {menuOpen && (
              <>
                <div className="fixed inset-0 z-30" onClick={() => setMenuOpen(false)} />
                <div className="absolute right-0 top-6 z-40 w-44 rounded border border-gray-200 bg-white py-1 text-[12px] text-[#333] shadow-lg">
                  <button className="block w-full px-3 py-1.5 text-left hover:bg-gray-50" onClick={handleDownload}>
                    {t("workday.bi.menuDownloadPng")}
                  </button>
                  <button
                    className="block w-full px-3 py-1.5 text-left hover:bg-gray-50"
                    onClick={() => {
                      setMenuOpen(false);
                      setModalOpen(true);
                    }}
                  >
                    {t("workday.bi.menuViewData")}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
      <div ref={bodyRef}>{children}</div>

      {modalOpen &&
        createPortal(
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
            onClick={() => setModalOpen(false)}
          >
            <div
              className="max-h-[70vh] w-[360px] overflow-y-auto rounded-md bg-white shadow-xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between border-b border-gray-100 px-4 py-2.5">
                <h4 className="text-[13px] font-semibold text-[#333]">{title}</h4>
                <button className="text-[15px] leading-none text-[#879399] hover:text-[#333]" onClick={() => setModalOpen(false)}>
                  ✕
                </button>
              </div>
              <table className="w-full text-[12px]">
                <thead>
                  <tr className="border-b border-gray-100 text-left text-[11px] text-gray-500">
                    <th className="px-4 py-1.5 font-medium">{t("workday.bi.colLabel")}</th>
                    <th className="px-4 py-1.5 text-right font-medium">{t("workday.bi.colValue")}</th>
                  </tr>
                </thead>
                <tbody>
                  {data.map((row) => (
                    <tr key={row.label} className="border-b border-gray-50 text-[#333]">
                      <td className="px-4 py-1.5">{row.label}</td>
                      <td className="px-4 py-1.5 text-right tabular-nums">{row.value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="px-4 py-2.5 text-right">
                <button
                  className="rounded border border-gray-300 px-3 py-1 text-[11px] font-semibold text-[#555] hover:bg-gray-50"
                  onClick={() => setModalOpen(false)}
                >
                  {t("workday.bi.closeModal")}
                </button>
              </div>
            </div>
          </div>,
          document.body,
        )}
    </div>
  );
}
