export function toNumber(v) {
  if (v == null) return null;
  if (typeof v === "number") return v;
  const asInt = parseInt(v, 10);
  if (!Number.isNaN(asInt) && String(asInt).length >= 10) return asInt;
  const d = new Date(v).getTime();
  return Number.isNaN(d) ? null : d;
}

export function fmtDate(ts) {
  if (!ts) return "—";
  const d = new Date(Number(ts));
  return d.toLocaleDateString(undefined, { year: "numeric", month: "2-digit", day: "2-digit" });
}

export function fmtTime(ts) {
  if (!ts) return "—";
  const d = new Date(Number(ts));
  return d.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });
}

export function fmtDateTime(ts) {
  if (!ts) return "—";
  const d = new Date(Number(ts));
  return d.toLocaleString(undefined, { year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" });
}
