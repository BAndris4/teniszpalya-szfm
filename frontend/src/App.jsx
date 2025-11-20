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
import Tournaments from './views/Tournaments.jsx';
import TournamentDetails from './views/TournamentDetails.jsx';
import TournamentBracketPage from './views/TournamentBracketPage.jsx';
import AdminBracketView from './views/AdminBracketView.jsx';
import TennisMiniGame from './views/TennisMiniGame.jsx';
import ReservationCheckout from './views/ReservationCheckout.jsx';

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
          <Route path="/tournaments" element={<Tournaments />} />
          <Route path="/tournaments/:id" element={<TournamentDetails />} />
          <Route path="/tournaments/:id/bracket" element={<TournamentBracketPage />} />
          <Route path="/admin/tournaments/:id/bracket" element={<AdminBracketView />} />
          <Route path="/minigame" element={<TennisMiniGame />} />
          <Route path="/checkout" element={<ReservationCheckout />} />
        </Routes>
    </BrowserRouter>
  )
}

export default App;
