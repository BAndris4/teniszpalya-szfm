import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import CourtCard from "../components/CourtCard";
import { useNavigate, useLocation } from "react-router-dom";
import { backgroundPositions } from "../backgroundPositions";

export default function CourtsPage() {
    const [courts, setCourts] = useState([]);
    const navigate = useNavigate();
    const location = useLocation();
    const [selectedId, setSelectedId] = useState(null);
    const [typeFilter, setTypeFilter] = useState('All');
    const [locationFilter, setLocationFilter] = useState('All');
    const [sortOption, setSortOption] = useState('default');

    const [materials, setMaterials] = useState([]);

    const { topBlob, bottomBlob } = backgroundPositions.Courts || backgroundPositions.Hero;

    useEffect(() => {
        fetch("http://localhost:5044/api/Courts")
            .then((r) => r.json())
            .then((data) => {
                setCourts(data);
                
                const uniqueMaterials = Array.from(new Set(data.map((c) => c.material).filter(Boolean)));
                setMaterials(uniqueMaterials);
                
            })
            .catch((e) => {
                console.error(e);
            });
    }, []);

    // read selected id from query param and scroll to it after courts load
    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const sel = params.get('selected');
        if (sel) setSelectedId(Number(sel));
    }, [location.search]);

    useEffect(() => {
        if (selectedId && courts.length > 0) {
            const el = document.getElementById(`court-${selectedId}`);
            if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }, [selectedId, courts]);

    return (
        <div className="min-h-screen py-12 px-6 bg-white">
            <motion.div
                className="w-[50vw] h-[50vw] bg-light-green rounded-full fixed blur-[200px] pointer-events-none z-0"
                animate={topBlob}
                transition={{ duration: 1.2, ease: "easeInOut" }}
            />
            <motion.div
                className="w-[50vw] h-[50vw] bg-light-green rounded-full fixed blur-[200px] pointer-events-none z-0"
                animate={bottomBlob}
                transition={{ duration: 1.2, ease: "easeInOut" }}
            />

            <div className="max-w-6xl mx-auto z-10">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-4xl font-bold text-dark-green">Available Courts</h1>
                        <p className="text-dark-green-half mt-2">Browse courts available for booking. Click a card to see details or reserve.</p>
                    </div>
                    <div>
                        <motion.button
                            onClick={() => navigate('/')}
                            whileHover={{ scale: 1.03 }}
                            whileTap={{ scale: 0.98 }}
                            className="px-5 py-2 border cursor-pointer border-gray-300 rounded-[10px] bg-white flex items-center gap-2 shadow-sm hover:shadow-md transition-colors duration-200"
                            aria-label="Back to home"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" className="stroke-dark-green">
                                <path d="M15 18l-6-6 6-6" stroke="#013237" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                            <span className="text-dark-green font-medium">Back to home</span>
                        </motion.button>
                    </div>
                </div>

                <div className="mb-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }} className="flex gap-3 items-center">
                        <label className="text-sm text-dark-green-half">Filter:</label>
                        <motion.select whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.99 }} value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className="px-3 py-2 border rounded">
                            <option value="All">All types</option>
                            {materials.map((m, i) => <option key={i} value={m}>{m}</option>)}
                        </motion.select>
                        <motion.select whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.99 }} value={locationFilter} onChange={(e) => setLocationFilter(e.target.value)} className="px-3 py-2 border rounded">
                            <option value="All">All locations</option>
                            <option value="Outdoor">Outdoor</option>
                            <option value="Indoor">Indoor</option>
                        </motion.select>
                    </motion.div>

                    <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, delay: 0.05 }} className="flex gap-3 items-center">
                        <label className="text-sm text-dark-green-half">Sort:</label>
                        <motion.select whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.99 }} value={sortOption} onChange={(e) => setSortOption(e.target.value)} className="px-3 py-2 border rounded">
                            <option value="default">Default</option>
                            <option value="type-asc">Type A→Z</option>
                            <option value="type-desc">Type Z→A</option>
                            <option value="location-asc">Location Indoor→Outdoor</option>
                            <option value="location-desc">Location Outdoor→Indoor</option>
                        </motion.select>
                    </motion.div>
                </div>

                {/* compute visible courts after filters/sort */}
                {(() => {
                    const filtered = courts.filter((c) => {
                        const typeOk = typeFilter === 'All' || (c.material && c.material.toLowerCase() === typeFilter.toLowerCase());
                        const loc = c.outdoors ? 'Outdoor' : 'Indoor';
                        const locOk = locationFilter === 'All' || loc === locationFilter;
                        return typeOk && locOk;
                    });

                    const sorted = [...filtered];
                    if (sortOption === 'type-asc') {
                        sorted.sort((a,b) => (a.material||'').localeCompare(b.material||'') );
                    } else if (sortOption === 'type-desc') {
                        sorted.sort((a,b) => (b.material||'').localeCompare(a.material||'') );
                    } else if (sortOption === 'location-asc') {
                        // Indoor first
                        sorted.sort((a,b) => (a.outdoors === b.outdoors ? 0 : (a.outdoors ? 1 : -1)));
                    } else if (sortOption === 'location-desc') {
                        // Outdoor first
                        sorted.sort((a,b) => (a.outdoors === b.outdoors ? 0 : (a.outdoors ? -1 : 1)));
                    }

                    if (sorted.length === 0) {
                        return <div className="text-center text-dark-green-half py-20">No courts match your filters.</div>;
                    }

                    return (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                            {sorted.map((c) => (
                                <CourtCard key={c.id ?? c.ID ?? c.Id} court={c} isSelected={selectedId === (c.id ?? c.ID ?? c.Id)} />
                            ))}
                        </div>
                    );
                })()}
            </div>
        </div>
    );
}
