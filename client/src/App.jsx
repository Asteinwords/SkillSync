// import React from "react";
// import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
// import Register from "./pages/Register";
// import Login from "./pages/Login";
// import Dashboard from "./pages/Dashboard";
// import Matches from "./pages/Matches";
// import Chat from "./pages/Chat";
// import Leaderboard from "./pages/Leaderboard";
// import ScheduleSession from "./pages/ScheduleSession";
// import SessionList from "./pages/SessionList";
// import Navbar from "./components/Navbar";
// import Home from "./pages/Home";

// function App() {
//   return (
//     <Router>
//       {/* ✅ Navbar is now inside Router */}
//       <Navbar />
//       <div className="min-h-screen bg-gray-100">
//         <Routes>
//           <Route path="/" element={<Home />} />
//           <Route path="/register" element={<Register />} />
//           <Route path="/login" element={<Login />} />
//           <Route path="/dashboard" element={<Dashboard />} />
//           <Route path="/matches" element={<Matches />} />
//           <Route path="/chat" element={<Chat />} />
//           <Route path="/leaderboard" element={<Leaderboard />} />
//           <Route path="/schedule" element={<ScheduleSession />} />
//           <Route path="/sessions" element={<SessionList />} />
//         </Routes>
//       </div>
//     </Router>
//   );
// }

// export default App;
// import React from "react";
// import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
// import Register from "./pages/Register";
// import Login from "./pages/Login";
// import Dashboard from "./pages/Dashboard";
// import Matches from "./pages/Matches";
// // ❌ Remove direct Chat import
// // import Chat from "./pages/Chat";
// import ChatSidebar from "./components/Chat/SideBar"; // ✅ New Sidebar
// import Leaderboard from "./pages/Leaderboard";
// import ScheduleSession from "./pages/ScheduleSession";
// import SessionList from "./pages/SessionList";
// import Navbar from "./components/Navbar";
// import Home from "./pages/Home";
// import NotFound from './pages/Notfound';

// import PrivateRoute from "./routes/PrivateRoutes";
// import PublicRoute from "./routes/PublicRoute";
// import Profile from "./pages/Profile";
// import LiveRoom from './pages/LiveRoom';
// import Rooms from "./pages/Rooms";

// function App() {
//   return (
//     <Router>
//       <Navbar />
//       <div className="min-h-screen bg-gray-100">
//         <Routes>
//           {/* 404 Route */}
//           <Route path="*" element={<NotFound />} />

//           {/* Public Routes */}
//           <Route
//             path="/"
//             element={
//               <PublicRoute>
//                 <Home />
//               </PublicRoute>
//             }
//           />
//           <Route
//             path="/login"
//             element={
//               <PublicRoute>
//                 <Login />
//               </PublicRoute>
//             }
//           />
//           <Route
//             path="/register"
//             element={
//               <PublicRoute>
//                 <Register />
//               </PublicRoute>
//             }
//           />

//           {/* Private Routes */}
//           <Route
//             path="/dashboard"
//             element={
//               <PrivateRoute>
//                 <Dashboard />
//               </PrivateRoute>
//             }
//           />
//           <Route
//             path="/matches"
//             element={
//               <PrivateRoute>
//                 <Matches />
//               </PrivateRoute>
//             }
//           />
//           <Route
//             path="/chat"
//             element={
//               <PrivateRoute>
//                 <ChatSidebar /> {/* ✅ This renders the sidebar + chat */}
//               </PrivateRoute>
//             }
//           />
//           <Route
//             path="/leaderboard"
//             element={
//               <PrivateRoute>
//                 <Leaderboard />
//               </PrivateRoute>
//             }
//           />
//           <Route
//             path="/schedule"
//             element={
//               <PrivateRoute>
//                 <ScheduleSession />
//               </PrivateRoute>
//             }
//           />
//           <Route
//             path="/sessions"
//             element={
//               <PrivateRoute>
//                 <SessionList />
//               </PrivateRoute>
//             }
//           />
//           <Route
//             path="/users/:id/profile"
//             element={
//               <PrivateRoute>
//                 <Profile />
//               </PrivateRoute>
//             }
//           />
//           <Route
//             path="/live/:roomId"
//             element={
//               <PrivateRoute>
//                 <LiveRoom />
//               </PrivateRoute>
//             }
//           />
//           <Route
//             path="/rooms"
//             element={
//               <PrivateRoute>
//                 <Rooms />
//               </PrivateRoute>
//             }
//           />
//         </Routes>
//       </div>
//     </Router>
//   );
// }

// export default App;
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Register from "./pages/Register";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Matches from "./pages/Matches";
import ChatSidebar from "./components/Chat/ChatApp"; // ✅ main wrapper
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

function App() {
  return (
    <Router>
      <Toaster position="top-center" toastOptions={{ duration: 3000 }} />
      <Navbar />
      <div className="min-h-screen bg-gray-100">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<PublicRoute><Home /></PublicRoute>} />
          <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
          <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />

          {/* Private Routes */}
          <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
          <Route path="/matches" element={<PrivateRoute><Matches /></PrivateRoute>} />
          <Route path="/chat" element={<PrivateRoute><ChatSidebar /></PrivateRoute>} />
          <Route path="/leaderboard" element={<PrivateRoute><Leaderboard /></PrivateRoute>} />
          <Route path="/schedule" element={<PrivateRoute><ScheduleSession /></PrivateRoute>} />
          
          <Route path="/users/:id/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
          <Route path="/live-room/:roomId" element={<PrivateRoute><LiveRoom /></PrivateRoute>} />
          <Route path="/room" element={<PrivateRoute><Rooms /></PrivateRoute>} />
          <Route path="/chatt" element={<PrivateRoute><Chat /></PrivateRoute>} />
          <Route path="/forgot-password" element={<PrivateRoute><ForgotPassword /></PrivateRoute>} />
          <Route path="/reset_password/:id/:token" element={<PrivateRoute><ResetPassword /></PrivateRoute>} />

          {/* Catch-all 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
