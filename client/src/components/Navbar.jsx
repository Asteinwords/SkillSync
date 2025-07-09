import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import API from '../services/api';
import Stars from '../assets/stars.svg';
import { Bell } from 'lucide-react';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [authenticated, setAuthenticated] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);

  const token = localStorage.getItem('token');

  useEffect(() => {
    setAuthenticated(!!token);
  }, [location]);

  useEffect(() => {
    const fetchNotifications = async () => {
      if (!token) return;
      try {
        const { data } = await API.get('/users/follow-requests', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setNotifications(data);
      } catch (err) {
        console.error('Error loading follow requests', err);
      }
    };
    fetchNotifications();
  }, [token]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    setAuthenticated(false);
    navigate('/');
  };

  const handleAccept = async (senderId) => {
    try {
      await API.post(
        '/users/accept-follow',
        { senderId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setNotifications((prev) => prev.filter((n) => n._id !== senderId));
    } catch (err) {
      alert('Failed to accept follow request');
    }
  };

  return (
    <header className="relative z-20 shadow-md">
      {/* 🌌 Background */}
      <div className="absolute inset-0 h-full w-full -z-10">
        <img
          src={Stars}
          alt="Stars Background"
          className="w-full h-full object-cover opacity-10 animate-slow-float"
        />
      </div>

      <nav className="bg-gradient-to-r from-slate-800 via-slate-700 to-indigo-800 text-white font-body relative">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link
            to={authenticated ? '/dashboard' : '/'}
            className="text-xl font-bold font-display tracking-wide"
          >
            SkillSync
          </Link>

          {/* 🔗 Navigation Links */}
          <div className="hidden md:flex space-x-6 items-center text-sm">
            {!authenticated ? (
              <>
                <Link to="/" className="hover:text-slate-300">Home</Link>
                <Link to="/login" className="hover:text-slate-300">Login</Link>
                <Link to="/register" className="hover:text-slate-300">Signup</Link>
              </>
            ) : (
              <>
                <Link to="/dashboard" className="hover:text-slate-300">Dashboard</Link>
                <Link to="/leaderboard" className="hover:text-slate-300">Leaderboard</Link>
                <Link to="/matches" className="hover:text-slate-300">Matches</Link>
                <Link to="/schedule" className="hover:text-slate-300">Schedule</Link>
                <Link to="/rooms" className="hover:text-slate-300">Rooms</Link>
                <Link to="/chat" className="hover:text-slate-300">Chat</Link>
                <button onClick={handleLogout} className="hover:text-red-300">Logout</button>
              </>
            )}
          </div>
        </div>

        {/* 🔔 Notification - Bottom Right */}
        {authenticated && (
          <div className="absolute bottom-3 right-4">
            <div className="relative">
              <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="bg-white text-slate-800 p-2 rounded-full shadow hover:bg-gray-100 transition-all relative"
              >
                <Bell className="w-5 h-5" />
                {notifications.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs px-1 rounded-full">
                    {notifications.length}
                  </span>
                )}
              </button>

              {showDropdown && (
                <div className="absolute right-0 mt-2 w-72 bg-white shadow-xl rounded-lg p-4 z-50 text-black">
                  <h4 className="font-bold mb-2">Follow Requests</h4>
                  {notifications.length === 0 ? (
                    <p className="text-gray-600 text-sm">No new requests</p>
                  ) : (
                    notifications.map((user) => (
                      <div key={user._id} className="flex justify-between items-center mb-3">
                        <div>
                          <p className="font-semibold">{user.name}</p>
                          <p className="text-sm text-gray-600">{user.email}</p>
                        </div>
                        <button
                          onClick={() => handleAccept(user._id)}
                          className="bg-emerald-600 text-white px-3 py-1 rounded text-sm hover:bg-emerald-700"
                        >
                          Accept
                        </button>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </nav>
    </header>
  );
};

export default Navbar;
