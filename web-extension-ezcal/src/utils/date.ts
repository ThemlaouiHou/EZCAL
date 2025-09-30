export const pad2 = (n: number) => String(n).padStart(2, "0");

export function parseDateLoose(v: string | number | Date | undefined | null): Date | null {
  if (!v && v !== 0) return null;
  if (v instanceof Date) return isNaN(v.getTime()) ? null : v;
  if (typeof v === "number") {
    const d = new Date(v);
    return isNaN(d.getTime()) ? null : d;
  }
  let s = String(v).trim();
  if (!s) return null;

  s = s.replace(/\s+/, "T");

  let d = new Date(s);
  if (!isNaN(d.getTime())) return d;

  let m = s.match(/^(\d{4})[-/.](\d{2})[-/.](\d{2})(?:T(\d{1,2}):(\d{2}))?$/);
  if (m) {
    const Y = +m[1], Mo = +m[2] - 1, D = +m[3], hh = +(m[4] ?? "0"), mm = +(m[5] ?? "0");
    d = new Date(Y, Mo, D, hh, mm);
    return isNaN(d.getTime()) ? null : d;
  }

  m = s.match(/^(\d{1,2})[./-](\d{1,2})[./-](\d{4})(?:\s*T?(\d{1,2}):(\d{2}))?$/);
  if (m) {
    const D = +m[1], Mo = +m[2] - 1, Y = +m[3], hh = +(m[4] ?? "0"), mm = +(m[5] ?? "0");
    d = new Date(Y, Mo, D, hh, mm);
    return isNaN(d.getTime()) ? null : d;
  }

  return null;
}

export function normalizeDateTime(s: string | undefined | null): string {
  if (!s) return "";
  s = String(s).trim().replace(/\u00A0/g, " ");

  const toDateTime = (Y: number, M: number, D: number, hh: number, mm: number) =>
    `${Y}-${pad2(M)}-${pad2(D)}T${pad2(hh)}:${pad2(mm)}`;
  
  const toDateOnly = (Y: number, M: number, D: number) =>
    `${Y}-${pad2(M)}-${pad2(D)}`;

  let m = s.match(/^(\d{1,2})[./-](\d{1,2})[./-](\d{4})(?:[ T](\d{1,2}):(\d{2}))?$/);
  if (m) {
    const D = +m[1], M = +m[2], Y = +m[3];
    return m[4] && m[5] ? toDateTime(Y, M, D, +m[4], +m[5]) : toDateOnly(Y, M, D);
  }

  m = s.match(/^(\d{4})-(\d{1,2})-(\d{1,2})(?:[ T](\d{1,2}):(\d{2}))?$/);
  if (m) {
    const Y = +m[1], M = +m[2], D = +m[3];
    return m[4] && m[5] ? toDateTime(Y, M, D, +m[4], +m[5]) : toDateOnly(Y, M, D);
  }

  try {
    const d = new Date(s.replace(/\s+/, "T"));
    if (!isNaN(d.getTime())) {
      const Y = d.getFullYear(), M = d.getMonth() + 1, D = d.getDate();
      const hh = d.getHours(), mm = d.getMinutes();
      return (hh === 0 && mm === 0 && !s.includes(':')) ? toDateOnly(Y, M, D) : toDateTime(Y, M, D, hh, mm);
    }
  } catch {}

  return s;
}

export function formatDateTime(dateString: string): string {
  if (!dateString?.trim()) return 'No date';
  
  try {
    const d = new Date(dateString);
    if (!isNaN(d.getTime())) {
      const day = pad2(d.getDate());
      const month = pad2(d.getMonth() + 1);
      const year = d.getFullYear();
      const time = `${pad2(d.getHours())}:${pad2(d.getMinutes())}`;
      return `${day}/${month}/${year} ${time}`;
    }
  } catch {}
  
  return dateString;
}