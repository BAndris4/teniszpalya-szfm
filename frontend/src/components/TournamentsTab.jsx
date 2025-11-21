import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCurrentUser } from "../hooks/useCurrentUser";
import { fmtDateTime } from "../utils/dates";
import ConfirmResponsePopup from "../components/ConfirmResponsePopup";
import TournamentBracket from "../components/TournamentBracket";
import AdminBracketEmbedded from "../components/AdminBracketEmbedded";

const API_BASE = "http://localhost:5044/api/tournaments";

export default function TournamentsTab() {
  const navigate = useNavigate();
  const { authenticated, user: me } = useCurrentUser();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const [tournaments, setTournaments] = useState([]);

  const [creating, setCreating] = useState(false);
  const emptyForm = {
    title: "",
    description: "",
    startDate: "",
    location: "",
    maxParticipants: 16,
    fee: 0,
  };
  const [form, setForm] = useState(emptyForm);

  const [successText, setSuccessText] = useState("");
  const [successOpen, setSuccessOpen] = useState(false);

  // --- editing ---
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState(emptyForm);
  const [editSaving, setEditSaving] = useState(false);
  const [deleteBusyId, setDeleteBusyId] = useState(null);
  
  // --- start tournament ---
  const [startingId, setStartingId] = useState(null);
  
  // --- bracket view ---
  const [viewBracketId, setViewBracketId] = useState(null);

  // --- popup (confirm / success) ---
  const [popupConfig, setPopupConfig] = useState(null);

  // --- participants accordion ---
  const [expandedId, setExpandedId] = useState(null);
  const [participantsByTournament, setParticipantsByTournament] = useState({});
  // shape: { [tournamentId]: { loading, error, items: [] } }

  // --- auth guard ---
  useEffect(() => {
    if (authenticated === false) navigate("/login");
  }, [authenticated, navigate]);

  useEffect(() => {
    if (!me) return;
    if (me.roleID !== 2) navigate("/");
  }, [me, navigate]);

  // --- load tournaments ---
  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(API_BASE, { credentials: "include" });
        if (!res.ok) throw new Error(`Tournaments error ${res.status}`);
        const data = await res.json();
        if (!cancelled) setTournaments(Array.isArray(data) ? data : []);
      } catch (e) {
        if (!cancelled) setError(e?.message || "Unknown error");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const sortedTournaments = useMemo(() => {
    return [...tournaments].sort((a, b) => {
      const aDate = a.startDate ? new Date(a.startDate).getTime() : 0;
      const bDate = b.startDate ? new Date(b.startDate).getTime() : 0;
      return aDate - bDate;
    });
  }, [tournaments]);

  function scrollToTopbar() {
    const el =
      document.getElementById("AdminTopbar") ||
      document.getElementById("admin-topbar");
    if (el?.scrollIntoView) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }

  function toggleCreate() {
    setCreating((c) => !c);
    setError(null);
    setSuccessOpen(false);
    if (!creating) {
      setForm(emptyForm);
      scrollToTopbar();
    }
  }

  function startEdit(t) {
    setEditingId(t.id);
    setError(null);
    setSuccessOpen(false);
    setEditForm({
      title: t.title || "",
      description: t.description || "",
      startDate: t.startDate ? t.startDate.substring(0, 16) : "",
      location: t.location || "",
      maxParticipants: t.maxParticipants ?? 16,
      fee: t.fee ?? 0,
    });
    scrollToTopbar();
  }

  function cancelEdit() {
    setEditingId(null);
    setEditForm(emptyForm);
  }

  async function handleCreate(e) {
    e.preventDefault();
    try {
      setSaving(true);
      setError(null);
      const payload = {
        title: form.title,
        description: form.description,
        startDate: form.startDate,
        location: form.location,
        maxParticipants: parseInt(form.maxParticipants) || 0,
        fee: form.fee ? parseFloat(form.fee) : null,
      };
      const res = await fetch(API_BASE, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        let msg = `Create failed (${res.status})`;
        try {
          const data = await res.json();
          if (data?.message) msg = data.message;
        } catch (_) {
          // ignore
        }
        throw new Error(msg);
      }
      const created = await res.json();
      setTournaments((prev) => [...prev, created]);
      setForm(emptyForm);
      setSuccessText("The tournament has been successfully created.");
      setSuccessOpen(true);
    } catch (e) {
      setError(e?.message || "Create failed");
    } finally {
      setSaving(false);
    }
  }

  async function handleUpdate(e) {
    e.preventDefault();
    if (!editingId) return;

    try {
      setEditSaving(true);
      setError(null);
      const payload = {
        title: editForm.title,
        description: editForm.description,
        startDate: editForm.startDate,
        location: editForm.location,
        maxParticipants: parseInt(editForm.maxParticipants) || 0,
        fee: editForm.fee ? parseFloat(editForm.fee) : null,
      };

      const res = await fetch(`${API_BASE}/${editingId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      let data = null;
      try {
        data = await res.json();
      } catch (_) {
        // lehet, hogy nincs body
      }

      if (!res.ok) {
        const msg = data?.message || `Update failed (${res.status})`;
        throw new Error(msg);
      }

      // lokális patch, nem írjuk felül az egész objektumot
      setTournaments((prev) =>
        prev.map((t) =>
          t.id === editingId
            ? {
                ...t,
                ...payload,
              }
            : t
        )
      );

      const msg =
        data?.message || "The tournament has been successfully updated.";
      setSuccessText(msg);
      setSuccessOpen(true);

      setPopupConfig({
        type: "success",
        title: "Tournament updated",
        description: msg,
      });

      setEditingId(null);
      setEditForm(emptyForm);
    } catch (e) {
      setError(e?.message || "Update failed");
    } finally {
      setEditSaving(false);
    }
  }

  // résztvevők betöltése adott tournamenthez
  async function loadParticipants(tournamentId) {
    setParticipantsByTournament((prev) => ({
      ...prev,
      [tournamentId]: {
        ...(prev[tournamentId] || {}),
        loading: true,
        error: null,
      },
    }));

    try {
      const res = await fetch(
        `${API_BASE}/${tournamentId}/participants`,
        { credentials: "include" }
      );
      if (!res.ok) {
        throw new Error(`Participants error ${res.status}`);
      }
      const data = await res.json();
      setParticipantsByTournament((prev) => ({
        ...prev,
        [tournamentId]: {
          loading: false,
          error: null,
          items: Array.isArray(data) ? data : [],
        },
      }));
    } catch (e) {
      setParticipantsByTournament((prev) => ({
        ...prev,
        [tournamentId]: {
          loading: false,
          error: e?.message || "Failed to load participants",
          items: [],
        },
      }));
    }
  }

  // sor kattintása -> expand/collapse + participants load
  function handleRowClick(t) {
    if (expandedId === t.id) {
      setExpandedId(null);
      return;
    }
    setExpandedId(t.id);
    const info = participantsByTournament[t.id];
    if (!info || (!info.items && !info.loading && !info.error)) {
      loadParticipants(t.id);
    }
  }

  // tényleges törlés (megerősítés után hívjuk)
  async function actuallyDelete(t) {
    try {
      setDeleteBusyId(t.id);
      setError(null);
      setSuccessOpen(false);

      const res = await fetch(`${API_BASE}/${t.id}`, {
        method: "DELETE",
        credentials: "include",
      });

      let data = null;
      try {
        data = await res.json();
      } catch (_) {
        // ignore
      }

      if (!res.ok) {
        const msg = data?.message || `Delete failed (${res.status})`;
        throw new Error(msg);
      }

      setTournaments((prev) => prev.filter((x) => x.id !== t.id));

      const msg = "The tournament has been deleted.";
      setSuccessText(msg);
      setSuccessOpen(true);

      if (editingId === t.id) {
        setEditingId(null);
        setEditForm(emptyForm);
      }
      if (expandedId === t.id) {
        setExpandedId(null);
      }

      setPopupConfig({
        type: "success",
        title: "Tournament deleted",
        description: msg,
      });
    } catch (e) {
      setError(e?.message || "Delete failed");
    } finally {
      setDeleteBusyId(null);
    }
  }

  // Start Tournament
  async function handleStartTournament(t) {
    if (t.currentParticipants < 2) {
      setPopupConfig({
        type: "success",
        title: "Cannot start",
        description: "At least 2 participants are required to start the tournament.",
        confirmText: "OK",
      });
      return;
    }

    setPopupConfig({
      type: "confirm",
      title: "Start Tournament",
      description: `Start "${t.title || "this tournament"}"? This will generate the bracket and lock registrations.`,
      confirmText: "Start",
      cancelText: "Cancel",
      onConfirm: () => actuallyStartTournament(t),
    });
  }

  async function actuallyStartTournament(t) {
    setStartingId(t.id);
    try {
      const res = await fetch(`${API_BASE}/${t.id}/start`, {
        method: "POST",
        credentials: "include",
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || `Start failed ${res.status}`);
      }
      
      // Reload tournaments
      const listRes = await fetch(API_BASE, { credentials: "include" });
      if (listRes.ok) {
        const data = await listRes.json();
        setTournaments(Array.isArray(data) ? data : []);
      }

      // Open bracket immediately for the started tournament
      setViewBracketId(t.id);
    } catch (e) {
      setPopupConfig({
        type: "success",
        title: "Error",
        description: e?.message || "Failed to start tournament",
        confirmText: "OK",
      });
    } finally {
      setStartingId(null);
    }
  }

  // törlés gomb -> Confirm popup
  function openDeleteConfirm(t) {
    setPopupConfig({
      type: "confirm",
      title: "Delete tournament",
      description: `Are you sure you want to delete "${
        t.title || "this tournament"
      }"?`,
      confirmText: "Delete",
      cancelText: "Cancel",
      onConfirm: () => actuallyDelete(t),
    });
  }

  return (
    <div>
      {/* Toolbar */}
      <div
        className="mb-6 flex items-center justify-between"
        id="AdminTopbar"
      >
        <h2 className="text-xl font-semibold text-dark-green">
          Tournaments
        </h2>
        <button
          className="cursor-pointer rounded-xl bg-dark-green px-4 py-2 font-semibold text-white shadow-md transition-all hover:scale-[1.02] active:scale-95"
          onClick={toggleCreate}
        >
          {creating ? "Close Form" : "Add New Tournament"}
        </button>
      </div>

      {/* Create Panel */}
      {creating && (
        <div className="mb-6 rounded-2xl border border-dark-green-octa bg-white p-5 shadow-md">
          <div className="mb-4 flex items-center justify-between">
            <div className="text-lg font-semibold text-dark-green">
              Create Tournament
            </div>
          </div>

          <form
            className="grid grid-cols-1 gap-5 lg:grid-cols-2"
            onSubmit={handleCreate}
          >
            <div className="flex flex-col gap-2">
              <label className="text-xs font-medium text-dark-green">
                Tournament Name *
              </label>
              <input
                required
                value={form.title}
                onChange={(e) =>
                  setForm((f) => ({ ...f, title: e.target.value }))
                }
                placeholder="e.g. Summer Tennis Cup"
                className="w-full rounded-xl border-2 border-dark-green-octa px-3 py-2 outline-none focus:ring-2 focus:ring-dark-green/30"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-xs font-medium text-dark-green">
                Date &amp; Time *
              </label>
              <input
                required
                type="datetime-local"
                value={form.startDate}
                onChange={(e) =>
                  setForm((f) => ({ ...f, startDate: e.target.value }))
                }
                className="w-full rounded-xl border-2 border-dark-green-octa px-3 py-2 outline-none focus:ring-2 focus:ring-dark-green/30"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-xs font-medium text-dark-green">
                Location
              </label>
              <input
                value={form.location}
                onChange={(e) =>
                  setForm((f) => ({ ...f, location: e.target.value }))
                }
                placeholder="e.g. Budapest, Margaret Island"
                className="w-full rounded-xl border-2 border-dark-green-octa px-3 py-2 outline-none focus:ring-2 focus:ring-dark-green/30"
              />
            </div>

            <div className="flex flex-col gap-2 lg:row-span-2">
              <label className="text-xs font-medium text-dark-green">
                Description
              </label>
              <textarea
                value={form.description}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    description: e.target.value,
                  }))
                }
                placeholder="Provide tournament details..."
                rows={4}
                className="w-full rounded-xl border-2 border-dark-green-octa px-3 py-2 outline-none focus:ring-2 focus:ring-dark-green/30 resize-none"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-xs font-medium text-dark-green">
                Max Participants *
              </label>
              <select
                required
                value={form.maxParticipants}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    maxParticipants: parseInt(e.target.value),
                  }))
                }
                className="w-full rounded-xl border border-dark-green-octa px-3 py-2 outline-none focus:ring-2 focus:ring-dark-green/30 bg-white appearance-none cursor-pointer"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3E%3Cpath stroke='%23164e3f' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3E%3C/svg%3E")`,
                  backgroundPosition: 'right 0.5rem center',
                  backgroundRepeat: 'no-repeat',
                  backgroundSize: '1.5rem 1.5rem',
                  paddingRight: '2.5rem'
                }}
              >
                <option value={2}>2</option>
                <option value={4}>4</option>
                <option value={8}>8</option>
                <option value={16}>16</option>
              </select>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-xs font-medium text-dark-green">
                Entry Fee (HUF)
              </label>
              <input
                type="number"
                min="0"
                value={form.fee}
                onChange={(e) =>
                  setForm((f) => ({ ...f, fee: e.target.value }))
                }
                className="w-full rounded-xl border-2 border-dark-green-octa px-3 py-2 outline-none focus:ring-2 focus:ring-dark-green/30"
              />
            </div>

            <div className="flex items-end justify-end gap-2 lg:col-span-2">
              <button
                type="submit"
                className="rounded-xl bg-dark-green px-4 py-2 font-semibold text-white disabled:opacity-50 cursor-pointer"
                disabled={saving}
              >
                {saving ? "Saving..." : "Create"}
              </button>
              <button
                type="button"
                className="cursor-pointer rounded-xl border border-dark-green-octa px-4 py-2 font-semibold text-dark-green transition-all hover:bg-dark-green/10"
                onClick={toggleCreate}
                disabled={saving}
              >
                Cancel
              </button>
            </div>
          </form>

          {error && (
            <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              {String(error)}
            </div>
          )}
          {successOpen && (
            <div className="mt-4 rounded-xl border border-green-200 bg-green-50 p-3 text-sm text-green-800">
              {successText}
            </div>
          )}
        </div>
      )}

      {/* Edit Panel */}
      {editingId && (
        <div className="mb-6 rounded-2xl border border-dark-green-octa bg-white p-5 shadow-md">
          <div className="mb-4 flex items-center justify-between">
            <div className="text-lg font-semibold text-dark-green">
              Edit Tournament
            </div>
            <button
              className="cursor-pointer rounded-xl border border-dark-green-octa px-3 py-1 text-sm font-semibold text-dark-green hover:bg-dark-green/10"
              type="button"
              onClick={cancelEdit}
              disabled={editSaving}
            >
              Close
            </button>
          </div>

          <form
            className="grid grid-cols-1 gap-5 lg:grid-cols-2"
            onSubmit={handleUpdate}
          >
            <div className="flex flex-col gap-2">
              <label className="text-xs font-medium text-dark-green">
                Tournament Name *
              </label>
              <input
                required
                value={editForm.title}
                onChange={(e) =>
                  setEditForm((f) => ({ ...f, title: e.target.value }))
                }
                className="w-full rounded-xl border-2 border-dark-green-octa px-3 py-2 outline-none focus:ring-2 focus:ring-dark-green/30"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-xs font-medium text-dark-green">
                Date &amp; Time *
              </label>
              <input
                required
                type="datetime-local"
                value={editForm.startDate}
                onChange={(e) =>
                  setEditForm((f) => ({
                    ...f,
                    startDate: e.target.value,
                  }))
                }
                className="w-full rounded-xl border-2 border-dark-green-octa px-3 py-2 outline-none focus:ring-2 focus:ring-dark-green/30"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-xs font-medium text-dark-green">
                Location
              </label>
              <input
                value={editForm.location}
                onChange={(e) =>
                  setEditForm((f) => ({
                    ...f,
                    location: e.target.value,
                  }))
                }
                className="w-full rounded-xl border-2 border-dark-green-octa px-3 py-2 outline-none focus:ring-2 focus:ring-dark-green/30"
              />
            </div>

            <div className="flex flex-col gap-2 lg:row-span-2">
              <label className="text-xs font-medium text-dark-green">
                Description
              </label>
              <textarea
                value={editForm.description}
                onChange={(e) =>
                  setEditForm((f) => ({
                    ...f,
                    description: e.target.value,
                  }))
                }
                rows={4}
                className="w-full rounded-xl border-2 border-dark-green-octa px-3 py-2 outline-none focus:ring-2 focus:ring-dark-green/30 resize-none"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-xs font-medium text-dark-green">
                Max Participants *
              </label>
              <select
                required
                value={editForm.maxParticipants}
                onChange={(e) =>
                  setEditForm((f) => ({
                    ...f,
                    maxParticipants: parseInt(e.target.value),
                  }))
                }
                className="w-full rounded-xl border border-dark-green-octa px-3 py-2 outline-none focus:ring-2 focus:ring-dark-green/30 bg-white appearance-none cursor-pointer"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3E%3Cpath stroke='%23164e3f' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3E%3C/svg%3E")`,
                  backgroundPosition: 'right 0.5rem center',
                  backgroundRepeat: 'no-repeat',
                  backgroundSize: '1.5rem 1.5rem',
                  paddingRight: '2.5rem'
                }}
              >
                <option value={2}>2</option>
                <option value={4}>4</option>
                <option value={8}>8</option>
                <option value={16}>16</option>
              </select>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-xs font-medium text-dark-green">
                Entry Fee (HUF)
              </label>
              <input
                type="number"
                min="0"
                value={editForm.fee}
                onChange={(e) =>
                  setEditForm((f) => ({ ...f, fee: e.target.value }))
                }
                className="w-full rounded-xl border-2 border-dark-green-octa px-3 py-2 outline-none focus:ring-2 focus:ring-dark-green/30"
              />
            </div>

            <div className="flex items-end justify-end gap-2 lg:col-span-2">
              <button
                type="submit"
                className="rounded-xl bg-dark-green px-4 py-2 font-semibold text-white disabled:opacity-50 cursor-pointer"
                disabled={editSaving}
              >
                {editSaving ? "Saving..." : "Save changes"}
              </button>
              <button
                type="button"
                className="cursor-pointer rounded-xl border border-dark-green-octa px-4 py-2 font-semibold text-dark-green transition-all hover:bg-dark-green/10"
                onClick={cancelEdit}
                disabled={editSaving}
              >
                Cancel
              </button>
            </div>
          </form>

          {error && (
            <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              {String(error)}
            </div>
          )}
          {successOpen && (
            <div className="mt-4 rounded-xl border border-green-200 bg-green-50 p-3 text-sm text-green-800">
              {successText}
            </div>
          )}
        </div>
      )}

      {/* List */}
      <div className="rounded-2xl border border-dark-green-octa bg-white p-4 shadow-md">
        {loading && (
          <div className="py-10 text-center text-dark-green">
            Loading tournaments…
          </div>
        )}
        {error && !creating && !editingId && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
            {String(error)}
          </div>
        )}
        {!loading && !error && (
          <>
            {sortedTournaments.length === 0 ? (
              <div className="py-10 text-center text-gray-600">
                No tournaments found. Click “Add New Tournament”.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full text-left text-sm">
                  <thead>
                    <tr className="border-b bg-gray-50 text-dark-green">
                      <Th>#</Th>
                      <Th>Name</Th>
                      <Th>Start</Th>
                      <Th>Location</Th>
                      <Th>Participants</Th>
                      <Th>Fee</Th>
                      <Th>Actions</Th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedTournaments.map((t, idx) => {
                      const current = t.currentParticipants ?? 0;
                      const max = t.maxParticipants ?? "-";
                      const participantsInfo =
                        participantsByTournament[t.id] || {};
                      const isExpanded = expandedId === t.id;

                      return (
                        <>
                          <tr
                            key={t.id}
                            className={`border-b last:border-0 hover:bg-gray-50 cursor-pointer ${
                              isExpanded ? "bg-gray-50" : ""
                            }`}
                            onClick={() => handleRowClick(t)}
                          >
                            <Td>{idx + 1}</Td>
                            <Td>
                              <div className="flex items-center gap-2">
                                <span>{t.title || `Tournament ${t.id}`}</span>
                                {typeof t.status === "number" && (
                                  <span
                                    className={
                                      "rounded-full px-2 py-0.5 text-[10px] font-semibold " +
                                      (t.status === 0
                                        ? "bg-yellow-100 text-yellow-700"
                                        : t.status === 1
                                        ? "bg-blue-100 text-blue-700"
                                        : "bg-green-100 text-green-700")
                                    }
                                  >
                                    {t.status === 0
                                      ? "Upcoming"
                                      : t.status === 1
                                      ? "In Progress"
                                      : "Completed"}
                                  </span>
                                )}
                              </div>
                            </Td>
                            <Td>
                              {t.startDate
                                ? fmtDateTime(
                                    new Date(t.startDate).getTime()
                                  )
                                : "—"}
                            </Td>
                            <Td>{t.location || "—"}</Td>
                            <Td>
                              {current}/{max}
                            </Td>
                            <Td>
                              {t.fee > 0 ? `${t.fee} Ft` : "Free"}
                            </Td>
                            <Td>
                              <div className="flex gap-2">
                                {/* View Bracket - csak InProgress vagy Completed */}
                                {(t.status === 1 || t.status === 2) && (
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setViewBracketId(t.id);
                                    }}
                                    className="cursor-pointer rounded-lg border border-blue-600 px-3 py-1 text-xs font-semibold text-blue-700 hover:bg-blue-50"
                                  >
                                    View Bracket
                                  </button>
                                )}
                                {/* Start button - csak Upcoming és >= 2 participant */}
                                {t.status === 0 && current >= 2 && (
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleStartTournament(t);
                                    }}
                                    className="cursor-pointer rounded-lg border border-green-600 px-3 py-1 text-xs font-semibold text-green-700 hover:bg-green-50 disabled:opacity-50"
                                    disabled={
                                      startingId === t.id ||
                                      deleteBusyId === t.id
                                    }
                                  >
                                    {startingId === t.id
                                      ? "Starting..."
                                      : "Start"}
                                  </button>
                                )}
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    startEdit(t);
                                  }}
                                  className="cursor-pointer rounded-lg border border-dark-green-octa px-3 py-1 text-xs font-semibold text-dark-green hover:bg-dark-green/10 disabled:opacity-50"
                                  disabled={deleteBusyId === t.id}
                                >
                                  Edit
                                </button>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    openDeleteConfirm(t);
                                  }}
                                  className="cursor-pointer rounded-lg border border-red-200 px-3 py-1 text-xs font-semibold text-red-700 hover:bg-red-50 disabled:opacity-50"
                                  disabled={deleteBusyId === t.id}
                                >
                                  {deleteBusyId === t.id
                                    ? "Deleting..."
                                    : "Delete"}
                                </button>
                              </div>
                            </Td>
                          </tr>

                          {/* Participants sub-row */}
                          {isExpanded && (
                            <tr>
                              <td
                                colSpan={7}
                                className="bg-gray-50 border-b last:border-0 px-4 py-3"
                              >
                                <div className="rounded-xl border border-dark-green-octa/40 bg-white p-3">
                                  <div className="mb-2 flex items-center justify-between">
                                    <div className="text-xs font-semibold uppercase tracking-wide text-dark-green">
                                      Registered participants
                                    </div>
                                    <div className="text-xs text-dark-green/60">
                                      {participantsInfo.items
                                        ? `${participantsInfo.items.length} user(s)`
                                        : ""}
                                    </div>
                                  </div>

                                  {participantsInfo.loading && (
                                    <div className="py-4 text-sm text-dark-green/80">
                                      Loading participants…
                                    </div>
                                  )}

                                  {participantsInfo.error && !participantsInfo.loading && (
                                    <div className="py-4 text-sm text-red-700">
                                      {participantsInfo.error}
                                    </div>
                                  )}

                                  {!participantsInfo.loading &&
                                    !participantsInfo.error &&
                                    (!participantsInfo.items ||
                                      participantsInfo.items.length === 0) && (
                                      <div className="py-4 text-sm text-gray-600">
                                        No participants yet.
                                      </div>
                                    )}

                                  {!participantsInfo.loading &&
                                    !participantsInfo.error &&
                                    participantsInfo.items &&
                                    participantsInfo.items.length > 0 && (
                                      <div className="overflow-x-auto">
                                        <table className="min-w-[400px] text-xs">
                                          <thead>
                                            <tr className="border-b bg-gray-50 text-dark-green">
                                              <th className="px-2 py-1 text-left font-semibold">
                                                ID
                                              </th>  
                                              <th className="px-2 py-1 text-left font-semibold">
                                                Name
                                              </th>
                                              <th className="px-2 py-1 text-left font-semibold">
                                                Email
                                              </th>
                                              <th className="px-2 py-1 text-left font-semibold">
                                                Registered at
                                              </th>
                                            </tr>
                                          </thead>
                                          <tbody>
                                            {participantsInfo.items.map(
                                              (p) => (
                                                <tr
                                                  key={p.id}
                                                  className="border-b last:border-0"
                                                >
                                                  <td className="px-2 py-1">
                                                    {p.id}
                                                  </td>
                                                  <td className="px-2 py-1">
                                                    {p.firstName}{" "}
                                                    {p.lastName}
                                                  </td>
                                                  <td className="px-2 py-1">
                                                    {p.email}
                                                  </td>
                                                  <td className="px-2 py-1">
                                                    {p.registeredAt
                                                      ? fmtDateTime(
                                                          p.registeredAt *
                                                            1000
                                                        )
                                                      : "—"}
                                                  </td>
                                                </tr>
                                              )
                                            )}
                                          </tbody>
                                        </table>
                                      </div>
                                    )}
                                </div>
                              </td>
                            </tr>
                          )}
                        </>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </div>

      {/* Confirm / Success Popup */}
      {popupConfig && (
        <ConfirmResponsePopup
          title={popupConfig.title}
          description={popupConfig.description}
          type={popupConfig.type}
          confirmText={popupConfig.confirmText}
          cancelText={popupConfig.cancelText}
          autoCloseMs={popupConfig.autoCloseMs ?? 2500}
          showCalendarButton={false}
          reservationId={null}
          onConfirm={
            popupConfig.type === "confirm"
              ? async () => {
                  try {
                    await popupConfig.onConfirm?.();
                  } finally {
                    setPopupConfig(null);
                  }
                }
              : undefined
          }
          onCancel={() => {
            popupConfig.onCancel?.();
            setPopupConfig(null);
          }}
        />
      )}
      
      {/* Embedded Bracket (replaces old modal) */}
      {viewBracketId && (
        <AdminBracketEmbedded
          tournamentId={viewBracketId}
          onClose={() => setViewBracketId(null)}
        />
      )}
    </div>
  );
}

function Th({ children }) {
  return (
    <th className="whitespace-nowrap px-3 py-2 text-xs font-semibold uppercase tracking-wide">
      {children}
    </th>
  );
}

function Td({ children }) {
  return (
    <td className="whitespace-nowrap px-3 py-3 text-sm">{children}</td>
  );
}
