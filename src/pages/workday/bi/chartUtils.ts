// Shared math + export helpers for the hand-rolled SVG charts on the BI page.

export interface Slice {
  // i18n key suffix under "workday.bi." — translated at render time.
  labelKey: string;
  value: number;
  color: string;
}

export interface DonutSegment extends Slice {
  start: number;
  end: number;
  mid: number;
  percent: number;
}

// Soft multi-hue palette lifted from Superset's default categorical scheme,
// so the mock reads as a genuine Superset embed.
export const PALETTE = [
  "#1FA8C9",
  "#454E7C",
  "#5AC189",
  "#FF7F44",
  "#666666",
  "#E04355",
  "#FCC700",
  "#A868B7",
  "#3CCCCB",
  "#A38F79",
  "#8FD3E4",
  "#A1A6BD",
  "#ACE1C4",
  "#FEC0A1",
  "#B2B2B2",
  "#EFA1AA",
  "#FDE380",
  "#D3B3DA",
];

// Angle convention: 0° at 12 o'clock, growing clockwise, to match how
// Superset/ECharts starts pie slices at the top.
export function polar(cx: number, cy: number, r: number, angleDeg: number): [number, number] {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return [cx + r * Math.cos(rad), cy + r * Math.sin(rad)];
}

export function arcPath(cx: number, cy: number, r: number, start: number, end: number): string {
  const [x1, y1] = polar(cx, cy, r, start);
  const [x2, y2] = polar(cx, cy, r, end);
  const large = end - start > 180 ? 1 : 0;
  return `M ${x1.toFixed(2)} ${y1.toFixed(2)} A ${r} ${r} 0 ${large} 1 ${x2.toFixed(2)} ${y2.toFixed(2)}`;
}

export function layoutDonut(slices: Slice[]): DonutSegment[] {
  const total = slices.reduce((s, d) => s + d.value, 0);
  let angle = 0;
  return slices.map((s) => {
    const sweep = total > 0 ? (s.value / total) * 360 : 0;
    const seg = {
      ...s,
      start: angle,
      end: angle + sweep,
      mid: angle + sweep / 2,
      percent: total > 0 ? (s.value / total) * 100 : 0,
    };
    angle += sweep;
    return seg;
  });
}

// Serializes the SVG to a blob URL, rasterizes it on a canvas (2x for
// crispness) and triggers a download — no library, demo-grade export.
export function downloadSvgAsPng(svg: SVGSVGElement, filename: string): void {
  const xml = new XMLSerializer().serializeToString(svg);
  const blob = new Blob([xml], { type: "image/svg+xml;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const img = new Image();
  const vb = svg.viewBox.baseVal;
  const width = vb && vb.width > 0 ? vb.width : svg.clientWidth || 340;
  const height = vb && vb.height > 0 ? vb.height : svg.clientHeight || 200;
  const scale = 2;
  img.onload = () => {
    const canvas = document.createElement("canvas");
    canvas.width = width * scale;
    canvas.height = height * scale;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      const a = document.createElement("a");
      a.download = `${filename}.png`;
      a.href = canvas.toDataURL("image/png");
      a.click();
    }
    URL.revokeObjectURL(url);
  };
  img.onerror = () => URL.revokeObjectURL(url);
  img.src = url;
}
