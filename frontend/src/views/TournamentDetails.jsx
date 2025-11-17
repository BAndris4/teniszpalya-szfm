import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useCurrentUser } from "../hooks/useCurrentUser";
import Navbar from "../components/Navbar";
import { ReserveMenuProvider } from "../contexts/ReserveMenuContext";

function TournamentDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, authenticated } = useCurrentUser();
  const [tournament, setTournament] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    title: '',
    description: '',
    startDate: '',
    location: '',
    maxParticipants: 0,
    fee: 0
  });

  useEffect(() => {
    fetchTournamentDetails();
  }, [id]);

  const fetchTournamentDetails = async () => {
    setLoading(true);
    try {
      const [tournamentRes, participantsRes] = await Promise.all([
        fetch(`http://localhost:5044/api/tournaments/${id}`),
        fetch(`http://localhost:5044/api/tournaments/${id}/participants`)
      ]);
      
      if (tournamentRes.ok) {
        const tournamentData = await tournamentRes.json();
        setTournament(tournamentData);
        // Pre-fill edit form
        setEditForm({
          title: tournamentData.title || '',
          description: tournamentData.description || '',
          startDate: tournamentData.startDate ? tournamentData.startDate.substring(0, 16) : '',
          location: tournamentData.location || '',
          maxParticipants: tournamentData.maxParticipants || 0,
          fee: tournamentData.fee || 0
        });
      } else {
        setTournament(null);
      }
      
      if (participantsRes.ok) {
        const participantsData = await participantsRes.json();
        setParticipants(participantsData);
      }
    } catch (err) {
      console.error(err);
      setTournament(null);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    if (!authenticated) {
      navigate('/login');
      return;
    }

    try {
      const res = await fetch(`http://localhost:5044/api/tournaments/${id}/register`, {
        method: 'POST',
        credentials: 'include'
      });
      const data = await res.json();
      
      if (res.ok) {
        setMessage({ type: 'success', text: data.message || 'Successfully registered!' });
        fetchTournamentDetails();
      } else {
        setMessage({ type: 'error', text: data.message || 'Failed to register' });
      }
    } catch (err) {
      console.error(err);
      setMessage({ type: 'error', text: 'Failed to register' });
    }
  };

  const handleUnregister = async () => {
    if (!window.confirm('Are you sure you want to leave this tournament?')) {
      return;
    }

    try {
      const res = await fetch(`http://localhost:5044/api/tournaments/${id}/unregister`, {
        method: 'POST',
        credentials: 'include'
      });
      const data = await res.json();
      
      if (res.ok) {
        setMessage({ type: 'success', text: data.message || 'Successfully unregistered!' });
        fetchTournamentDetails();
      } else {
        setMessage({ type: 'error', text: data.message || 'Failed to unregister' });
      }
    } catch (err) {
      console.error(err);
      setMessage({ type: 'error', text: 'Failed to unregister' });
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this tournament? This action cannot be undone.')) {
      return;
    }

    setDeleting(true);
    try {
      const res = await fetch(`http://localhost:5044/api/tournaments/${id}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      if (res.ok) {
        setMessage({ type: 'success', text: 'Tournament deleted successfully!' });
        setTimeout(() => navigate('/tournaments'), 2000);
      } else {
        const data = await res.json();
        setMessage({ type: 'error', text: data.message || 'Failed to delete tournament' });
      }
    } catch (err) {
      console.error(err);
      setMessage({ type: 'error', text: 'Failed to delete tournament' });
    } finally {
      setDeleting(false);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    if (tournament) {
      setEditForm({
        title: tournament.title || '',
        description: tournament.description || '',
        startDate: tournament.startDate ? tournament.startDate.substring(0, 16) : '',
        location: tournament.location || '',
        maxParticipants: tournament.maxParticipants || 0,
        fee: tournament.fee || 0
      });
    }
  };

  const handleUpdateTournament = async (e) => {
    e.preventDefault();
    
    try {
      const res = await fetch(`http://localhost:5044/api/tournaments/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          title: editForm.title,
          description: editForm.description,
          startDate: new Date(editForm.startDate).toISOString(),
          location: editForm.location,
          maxParticipants: parseInt(editForm.maxParticipants),
          fee: parseFloat(editForm.fee)
        })
      });

      const data = await res.json();
      
      if (res.ok) {
        setMessage({ type: 'success', text: data.message || 'Tournament updated successfully!' });
        setIsEditing(false);
        fetchTournamentDetails();
      } else {
        setMessage({ type: 'error', text: data.message || 'Failed to update tournament' });
      }
    } catch (err) {
      console.error(err);
      setMessage({ type: 'error', text: 'Failed to update tournament' });
    }
  };

  const isUserRegistered = tournament && user && tournament.registeredUserIds?.includes(user.id);
  const isFull = tournament && tournament.currentParticipants >= tournament.maxParticipants;

  if (loading) {
    return (
      <ReserveMenuProvider>
        <div className="relative bg-white overflow-hidden min-h-screen">
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
            <div className="flex items-center justify-center min-h-screen">
              <div className="text-center">
                <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-green border-t-transparent mb-4"></div>
                <p className="text-dark-green-half text-lg">Loading tournament...</p>
              </div>
            </div>
          </div>
        </div>
      </ReserveMenuProvider>
    );
  }

  if (!tournament) {
    return (
      <ReserveMenuProvider>
        <div className="relative bg-white overflow-hidden min-h-screen">
          <div className="relative z-10">
            <Navbar />
            <div className="flex items-center justify-center min-h-screen">
              <div className="text-center">
                <p className="text-2xl text-dark-green-half">Tournament not found</p>
                <button onClick={() => navigate('/tournaments')} className="mt-4 px-6 py-3 bg-green text-white rounded-xl cursor-pointer">
                  Back to Tournaments
                </button>
              </div>
            </div>
          </div>
        </div>
      </ReserveMenuProvider>
    );
  }

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
            <div className="max-w-5xl mx-auto">
              {/* Back button */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex justify-between items-center mb-6"
              >
                <motion.button
                  onClick={() => navigate('/tournaments')}
                  whileHover={{ scale: 1.05, x: -5, transition: { duration: 0.15 } }}
                  whileTap={{ scale: 0.95 }}
                  className="flex items-center gap-2 px-5 py-3 bg-white/80 backdrop-blur-sm rounded-2xl text-dark-green hover:text-white hover:bg-green transition-all duration-150 font-semibold shadow-lg hover:shadow-xl group cursor-pointer"
                >
                  <svg className="w-5 h-5 group-hover:-translate-x-1 transition-transform duration-150" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
                  </svg>
                  Back to Tournaments
                </motion.button>

                {/* Admin edit and delete buttons */}
                {user && user.roleID === 2 && (
                  <div className="flex gap-3">
                    <motion.button
                      whileHover={{ scale: 1.05, transition: { duration: 0.15 } }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleEdit}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-all duration-150 font-medium cursor-pointer"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                      </svg>
                      Edit
                    </motion.button>
                    
                    <motion.button
                      whileHover={{ scale: 1.05, transition: { duration: 0.15 } }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleDelete}
                      disabled={deleting}
                      className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-all duration-150 font-medium disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                    >
                    {deleting ? (
                      <>
                        <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Deleting...
                      </>
                    ) : (
                      <>
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        Delete Tournament
                      </>
                    )}
                  </motion.button>
                  </div>
                )}
              </motion.div>

              {/* Message banner */}
              {message && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`p-5 mb-6 rounded-2xl shadow-xl ${
                    message.type === 'success' 
                      ? 'bg-gradient-to-r from-green-100 to-white text-green-800 border-2 border-green-300' 
                      : 'bg-gradient-to-r from-red-100 to-white text-red-800 border-2 border-red-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {message.type === 'success' ? (
                      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    ) : (
                      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                    )}
                    <span className="font-semibold">{message.text}</span>
                  </div>
                </motion.div>
              )}

              <div className="grid md:grid-cols-3 gap-6">
                {/* Main tournament info */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="md:col-span-2 bg-white rounded-3xl shadow-2xl border border-green-100 p-8"
                  style={{ willChange: 'transform', backfaceVisibility: 'hidden', transform: 'translate3d(0,0,0)' }}
                >
                  {isEditing ? (
                    /* Edit form */
                    <form onSubmit={handleUpdateTournament}>
                      <div className="mb-6">
                        <h2 className="text-3xl font-bold text-dark-green mb-6 flex items-center gap-3">
                          <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                          </svg>
                          Edit Tournament
                        </h2>
                      </div>

                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-dark-green mb-2">Title</label>
                          <input
                            type="text"
                            required
                            value={editForm.title}
                            onChange={(e) => setEditForm({...editForm, title: e.target.value})}
                            className="w-full px-4 py-3 border border-green-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green/60 focus:border-transparent"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-dark-green mb-2">Description</label>
                          <textarea
                            value={editForm.description}
                            onChange={(e) => setEditForm({...editForm, description: e.target.value})}
                            rows={4}
                            className="w-full px-4 py-3 border border-green-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green/60 focus:border-transparent resize-none"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-dark-green mb-2">Start Date & Time</label>
                          <input
                            type="datetime-local"
                            required
                            value={editForm.startDate}
                            onChange={(e) => setEditForm({...editForm, startDate: e.target.value})}
                            className="w-full px-4 py-3 border border-green-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green/60 focus:border-transparent"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-dark-green mb-2">Location</label>
                          <input
                            type="text"
                            value={editForm.location}
                            onChange={(e) => setEditForm({...editForm, location: e.target.value})}
                            className="w-full px-4 py-3 border border-green-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green/60 focus:border-transparent"
                          />
                        </div>

                        <div className="grid sm:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-dark-green mb-2">Max Participants</label>
                            <input
                              type="number"
                              required
                              min="1"
                              value={editForm.maxParticipants}
                              onChange={(e) => setEditForm({...editForm, maxParticipants: e.target.value})}
                              className="w-full px-4 py-3 border border-green-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green/60 focus:border-transparent"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-dark-green mb-2">Entry Fee (Ft)</label>
                            <input
                              type="number"
                              required
                              min="0"
                              value={editForm.fee}
                              onChange={(e) => setEditForm({...editForm, fee: e.target.value})}
                              className="w-full px-4 py-3 border border-green-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green/60 focus:border-transparent"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-3 mt-6 pt-6 border-t border-green-100">
                        <motion.button
                          type="submit"
                          whileHover={{ scale: 1.01, transition: { duration: 0.1 } }}
                          whileTap={{ scale: 0.99 }}
                          className="flex-1 px-6 py-3 rounded-xl bg-green hover:bg-green/90 text-white hover:shadow-xl transition-all duration-100 font-bold text-lg flex items-center justify-center gap-2 cursor-pointer"
                        >
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                          Save Changes
                        </motion.button>
                        <motion.button
                          type="button"
                          onClick={handleCancelEdit}
                          whileHover={{ scale: 1.01, transition: { duration: 0.1 } }}
                          whileTap={{ scale: 0.99 }}
                          className="px-6 py-3 rounded-xl bg-gray-200 text-dark-green hover:bg-gray-300 transition-all duration-100 font-bold text-lg cursor-pointer"
                        >
                          Cancel
                        </motion.button>
                      </div>
                    </form>
                  ) : (
                    /* View mode */
                    <>
                  {/* Trophy icon */}
                  <div className="inline-block mb-6">
                    <svg className="w-20 h-20 text-dark-green drop-shadow-lg" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 18.75h-9m9 0a3 3 0 0 1 3 3h-15a3 3 0 0 1 3-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 0 1-.982-3.172M9.497 14.25a7.454 7.454 0 0 0 .981-3.172M5.25 4.236c-.982.143-1.954.317-2.916.52A6.003 6.003 0 0 0 7.73 9.728M5.25 4.236V4.5c0 2.108.966 3.99 2.48 5.228M5.25 4.236V2.721C7.456 2.41 9.71 2.25 12 2.25c2.291 0 4.545.16 6.75.47v1.516M7.73 9.728a6.726 6.726 0 0 0 2.748 1.35m8.272-6.842V4.5c0 2.108-.966 3.99-2.48 5.228m2.48-5.492a46.32 46.32 0 0 1 2.916.52 6.003 6.003 0 0 1-5.395 4.972m0 0a6.726 6.726 0 0 1-2.749 1.35m0 0a6.772 6.772 0 0 1-3.044 0"/>
                    </svg>
                  </div>

                  <h1 className="text-4xl font-bold text-dark-green mb-4">{tournament.title}</h1>
                  
                  {tournament.description && (
                    <p className="text-lg text-dark-green-half mb-6 leading-relaxed">
                      {tournament.description}
                    </p>
                  )}

                  {/* Details grid */}
                  <div className="grid sm:grid-cols-2 gap-4 mb-6">
                    <div className="flex items-center gap-3 p-4 rounded-xl">
                      <svg className="w-6 h-6 text-dark-green flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                      </svg>
                      <div>
                        <div className="text-xs text-dark-green-half">Date & Time</div>
                        <div className="font-semibold text-dark-green">
                          {new Date(tournament.startDate).toLocaleString('en-US', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </div>
                      </div>
                    </div>

                    {tournament.location && (
                      <div className="flex items-center gap-3 p-4 rounded-xl">
                        <svg className="w-6 h-6 text-dark-green flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                        </svg>
                        <div>
                          <div className="text-xs text-dark-green-half">Location</div>
                          <div className="font-semibold text-dark-green">{tournament.location}</div>
                        </div>
                      </div>
                    )}

                    <div className="flex items-center gap-3 p-4 rounded-xl">
                      <svg className="w-6 h-6 text-dark-green flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                      </svg>
                      <div>
                        <div className="text-xs text-dark-green-half">Participants</div>
                        <div className="font-semibold text-dark-green">
                          {tournament.currentParticipants} / {tournament.maxParticipants}
                        </div>
                      </div>
                    </div>

                    {/* Entry Fee */}
                    <div className="flex items-center gap-3 p-4 rounded-xl">
                      <svg className="w-6 h-6 text-dark-green flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
                      </svg>
                      <div>
                        <div className="text-xs text-dark-green-half">Entry Fee</div>
                        <div className="font-semibold text-dark-green">
                          {tournament.fee > 0 ? `${tournament.fee} Ft` : 'Free'}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Register button */}
                  <div className="pt-4 border-t border-green-100">
                    {isFull && !isUserRegistered ? (
                      <button 
                        disabled 
                        className="w-full px-6 py-4 rounded-xl bg-gray-200 text-gray-500 cursor-not-allowed font-medium flex items-center justify-center gap-2"
                      >
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M13.477 14.89A6 6 0 015.11 6.524l8.367 8.368zm1.414-1.414L6.524 5.11a6 6 0 018.367 8.367zM18 10a8 8 0 11-16 0 8 8 0 0116 0z" clipRule="evenodd" />
                        </svg>
                        Tournament Full
                      </button>
                    ) : isUserRegistered ? (
                      <motion.button 
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleUnregister}
                        className="w-full px-6 py-4 rounded-xl bg-orange-500 text-white hover:bg-orange-600 transition-all font-bold text-lg flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M3 3a1 1 0 011 1v12a1 1 0 11-2 0V4a1 1 0 011-1zm7.707 3.293a1 1 0 010 1.414L9.414 9H17a1 1 0 110 2H9.414l1.293 1.293a1 1 0 01-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        Leave Tournament
                      </motion.button>
                    ) : authenticated ? (
                      <motion.button 
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleRegister} 
                        className="w-full px-6 py-4 rounded-xl bg-green hover:bg-green/90 text-white hover:shadow-2xl transition-all font-bold text-lg flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M8 9a3 3 0 100-6 3 3 0 000 6zM8 11a6 6 0 016 6H2a6 6 0 016-6zM16 7a1 1 0 10-2 0v1h-1a1 1 0 100 2h1v1a1 1 0 102 0v-1h1a1 1 0 100-2h-1V7z" />
                        </svg>
                        Register for Tournament
                      </motion.button>
                    ) : (
                      <motion.button 
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => navigate('/login')} 
                        className="w-full px-6 py-4 rounded-xl bg-white border-2 border-green text-green hover:bg-green hover:text-white transition-all font-bold text-lg flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M3 3a1 1 0 011 1v12a1 1 0 11-2 0V4a1 1 0 011-1zm7.707 3.293a1 1 0 010 1.414L9.414 9H17a1 1 0 110 2H9.414l1.293 1.293a1 1 0 01-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        Login to Register
                      </motion.button>
                    )}
                  </div>
                  </>
                  )}
                </motion.div>

                {/* Participants list */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="bg-white rounded-3xl shadow-2xl border border-green-100 p-6"
                  style={{ willChange: 'transform', backfaceVisibility: 'hidden', transform: 'translate3d(0,0,0)' }}
                >
                  <h2 className="text-2xl font-bold text-dark-green mb-4 flex items-center gap-2">
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                    </svg>
                    Participants ({participants.length})
                  </h2>
                  
                  {participants.length === 0 ? (
                    <div className="text-center py-8 text-dark-green-half">
                      <svg className="w-16 h-16 mx-auto mb-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                      <p className="text-sm">No participants yet</p>
                      <p className="text-xs mt-1">Be the first to register!</p>
                    </div>
                  ) : (
                    <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                      {participants.map((participant, idx) => (
                        <motion.div
                          key={participant.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: idx * 0.05 }}
                          className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/50 transition-colors"
                        >
                          <div className="w-10 h-10 rounded-full bg-green flex items-center justify-center text-white font-bold">
                            {participant.firstName?.[0]}{participant.lastName?.[0]}
                          </div>
                          <div className="flex-1">
                            <div className="font-semibold text-dark-green">
                              {participant.firstName} {participant.lastName}
                            </div>
                            <div className="text-xs text-dark-green-half">
                              {participant.email}
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </motion.div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ReserveMenuProvider>
  );
}

export default TournamentDetails;
