import { useEffect, useState } from "react";
import { useCurrentUser } from "../hooks/useCurrentUser";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "../components/Navbar";
import { ReserveMenuProvider } from "../contexts/ReserveMenuContext";

// Floating animation for the "no tournaments" icon
const floatingAnimation = {
  y: [0, -10, 0],
  transition: {
    duration: 3,
    repeat: Infinity,
    ease: "easeInOut"
  }
};

function Tournaments() {
  const { user, authenticated } = useCurrentUser();
  const [tournaments, setTournaments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [message, setMessage] = useState(null);
  const [form, setForm] = useState({ 
    title: "", 
    description: "", 
    startDate: "", 
    location: "", 
    maxParticipants: 16, 
    fee: 0 
  });
  const navigate = useNavigate();

  const fetchTournaments = async () => {
    setLoading(true);
    try {
      const res = await fetch("http://localhost:5044/api/tournaments");
      const data = await res.json();
      setTournaments(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTournaments();
  }, []);

  const isTournamentFull = (t) => t.currentParticipants >= t.maxParticipants;

  const handleCreate = async (e) => {
    e.preventDefault();
    setCreating(true);
    setMessage(null);
    try {
      const payload = {
        title: form.title,
        description: form.description,
        startDate: form.startDate,
        location: form.location,
        maxParticipants: parseInt(form.maxParticipants) || 0,
        fee: form.fee ? parseFloat(form.fee) : null
      };
      const res = await fetch('http://localhost:5044/api/tournaments', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        credentials: 'include',
        body: JSON.stringify(payload)
      });
      
      if (res.ok) {
        const created = await res.json();
        fetchTournaments(); // Refetch to get updated list
        setForm({ title: "", description: "", startDate: "", location: "", maxParticipants: 16, fee: 0 });
        setMessage({ type: 'success', text: 'Tournament created successfully!' });
      } else {
        const data = await res.json();
        setMessage({ type: 'error', text: data.message || 'Failed to create tournament' });
      }
    } catch (err) {
      console.error(err);
      setMessage({ type: 'error', text: 'Failed to create tournament' });
    } finally {
      setCreating(false);
    }
  };

  return (
    <ReserveMenuProvider>
      <div className="relative bg-white overflow-hidden min-h-screen">
        {/* Animated background blobs - same as homepage */}
        <motion.div
          className="w-[50vw] h-[50vw] bg-light-green rounded-full fixed blur-[200px] pointer-events-none z-0"
          animate={{
            top: ['-20vh', '10vh', '-20vh'],
            left: ['20vw', '30vw', '20vw']
          }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="w-[50vw] h-[50vw] bg-light-green rounded-full fixed blur-[200px] pointer-events-none z-0"
          animate={{
            top: ['60vh', '70vh', '60vh'],
            left: ['65vw', '55vw', '65vw']
          }}
          transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
        />

        <div className="relative z-10">
          <Navbar />
          
          <div className="pt-32 px-6 pb-12">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="max-w-6xl mx-auto"
            >
              {/* Header */}
              <div className="text-center mb-12 relative">
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.6, type: "spring", stiffness: 200 }}
                  className="inline-block mb-6"
                >
                  <svg className="w-24 h-24 mx-auto text-dark-green drop-shadow-lg" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 18.75h-9m9 0a3 3 0 0 1 3 3h-15a3 3 0 0 1 3-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 0 1-.982-3.172M9.497 14.25a7.454 7.454 0 0 0 .981-3.172M5.25 4.236c-.982.143-1.954.317-2.916.52A6.003 6.003 0 0 0 7.73 9.728M5.25 4.236V4.5c0 2.108.966 3.99 2.48 5.228M5.25 4.236V2.721C7.456 2.41 9.71 2.25 12 2.25c2.291 0 4.545.16 6.75.47v1.516M7.73 9.728a6.726 6.726 0 0 0 2.748 1.35m8.272-6.842V4.5c0 2.108-.966 3.99-2.48 5.228m2.48-5.492a46.32 46.32 0 0 1 2.916.52 6.003 6.003 0 0 1-5.395 4.972m0 0a6.726 6.726 0 0 1-2.749 1.35m0 0a6.772 6.772 0 0 1-3.044 0"/>
                  </svg>
                </motion.div>
                
                <motion.h1 
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  className="text-6xl font-bold text-dark-green mb-4 tracking-tight"
                >
                  Tournaments
                </motion.h1>
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.6, delay: 0.4 }}
                  className="text-xl text-dark-green-half max-w-2xl mx-auto"
                >
                  Join our tournaments and compete with other players!
                </motion.p>
              </div>
            
            <AnimatePresence mode="wait">
              {message && (
                <motion.div 
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  transition={{ duration: 0.3 }}
                  className={`p-5 mb-8 rounded-2xl shadow-2xl ${
                    message.type === 'success' 
                      ? 'bg-gradient-to-r from-green-100 via-green-50 to-white text-green-800 border-2 border-green-300' 
                      : 'bg-gradient-to-r from-red-100 via-red-50 to-white text-red-800 border-2 border-red-300'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    {message.type === 'success' ? (
                      <svg className="w-7 h-7 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    ) : (
                      <svg className="w-7 h-7 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                    )}
                    <span className="font-semibold text-lg">{message.text}</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {loading ? (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
                className="text-center py-20"
              >
                <motion.div 
                  className="inline-block rounded-full h-16 w-16 border-4 border-green border-t-transparent"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                />
                <p className="mt-4 text-dark-green-half text-lg">Loading tournaments...</p>
              </motion.div>
            ) : (() => {
              const filteredTournaments = tournaments.filter(t => {
                // Show Upcoming tournaments to everyone
                if (t.status === 0) return true;
                // Show InProgress/Completed only to participants
                if (!user) return false;
                return t.registeredUserIds?.includes(user.id);
              });
              
              return filteredTournaments.length === 0 ? (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5 }}
                  className="text-center py-20 bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-green-100"
                >
                  <motion.svg 
                    className="w-24 h-24 mx-auto mb-6 text-dark-green-half"
                    animate={floatingAnimation}
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
                  </motion.svg>
                  <p className="text-2xl font-semibold text-dark-green">No tournaments available yet.</p>
                  <p className="text-base text-dark-green-half mt-2">Check back later for upcoming competitions!</p>
                </motion.div>
              ) : (
                <div className="grid gap-6 md:grid-cols-2">
                  {filteredTournaments.map((t, idx) => (
                  <motion.div
                    key={t.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: idx * 0.05 }}
                    className="relative p-6 bg-white rounded-3xl shadow-xl border border-green-100 hover:shadow-2xl hover:border-green-200 transition-all duration-300 overflow-hidden group cursor-pointer"
                    whileHover={{ y: -4 }}
                    onClick={() => {
                      // If tournament is InProgress or Completed, show bracket page
                      if (t.status === 1 || t.status === 2) {
                        navigate(`/tournaments/${t.id}/bracket`);
                      } else {
                        navigate(`/tournaments/${t.id}`);
                      }
                    }}
                  >
                    {/* Decorative animated elements */}
                    <motion.div 
                      className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-green/20 to-transparent rounded-bl-full"
                      animate={{
                        scale: [1, 1.1, 1],
                        opacity: [0.3, 0.5, 0.3]
                      }}
                      transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: idx * 0.2 }}
                    />
                    <motion.div 
                      className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-light-green/30 to-transparent rounded-tr-full"
                      animate={{
                        scale: [1, 1.15, 1],
                        opacity: [0.3, 0.6, 0.3]
                      }}
                      transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: idx * 0.3 }}
                    />
                    
                    <div className="relative">
                      <div className="flex justify-between items-start gap-4 mb-4">
                        <div className="flex-1">
                          <h3 className="text-2xl font-bold text-dark-green mb-2 group-hover:text-green transition-colors">
                            {t.title}
                          </h3>
                        </div>
                        <div className={`px-4 py-2 rounded-full text-sm font-bold shadow-lg transition-transform hover:scale-105 ${
                          isTournamentFull(t) 
                            ? 'bg-gradient-to-r from-red-500 to-red-600 text-white' 
                            : 'bg-green text-white'
                        }`}>
                          {t.currentParticipants}/{t.maxParticipants}
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-3 mb-4">
                        <div className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-dark-green transition-colors">
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                          </svg>
                          <span className="font-medium">{new Date(t.startDate).toLocaleString('en-US', {month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'})}</span>
                        </div>
                        {t.location && (
                          <div className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-dark-green transition-colors">
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                            </svg>
                            <span className="font-medium">{t.location}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-dark-green transition-colors">
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
                          </svg>
                          <span className="font-medium">{t.fee > 0 ? `${t.fee} Ft` : 'Free'}</span>
                        </div>
                      </div>

                      <div className="flex justify-end items-center gap-2 text-green font-medium text-sm group-hover:text-green transition-colors">
                        View Details
                        <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      </div>
                    </div>
                  </motion.div>
                  ))}
                </div>
              );
            })()}

          </motion.div>
        </div>
      </div>
      </div>
    </ReserveMenuProvider>
  );
}

export default Tournaments;