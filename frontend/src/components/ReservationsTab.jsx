import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCurrentUser } from "../hooks/useCurrentUser";
import { fmtDate, fmtDateTime, fmtTime, toNumber } from "../utils/dates";
import ConfirmResponsePopup from "./ConfirmResponsePopup";

export default function ReservationsTab() {
  const navigate = useNavigate();
  const { authenticated, user: me } = useCurrentUser();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [users, setUsers] = useState([]);
  const [reservations, setReservations] = useState([]);

  const [query, setQuery] = useState("");

  const [courtFilter, setCourtFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const [filterMode, setFilterMode] = useState("day");
  const [specificDay, setSpecificDay] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const [sortKey, setSortKey] = useState("reservedAt");
  const [sortDir, setSortDir] = useState("asc");
  const [page, setPage] = useState(1);
  const pageSize = 12;

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [successOpen, setSuccessOpen] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState(null);

  useEffect(() => {
    if (authenticated === false) navigate("/login");
  }, [authenticated, navigate]);
  useEffect(() => {
    if (!me) return;
    if (me.roleID !== 2) navigate("/");
  }, [me, navigate]);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const [rRes, uRes] = await Promise.all([
          fetch("http://localhost:5044/api/Reservations", { credentials: "include" }),
          fetch("http://localhost:5044/api/Users", { credentials: "include" }),
        ]);
        if (!rRes.ok) throw new Error(`Reservations error ${rRes.status}`);
        if (!uRes.ok) throw new Error(`Users error ${uRes.status}`);
        const rData = await rRes.json();
        const uData = await uRes.json();
        if (cancelled) return;
        setReservations(Array.isArray(rData) ? rData : []);
        setUsers(Array.isArray(uData) ? uData : []);
      } catch (e) {
        if (!cancelled) setError(e?.message || "Unknown error");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, []);

  const rows = useMemo(() => {
    const userIndex = new Map(users.map((u) => [u.id, u]));
    const norm = (r) => {
      const userId = r.userID;
      const courtId = r.courtID;
      const reservedAt = toNumber(r.reservedAt);
      const createdAt = toNumber(r.createdAt);
      const hours = Number(r.hours);
      const user = userIndex.get(userId) || null;
      return {
        id: r.id ?? `${userId}-${reservedAt}`,
        user,
        userId,
        courtId,
        hours,
        reservedAt,
        createdAt,
        raw: r,
      };
    };
    return reservations.map(norm);
  }, [reservations, users]);

  function getReservationStatus(reservedAt, hours, now = Date.now()) {
    const start = Number(reservedAt || 0);
    const end = start + Number(hours || 0) * 60 * 60 * 1000;
    if (now < start) return "upcoming";
    if (now >= start && now < end) return "ongoing";
    return "completed";
  }
  function statusBadgeClass(status) {
    switch (status) {
      case "upcoming": return "bg-blue-500";
      case "ongoing": return "bg-red-500";
      case "completed": return "bg-green";
      default: return "bg-gray-500";
    }
  }
  function statusLabel(status) {
    switch (status) {
      case "upcoming": return "Upcoming";
      case "ongoing": return "Ongoing";
      case "completed": return "Completed";
      default: return "Unknown";
    }
  }

  const courtOptions = useMemo(() => {
    const set = new Set(rows.map((r) => r.courtId).filter(Boolean));
    return Array.from(set).sort((a, b) => Number(a) - Number(b));
  }, [rows]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();

    let fromTs = null, toTs = null;
    if (filterMode === "day" && specificDay) {
      fromTs = new Date(specificDay).setHours(0, 0, 0, 0);
      toTs   = new Date(specificDay).setHours(23, 59, 59, 999);
    } else if (filterMode === "range") {
      fromTs = dateFrom ? new Date(dateFrom).setHours(0, 0, 0, 0) : null;
      toTs   = dateTo   ? new Date(dateTo).setHours(23, 59, 59, 999) : null;
    }

    const now = Date.now();

    return rows
      .filter((r) => {
        if (courtFilter && String(r.courtId) !== String(courtFilter)) return false;

        if (fromTs && r.reservedAt < fromTs) return false;
        if (toTs && r.reservedAt > toTs) return false;

        if (statusFilter) {
          const st = getReservationStatus(r.reservedAt, r.hours, now);
          if (st !== statusFilter) return false;
        }

        if (!q) return true;
        const name = [r.user?.firstName, r.user?.lastName].filter(Boolean).join(" ").toLowerCase();
        return name.includes(q);
      })
      .sort((a, b) => {
        const dir = sortDir === "asc" ? 1 : -1;
        const get = (row) => {
          switch (sortKey) {
            case "name":
              return ([row.user?.firstName, row.user?.lastName].filter(Boolean).join(" ") || "").toLowerCase();
            case "email":
              return (row.user?.email || "").toLowerCase();
            case "courtId":
              return Number(row.courtId || 0);
            case "hours":
              return Number(row.hours || 0);
            case "createdAt":
              return Number(row.createdAt || 0);
            case "reservedAt":
            default:
              return Number(row.reservedAt || 0);
          }
        };
        const av = get(a), bv = get(b);
        if (av < bv) return -1 * dir;
        if (av > bv) return 1 * dir;
        return 0;
      });
  }, [rows, query, courtFilter, statusFilter, filterMode, specificDay, dateFrom, dateTo, sortKey, sortDir]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const pageRows = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, page]);

  useEffect(() => { setPage(1); }, [query, courtFilter, statusFilter, filterMode, specificDay, dateFrom, dateTo]);

  function toggleSort(key) {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortKey(key); setSortDir("asc"); }
  }

  function askDelete(id) {
    setPendingDeleteId(id);
    setConfirmOpen(true);
  }

  async function handleConfirmDelete() {
    const id = pendingDeleteId;
    setConfirmOpen(false);
    if (!id) return;

    const res = await fetch(`http://localhost:5044/api/Reservations/${id}`, {
      method: "DELETE",
      credentials: "include",
    });
    if (!res.ok) {
      setTimeout(() => alert(`Törlés sikertelen (${res.status})`), 0);
      return;
    }
    setReservations((prev) => prev.filter((r) => r.id !== id));
    setPendingDeleteId(null);
    setSuccessOpen(true);
  }

  return (
    <div>
      {/* Filters Toolbar — single row, no wrap */}
      <div className="mb-6 overflow-x-auto rounded-2xl border border-dark-green-octa bg-white p-3 shadow-md">
        <div className="flex items-end gap-3 flex-nowrap min-w-max">
          {/* Search (name only) */}
          <div className="flex flex-col gap-1 min-w-[220px]">
            <label className="text-xs font-medium text-dark-green">Search (name)</label>
            <input
              className="rounded-xl border border-dark-green px-3 py-2 shadow-sm outline-none transition-all focus:ring-2 focus:ring-dark-green/30"
              placeholder="e.g. Anna Kovács"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>

          {/* Court */}
          <div className="flex flex-col gap-1 min-w-[160px]">
            <label className="text-xs font-medium text-dark-green">Court</label>
            <select
              className="rounded-xl border cursor-pointer border-dark-green px-3 py-2 shadow-sm outline-none"
              value={courtFilter}
              onChange={(e) => setCourtFilter(e.target.value)}
            >
              <option value="">All courts</option>
              {courtOptions.map((c) => (
                <option key={c} value={c}>Court #{c}</option>
              ))}
            </select>
          </div>

          {/* Status */}
          <div className="flex flex-col gap-1 min-w-[170px]">
            <label className="text-xs font-medium text-dark-green">Status</label>
            <select
              className="rounded-xl border cursor-pointer border-dark-green px-3 py-2 shadow-sm outline-none"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">All statuses</option>
              <option value="upcoming">Upcoming</option>
              <option value="ongoing">Ongoing</option>
              <option value="completed">Completed</option>
            </select>
          </div>

          {/* Mode switch */}
          <div className="flex flex-col gap-1 min-w-[190px]">
            <label className="text-xs font-medium text-dark-green">Date filter</label>
            <div className="flex rounded-xl border border-dark-green overflow-hidden">
              <button
                type="button"
                className={`px-3 py-2 text-sm font-medium transition cursor-pointer flex-1 ${filterMode === "day" ? "bg-dark-green text-white" : "bg-white text-dark-green hover:bg-dark-green/10"}`}
                onClick={() => { setFilterMode("day"); setDateFrom(""); setDateTo(""); }}
                aria-pressed={filterMode === "day"}
              >
                On (Day)
              </button>
              <button
                type="button"
                className={`px-3 py-2 text-sm flex-1 font-medium cursor-pointer transition border-l border-dark-green ${filterMode === "range" ? "bg-dark-green text-white" : "bg-white text-dark-green hover:bg-dark-green/10"}`}
                onClick={() => { setFilterMode("range"); setSpecificDay(""); }}
                aria-pressed={filterMode === "range"}
              >
                From–To
              </button>
            </div>
          </div>

          {/* Day OR Range inputs (mutually exclusive) */}
          {filterMode === "day" ? (
            <div className="flex flex-col gap-1 min-w-[170px]">
              <label className="text-xs font-medium text-dark-green">On</label>
              <input
                type="date"
                className="rounded-xl border border-dark-green px-3 py-2 shadow-sm outline-none"
                value={specificDay}
                onChange={(e) => setSpecificDay(e.target.value)}
              />
            </div>
          ) : (
            <>
              <div className="flex flex-col gap-1 min-w-[170px]">
                <label className="text-xs font-medium text-dark-green">From</label>
                <input
                  type="date"
                  className="rounded-xl border border-dark-green px-3 py-2 shadow-sm outline-none"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                />
              </div>
              <div className="flex flex-col gap-1 min-w-[170px]">
                <label className="text-xs font-medium text-dark-green">To</label>
                <input
                  type="date"
                  className="rounded-xl border border-dark-green px-3 py-2 shadow-sm outline-none"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                />
              </div>
            </>
          )}

          {/* Reset */}
          <div className="min-w-[110px]">
            <button
              className="cursor-pointer w-full rounded-xl bg-dark-green px-3 py-2 font-semibold text-white shadow-md transition-all hover:scale-[1.02] active:scale-95"
              onClick={() => {
                setQuery("");
                setCourtFilter("");
                setStatusFilter("");
                setFilterMode("day");
                setSpecificDay("");
                setDateFrom("");
                setDateTo("");
              }}
            >
              Reset
            </button>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-dark-green-octa bg-white p-4 shadow-md">
        {loading && <div className="py-10 text-center text-dark-green">Loading reservations…</div>}
        {error && <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">{String(error)}</div>}
        {!loading && !error && (
          <>
            <div className="mb-3 flex items-center justify-between">
              <div className="text-sm text-gray-600">
                Showing <strong>{pageRows.length}</strong> of <strong>{filtered.length}</strong> reservations
              </div>
              <div className="flex items-center gap-2 text-sm">
                <SortHeader label="Date" active={sortKey === "reservedAt"} dir={sortDir} onClick={() => toggleSort("reservedAt")} />
                <SortHeader label="Created" active={sortKey === "createdAt"} dir={sortDir} onClick={() => toggleSort("createdAt")} />
                <SortHeader label="Court" active={sortKey === "courtId"} dir={sortDir} onClick={() => toggleSort("courtId")} />
                <SortHeader label="Hours" active={sortKey === "hours"} dir={sortDir} onClick={() => toggleSort("hours")} />
                <SortHeader label="Name" active={sortKey === "name"} dir={sortDir} onClick={() => toggleSort("name")} />
                <SortHeader label="Email" active={sortKey === "email"} dir={sortDir} onClick={() => toggleSort("email")} />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead>
                  <tr className="border-b bg-gray-50 text-dark-green">
                    <Th>#</Th>
                    <Th>Date</Th>
                    <Th>Start</Th>
                    <Th>End</Th>
                    <Th>Hours</Th>
                    <Th>Court</Th>
                    <Th>Status</Th>
                    <Th>User</Th>
                    <Th>Email</Th>
                    <Th>Created</Th>
                    <Th>Actions</Th>
                  </tr>
                </thead>
                <tbody>
                  {pageRows.map((r, i) => {
                    const endMs = Number(r.reservedAt || 0) + Number(r.hours || 0) * 60 * 60 * 1000;
                    const status = getReservationStatus(r.reservedAt, r.hours);
                    return (
                      <tr key={r.id} className="border-b last:border-0 hover:bg-gray-50">
                        <Td>{(page - 1) * pageSize + i + 1}</Td>
                        <Td>{fmtDate(r.reservedAt)}</Td>
                        <Td>{fmtTime(r.reservedAt)}</Td>
                        <Td>{fmtTime(endMs)}</Td>
                        <Td>{r.hours}</Td>
                        <Td>#{r.courtId ?? "—"}</Td>
                        <Td>
                          <span className={`${statusBadgeClass(status)} text-white px-3 py-1 rounded-full text-xs font-semibold`}>
                            {statusLabel(status)}
                          </span>
                        </Td>
                        <Td>{[r.user?.firstName, r.user?.lastName].filter(Boolean).join(" ") || `User ${r.userId ?? "—"}`}</Td>
                        <Td className="text-gray-700">{r.user?.email || "—"}</Td>
                        <Td className="text-gray-700">{fmtDateTime(r.createdAt)}</Td>
                        <Td>
                          <div className="flex items-center gap-2">
                            <button
                              className="cursor-pointer rounded-lg border border-red-200 px-3 py-1 text-xs font-medium text-red-700 transition-all hover:bg-red-600 hover:text-white"
                              onClick={() => askDelete(r.id)}
                            >
                              Delete
                            </button>
                            <button
                              className="cursor-pointer rounded-lg border border-dark-green-octa px-3 py-1 text-xs font-medium text-dark-green transition-all hover:bg-dark-green hover:text-white disabled:opacity-50"
                              disabled
                              title="Send email to user — coming soon"
                            >
                              Email User
                            </button>
                          </div>
                        </Td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="mt-4 flex items-center justify-between">
              <div className="text-sm text-gray-600">Page {page} / {totalPages}</div>
              <div className="flex items-center gap-2">
                <button className="cursor-pointer rounded-xl border border-dark-green-octa px-3 py-1.5 text-sm font-medium text-dark-green transition-all hover:bg-dark-green hover:text-white disabled:opacity-50" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>Previous</button>
                <button className="cursor-pointer rounded-xl border border-dark-green-octa px-3 py-1.5 text-sm font-medium text-dark-green transition-all hover:bg-dark-green hover:text-white disabled:opacity-50" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}>Next</button>
              </div>
            </div>
          </>
        )}
      </div>

      {confirmOpen && (
        <ConfirmResponsePopup
          type="confirm"
          title="Delete Reservation"
          description="Are you sure you want to delete this reservation? This action cannot be undone."
          confirmText="Delete"
          cancelText="Cancel"
          onConfirm={handleConfirmDelete}
          onCancel={() => setConfirmOpen(false)}
        />
      )}

      {successOpen && (
        <ConfirmResponsePopup
          title="Deleted"
          description="The reservation has been successfully deleted."
          onCancel={() => setSuccessOpen(false)}
        />
      )}
    </div>
  );
}

function SortHeader({ label, active, dir, onClick }) {
  return (
    <button onClick={onClick} className={`cursor-pointer rounded-lg px-2 py-1 font-medium transition-all ${active ? "bg-dark-green text-white" : "text-dark-green hover:bg-dark-green/10"}`}>
      {label}
      {active && <span className="ml-1 text-xs opacity-90">{dir === "asc" ? "▲" : "▼"}</span>}
    </button>
  );
}

function Th({ children }) {
  return <th className="whitespace-nowrap px-3 py-2 text-xs font-semibold uppercase tracking-wide">{children}</th>;
}

function Td({ children }) {
  return <td className="whitespace-nowrap px-3 py-3 text-sm">{children}</td>;
}
