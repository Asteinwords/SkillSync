import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Register from "./pages/Register";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Matches from "./pages/Matches";
import ChatSidebar from "./components/Chat/ChatApp";
import Leaderboard from "./pages/Leaderboard";
import ScheduleSession from "./pages/ScheduleSession";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import NotFound from "./pages/Notfound";
import PrivateRoute from "./routes/PrivateRoutes";
import PublicRoute from "./routes/PublicRoute";
import Profile from "./pages/Profile";
import LiveRoom from './pages/LiveRoom';
import Rooms from "./pages/Rooms";
import Chat from "./pages/Chat";
import { Toaster } from 'react-hot-toast';
import ForgotPassword from "./components/ForgotPassword";
import ResetPassword from "./components/ResetPassword";
import Heatmap from "./components/Heatmap";
import MainHome from "./pages/MainHome";
import CommunityFeed from "./pages/CommunityFeed";
import Bookmarks from "./pages/Bookmarks";
import Badges from "./components/Badges";
import AccountDeletion from "./components/AccountDeletion";
import PointsStore from "./pages/PointsStore";
import ContactUs from "./pages/ContactUs";
import Footer from "./components/Footer";

function App() {
  return (
    <Router>
      <Toaster position="top-center" toastOptions={{ duration: 3000 }} />
      <Navbar />
      
      <div className="min-h-screen bg-gradient-to-br from-blue-200 via-purple-100 to-pink-200">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<PublicRoute><Home /></PublicRoute>} />
          <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
          <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
          <Route path="/forgot-password" element={<PublicRoute><ForgotPassword /></PublicRoute>} />
          <Route path="/reset-password/:token" element={<PublicRoute><ResetPassword /></PublicRoute>} />

          {/* Private Routes */}
          <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
          <Route path="/matches" element={<PrivateRoute><Matches /></PrivateRoute>} />
          <Route path="/chat" element={<PrivateRoute><ChatSidebar /></PrivateRoute>} />
          <Route path="/leaderboard" element={<PrivateRoute><Leaderboard /></PrivateRoute>} />
          <Route path="/schedule" element={<PrivateRoute><ScheduleSession /></PrivateRoute>} />
          <Route path="/heat" element={<PrivateRoute><Heatmap /></PrivateRoute>} />
          <Route path="/users/:id/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
          <Route path="/live-room/:roomId" element={<PrivateRoute><LiveRoom /></PrivateRoute>} />
          <Route path="/room" element={<PrivateRoute><Rooms /></PrivateRoute>} />
          <Route path="/chatt" element={<PrivateRoute><Chat /></PrivateRoute>} />
          <Route path="/webpage" element={<PrivateRoute><MainHome /></PrivateRoute>} />
          <Route path="/community" element={<PrivateRoute><CommunityFeed /></PrivateRoute>} />
          <Route path="/bookmarks" element={<PrivateRoute><Bookmarks /></PrivateRoute>} />
          <Route path="/badges" element={<PrivateRoute><Badges /></PrivateRoute>} />
          <Route path="/delete" element={<PrivateRoute><AccountDeletion /></PrivateRoute>} />
          <Route path="/points-store" element={<PrivateRoute><PointsStore /></PrivateRoute>} />
          <Route path="/contact" element={<PrivateRoute><ContactUs /></PrivateRoute>} />
          {/* Catch-all 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
        <Footer />
      </div>
    </Router>
  );
}

export default App;