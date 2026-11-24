/**
 * =============================================================================
 * FILE: client/src/App/App.jsx
 * ROLE: Client route table (URL → page component)
 * =============================================================================
 * Routes:
 *   /                  Home
 *   /login /register   Auth
 *   /profile           User hub
 *   /admin             Admin dashboard
 *   /create-post       New adoption listing
 *   /adopt/:id         Pet detail + apply
 *   /about /contact /how-it-works /eula
 * =============================================================================
 */
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "../pages/Login";
import Home from "../pages/Home";
import Register from "../pages/Register";
import Contact from "../pages/Contact";
import HowItWorks from "../pages/HowItWorks";
import About from "../pages/About";
import Eula from "../pages/Eula";
import Profile from "../pages/Profile";
import AdminDashboard from "../pages/AdminDashboard";
import CreateAdoptionPost from "../pages/CreateAdoptionPost";
import AdoptPet from "../pages/AdoptPet";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* ----- Main ----- */}
        <Route path="/" element={<Home />} />
        <Route path="/adopt/:id" element={<AdoptPet />} />
        <Route path="/create-post" element={<CreateAdoptionPost />} />

        {/* ----- Auth ----- */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* ----- User / Admin ----- */}
        <Route path="/profile" element={<Profile />} />
        <Route path="/admin" element={<AdminDashboard />} />

        {/* ----- Info pages ----- */}
        <Route path="/contact" element={<Contact />} />
        <Route path="/how-it-works" element={<HowItWorks />} />
        <Route path="/about" element={<About />} />
        <Route path="/eula" element={<Eula />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
