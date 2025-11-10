import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";

function Contact() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const validateEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus("");
    setError("");
    if (!name || !email || !message) {
      setError("Please fill out all fields!");
      return;
    }
    if (!validateEmail(email)) {
      setError("Please enter a valid email address!");
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setStatus("Thank you for contacting us! We will reply soon.");
      setName(""); setEmail(""); setMessage("");
    }, 1200);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.7, ease: "easeOut" }}
      className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-200 via-white to-green-300 relative overflow-hidden"
      style={{ backgroundColor: '#e6fbe6' }}
    >
      <motion.img
        src="/src/assets/tennis_ball.svg"
        alt="Tennis Ball"
        initial={{ y: -40, x: -40, rotate: -15, opacity: 0 }}
        animate={{ y: 0, x: 0, rotate: 0, opacity: 0.7 }}
        transition={{ duration: 0.7, type: "tween" }}
        className="absolute left-10 top-10 w-16 h-16 z-10 cursor-pointer hover:scale-110 transition-transform duration-200"
        onClick={() => navigate("/")}
        style={{ pointerEvents: "auto" }}
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
        className="w-full max-w-lg bg-white rounded-3xl p-10 z-10 relative border-2 border-green-200 shadow-2xl"
      >
        <div className="flex flex-col items-center mb-2">
          <motion.h2
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="text-3xl font-bold text-dark-green tracking-tight relative"
          >
            Contact Us
            <motion.span
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ delay: 0.7, duration: 0.5 }}
              className="block h-[3px] w-16 bg-green rounded-full absolute left-1/2 -translate-x-1/2 mt-2"
              style={{ bottom: -8 }}
            />
          </motion.h2>
        </div>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="text-dark-green-half text-center mb-8"
        >Write to us if you have any questions or feedback!</motion.p>
        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <motion.input
            whileFocus={{ scale: 1.04, boxShadow: "0 0 0 2px #22c55e55" }}
            type="text"
            placeholder="Name"
            value={name}
            onChange={e => setName(e.target.value)}
            className={`bg-green-50 border rounded-xl px-5 py-3 text-lg focus:outline-none focus:ring-2 focus:ring-green transition-all duration-300 ${!name && error ? 'border-red-400' : 'border-green-200'}`}
          />
          <motion.input
            whileFocus={{ scale: 1.04, boxShadow: "0 0 0 2px #22c55e55" }}
            type="email"
            placeholder="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            className={`bg-green-50 border rounded-xl px-5 py-3 text-lg focus:outline-none focus:ring-2 focus:ring-green transition-all duration-300 ${(!validateEmail(email) && error) ? 'border-red-400' : 'border-green-200'}`}
          />
          <motion.textarea
            whileFocus={{ scale: 1.02, boxShadow: "0 0 0 2px #22c55e55" }}
            placeholder="Message"
            value={message}
            onChange={e => setMessage(e.target.value)}
            rows={5}
            className={`bg-green-50 border rounded-xl px-5 py-3 text-lg focus:outline-none focus:ring-2 focus:ring-green transition-all duration-300 resize-none ${!message && error ? 'border-red-400' : 'border-green-200'}`}
          />
          <motion.button
            whileHover={{ scale: 1.07, backgroundColor: "#15803d", boxShadow: "0 4px 24px 0 #22c55e55" }}
            whileTap={{ scale: 0.97 }}
            type="submit"
            disabled={loading}
            className={`bg-gradient-to-r from-green to-dark-green text-white font-semibold rounded-xl py-3 text-lg shadow-md transition-all duration-300 ${loading ? "opacity-60 cursor-not-allowed" : "hover:bg-dark-green"}`}
          >
            {loading ? "Sending..." : "Send message"}
          </motion.button>
        </form>
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="mt-6 text-center text-red-600 font-medium"
            >{error}</motion.div>
          )}
          {status && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="mt-6 text-center text-green-700 font-medium"
            >{status}</motion.div>
          )}
        </AnimatePresence>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 0.12, scale: 1 }}
          transition={{ delay: 0.3, duration: 0.7 }}
          className="absolute inset-0 pointer-events-none z-0"
        >
          <div className="w-[30vw] h-[30vw] bg-green rounded-full fixed blur-[60px] left-[-10vw] top-[-10vw]" />
          <div className="w-[20vw] h-[20vw] bg-green rounded-full fixed blur-[40px] right-[-5vw] bottom-[-5vw] opacity-50" />
        </motion.div>
      </motion.div>
    </motion.div>
  );
}

export default Contact;
