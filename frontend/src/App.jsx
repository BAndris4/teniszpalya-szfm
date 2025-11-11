import './index.css'
import "@fontsource/poppins/700.css";
import "@fontsource/poppins/600.css";
import "@fontsource/poppins/500.css";
import "@fontsource/poppins/400.css";
import Home from './views/Home';
import Register from './views/Register.jsx'
import Contact from './views/Contact.jsx';
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Signup from './views/Login.jsx';
import ProfilePage from './views/ProfilePage.jsx';
import ReserveByCourts from './views/ReserveByCourts.jsx';
import ReserveByTime from './views/ReserveByTime.jsx';
import CourtsPage from './views/CourtsPage.jsx';
import Admin from './views/AdminPanel.jsx';
import TennisMiniGame from './views/TennisMiniGame.jsx';

function App() {
  return (
    <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/register" element={<Register/>} />
          <Route path="/login" element={<Signup />} />
          <Route path="/profile" element={<ProfilePage/>} />
          <Route path="/courts" element={<CourtsPage/>} />
          <Route path="/reserveByCourt" element={<ReserveByCourts/>} />
          <Route path="/reserveByTime" element={<ReserveByTime/>} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/minigame" element={<TennisMiniGame />} />
        </Routes>
    </BrowserRouter>
  )
}

export default App;
