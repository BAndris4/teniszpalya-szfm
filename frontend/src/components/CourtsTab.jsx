import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCurrentUser } from "../hooks/useCurrentUser";
import ConfirmResponsePopup from "./ConfirmResponsePopup";

const MATERIALS = ["Clay", "Grass", "Hard"];

export default function CourtsTab() {
  const navigate = useNavigate();
  const { authenticated, user: me } = useCurrentUser();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [courts, setCourts] = useState([]);

  const emptyForm = { id: null, outdoors: true, material: "Clay" };
  const [editing, setEditing] = useState(null); // court object being edited
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState(emptyForm);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState(null);
  const [successOpen, setSuccessOpen] = useState(false);

  useEffect(() => {
    if (authenticated === false) navigate("/login");
  }, [authenticated, navigate]);
  useEffect(() => {
    if (!me) return;
    if (me.firstName !== "admin") navigate("/");
  }, [me, navigate]);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("http://localhost:5044/api/Courts", {
          credentials: "include",
        });
        if (!res.ok) throw new Error(`Courts error ${res.status}`);
        const data = await res.json();
        if (!cancelled) setCourts(Array.isArray(data) ? data : []);
      } catch (e) {
        if (!cancelled) setError(e?.message || "Unknown error");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, []);

  const sortedCourts = useMemo(() => {
    return [...courts].sort((a, b) => Number(a.id) - Number(b.id));
  }, [courts]);

  function scrollToAdminTopbar() {
    const el = document.getElementById("AdminTopbar") || document.getElementById("admin-topbar");
    if (el?.scrollIntoView) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }

  // Helpers
  function startCreate() {
    setCreating(true);
    setEditing(null);
    setForm(emptyForm);
    scrollToAdminTopbar();
  }
  function startEdit(court) {
    setEditing(court);
    setCreating(false);
    setForm({ id: court.id, outdoors: !!court.outdoors, material: court.material || "Clay" });
    scrollToAdminTopbar();
  }
  function cancelEditOrCreate() {
    setEditing(null);
    setCreating(false);
    setForm(emptyForm);
  }

  async function submitCreate() { /* intentionally disabled - no endpoint yet */ }
  async function submitUpdate() { /* intentionally disabled - no endpoint yet */ }

  function askDelete(id) {
    setPendingDeleteId(id);
    setConfirmOpen(true);
  }
  async function handleConfirmDelete() {
    const id = pendingDeleteId;
    setConfirmOpen(false);
    if (!id) return;
    const res = await fetch(`http://localhost:5044/api/Courts/${id}`, {
      method: "DELETE",
      credentials: "include",
    });
    if (!res.ok) {
      setTimeout(() => alert(`Delete failed (${res.status})`), 0);
      return;
    }
    setCourts((prev) => prev.filter((c) => c.id !== id));
    setPendingDeleteId(null);
    setSuccessOpen(true);
  }

  return (
    <div>
      {/* Toolbar */}
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-xl font-semibold text-dark-green">Courts</h2>
        <button
          className="cursor-pointer rounded-xl bg-dark-green px-4 py-2 font-semibold text-white shadow-md transition-all hover:scale-[1.02] active:scale-95"
          onClick={startCreate}
        >
          Add New Court
        </button>
      </div>

      {/* Create / Edit Panel */}
      {(creating || editing) && (
        <div className="mb-6 rounded-2xl border border-dark-green-octa bg-white p-5 shadow-md">
          <div className="mb-4 flex items-center justify-between">
            <div className="text-lg font-semibold text-dark-green">
              {creating ? "Create Court" : `Edit Court #${editing?.id}`}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
            {/* Outdoors toggle */}
            <div className="flex flex-col">
              <label className="text-xs font-medium text-dark-green">Outdoors</label>
              <Toggle
                className="mt-2"
                checked={!!form.outdoors}
                onChange={(v) => setForm((f) => ({ ...f, outdoors: v }))}
                onLabel="Yes"
                offLabel="No"
              />
            </div>

            {/* Material pill selector */}
            <div className="flex flex-col">
              <label className="text-xs font-medium text-dark-green">Material</label>
              <div className="mt-2 flex flex-wrap gap-2">
                {MATERIALS.map((m) => {
                  const active = form.material === m;
                  return (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setForm((f) => ({ ...f, material: m }))}
                      className={`cursor-pointer rounded-full px-4 py-2 text-sm transition-all ${
                        active
                          ? "bg-dark-green text-white shadow"
                          : "border border-dark-green-octa text-dark-green hover:bg-dark-green/10"
                      }`}
                    >
                      {m}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Actions (disabled) */}
            <div className="flex items-end justify-end gap-2">
              {creating ? (
                <>
                  <button
                    className="cursor-not-allowed rounded-xl bg-dark-green px-4 py-2 font-semibold text-white opacity-50"
                    onClick={submitCreate}
                    disabled
                    title="No endpoint yet"
                  >
                    Create
                  </button>
                  <button
                    className="cursor-pointer rounded-xl border border-dark-green-octa px-4 py-2 font-semibold text-dark-green transition-all hover:bg-dark-green/10"
                    onClick={cancelEditOrCreate}
                  >
                    Cancel
                  </button>
                </>
              ) : (
                <>
                  <button
                    className="cursor-not-allowed rounded-xl bg-dark-green px-4 py-2 font-semibold text-white opacity-50"
                    onClick={submitUpdate}
                    disabled
                    title="No endpoint yet"
                  >
                    Save
                  </button>
                  <button
                    className="cursor-pointer rounded-xl border border-dark-green-octa px-4 py-2 font-semibold text-dark-green transition-all hover:bg-dark-green/10"
                    onClick={cancelEditOrCreate}
                  >
                    Cancel
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* List */}
      <div className="rounded-2xl border border-dark-green-octa bg-white p-4 shadow-md">
        {loading && <div className="py-10 text-center text-dark-green">Loading courts…</div>}
        {error && <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">{String(error)}</div>}
        {!loading && !error && (
          <>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
              {sortedCourts.map((c) => {
                return (
                  <div key={c.id} className="overflow-hidden rounded-2xl border border-dark-green-octa shadow-sm bg-white">
                    {/* Sima zöld background placeholder */}
                    <div className="relative h-32 w-full bg-green" />

                    <div className="p-4">
                      <div className="mb-1 text-lg font-semibold text-dark-green">Court #{c.id}</div>
                      <div className="text-sm text-gray-700">
                        <span className="font-medium">Outdoors:</span> {c.outdoors ? "Yes" : "No"}
                      </div>
                      <div className="text-sm text-gray-700">
                        <span className="font-medium">Material:</span> {c.material}
                      </div>
                      <div className="mt-3 flex items-center gap-2">
                        <button
                          className="cursor-pointer rounded-lg border border-dark-green-octa px-3 py-1.5 text-xs font-medium text-dark-green transition-all hover:bg-dark-green hover:text-white"
                          onClick={() => startEdit(c)}
                        >
                          Edit
                        </button>
                        <button
                          className="cursor-not-allowed rounded-lg border border-red-200 px-3 py-1.5 text-xs font-medium text-red-700 opacity-50"
                          disabled
                          title="No endpoint yet"
                          onClick={(e) => e.preventDefault()}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {sortedCourts.length === 0 && (
              <div className="py-10 text-center text-gray-600">No courts found. Click “Add New Court”.</div>
            )}
          </>
        )}
      </div>

      {confirmOpen && (
        <ConfirmResponsePopup
          type="confirm"
          title="Delete Court"
          description="Are you sure you want to delete this court? This action cannot be undone."
          confirmText="Delete"
          cancelText="Cancel"
          onConfirm={handleConfirmDelete}
          onCancel={() => setConfirmOpen(false)}
        />
      )}

      {successOpen && (
        <ConfirmResponsePopup
          title="Deleted"
          description="The court has been successfully deleted."
          onCancel={() => setSuccessOpen(false)}
        />
      )}
    </div>
  );
}

function Toggle({ checked, onChange, onLabel = "On", offLabel = "Off", className = "" }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange?.(!checked)}
      className={`relative inline-flex h-8 w-16 items-center rounded-full transition-all cursor-pointer
        ${checked ? "bg-dark-green" : "bg-gray-200"} ${className}`}
    >
      <span
        className={`pointer-events-none absolute left-1 top-1 inline-flex h-6 w-6 transform items-center justify-center rounded-full bg-white shadow transition-all
          ${checked ? "translate-x-8" : "translate-x-0"}`}
      />
    </button>
  );
}
