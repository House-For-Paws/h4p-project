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
 *   /edit-post/:id     Edit own adoption listing
 *   /adopt/:id         Pet detail + apply
 *   /messages          Opens floating chat (deep-link bridge)
 *   /about /contact /how-it-works /eula
 * =============================================================================
 */
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { MessageChatProvider } from "../contexts/MessageChatContext";
import ChatWindow from "../Components/features/ChatWindow";
import ProtectedRoute from "../Components/routing/ProtectedRoute";
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
import Messages from "../pages/Messages";

function App() {
  return (
    <BrowserRouter>
      <MessageChatProvider>
        <Routes>
          {/* ----- Main ----- */}
          <Route path="/" element={<Home />} />
          <Route path="/adopt/:id" element={<AdoptPet />} />
          <Route
            path="/create-post"
            element={
              <ProtectedRoute>
                <CreateAdoptionPost />
              </ProtectedRoute>
            }
          />
          <Route
            path="/edit-post/:id"
            element={
              <ProtectedRoute>
                <CreateAdoptionPost />
              </ProtectedRoute>
            }
          />
          <Route
            path="/messages"
            element={
              <ProtectedRoute>
                <Messages />
              </ProtectedRoute>
            }
          />

          {/* ----- Auth ----- */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* ----- User / Admin ----- */}
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <ProtectedRoute adminOnly>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />

          {/* ----- Info pages ----- */}
          <Route path="/contact" element={<Contact />} />
          <Route path="/how-it-works" element={<HowItWorks />} />
          <Route path="/about" element={<About />} />
          <Route path="/eula" element={<Eula />} />
        </Routes>
        <ChatWindow />
      </MessageChatProvider>
    </BrowserRouter>
  );
}

export default App;
