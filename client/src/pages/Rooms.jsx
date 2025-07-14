import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Copy, CheckCircle } from 'lucide-react';
import axios from 'axios';
import toast, { Toaster } from 'react-hot-toast';
import { io } from 'socket.io-client';

import {
  getActiveRooms,
  getRoomHistory,
  leaveRoom,
  joinRoom
} from '../services/roomAPI';

const socket = io('http://localhost:5000');

const Room = () => {
  const navigate = useNavigate();
  const userId = localStorage.getItem('userId');

  const [roomName, setRoomName] = useState('');
  const [createPassword, setCreatePassword] = useState('');
  const [createdRoomId, setCreatedRoomId] = useState('');
  const [copied, setCopied] = useState(false);

  const [joinRoomId, setJoinRoomId] = useState('');
  const [joinPassword, setJoinPassword] = useState('');

  const [activeRooms, setActiveRooms] = useState([]);
  const [roomHistory, setRoomHistory] = useState([]);

  const fetchRooms = async () => {
    try {
      const { data: active } = await getActiveRooms(userId);
      const { data: history } = await getRoomHistory(userId);
      setActiveRooms(active);
      setRoomHistory(history);
    } catch (err) {
      console.error('❌ Error fetching rooms:', err);
      toast.error('Error loading rooms');
    }
  };

  useEffect(() => {
    if (userId) fetchRooms();


    socket.on('room-ended', () => {
      fetchRooms(); // Refresh on room end
    });

    socket.on('room-created', () => {
      fetchRooms(); // Refresh on new room
    });
    return () => {
      socket.disconnect();
    };
  }, [userId]);

  const handleCreate = async () => {
    if (!roomName || !createPassword)
      return toast.error("Room name and password required");

    const generatedRoomId = `${roomName}-${Date.now()}`;
    try {
      const res = await axios.post('http://localhost:5000/api/rooms/create', {
        roomId: generatedRoomId,
        password: createPassword,
        userId
      });

      if (res.data.success) {
        localStorage.setItem('role', 'host');
        setCreatedRoomId(generatedRoomId);
        toast.success('Room created! Redirecting...');
        socket.emit('room-created', { roomId: generatedRoomId });
        setTimeout(() => navigate(`/live/${generatedRoomId}`), 2000);
      } else {
        toast.error("Failed to create room");
      }
    } catch (err) {
      toast.error("❌ Error creating room.");
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(createdRoomId);
    setCopied(true);
    toast.success('Room ID copied!');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleJoin = async () => {
    if (!joinRoomId || !joinPassword)
      return toast.error("Room ID and password required");

    try {
      await joinRoom(joinRoomId, joinPassword, userId);
      localStorage.setItem('role', 'guest');
      navigate(`/live/${joinRoomId}`);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Unable to join room');
    }
  };

  const handleLeaveRoom = async (roomId) => {
    try {
      await leaveRoom(roomId, userId);
      await fetchRooms();
      toast.success('Left room');
    } catch (err) {
      toast.error('Could not leave room');
    }
  };

  const handleDeleteHistory = async (roomId) => {
    try {
      await axios.delete(`http://localhost:5000/api/rooms/history/${roomId}/${userId}`);
      await fetchRooms();
      toast.success('Deleted from history');
    } catch (err) {
      toast.error('Failed to delete');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-blue-100 to-white px-4 py-12 font-body text-slate-800">
      <Toaster position="top-center" />

      <div className="max-w-5xl mx-auto space-y-10">
        {/* 🎥 Create Room */}
        <div className="bg-white rounded-2xl p-6 shadow-xl border">
          <h2 className="text-2xl font-bold text-indigo-700 mb-4">🎥 Create Live Room</h2>
          <input
            type="text"
            placeholder="Room Name"
            className="w-full border px-4 py-2 rounded-md mb-3"
            value={roomName}
            onChange={(e) => setRoomName(e.target.value)}
          />
          <input
            type="password"
            placeholder="Set Password"
            className="w-full border px-4 py-2 rounded-md mb-4"
            value={createPassword}
            onChange={(e) => setCreatePassword(e.target.value)}
          />
          <button
            onClick={handleCreate}
            className="w-full bg-indigo-600 text-white py-2 rounded-md hover:bg-indigo-700"
          >
            Create & Enter Room
          </button>

          {createdRoomId && (
            <div className="mt-4 bg-green-100 border rounded p-3">
              <p className="font-semibold text-green-700">Room Created! Share this ID:</p>
              <div className="flex items-center justify-between mt-2 bg-white border rounded px-3 py-2">
                <span className="text-sm break-all">{createdRoomId}</span>
                <button onClick={handleCopy} className="text-indigo-600 hover:text-indigo-800">
                  {copied ? <CheckCircle className="w-5 h-5 text-green-600" /> : <Copy className="w-5 h-5" />}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* 🔑 Join Room */}
        <div className="bg-white rounded-2xl p-6 shadow-xl border">
          <h2 className="text-2xl font-bold text-emerald-700 mb-4">🔑 Join Live Room</h2>
          <input
            type="text"
            placeholder="Room ID"
            className="w-full border px-4 py-2 rounded-md mb-3"
            value={joinRoomId}
            onChange={(e) => setJoinRoomId(e.target.value)}
          />
          <input
            type="password"
            placeholder="Room Password"
            className="w-full border px-4 py-2 rounded-md mb-4"
            value={joinPassword}
            onChange={(e) => setJoinPassword(e.target.value)}
          />
          <button
            onClick={handleJoin}
            className="w-full bg-emerald-600 text-white py-2 rounded-md hover:bg-emerald-700"
          >
            Join Room
          </button>
        </div>

        {/* 🟢 Active Rooms */}
        <div className="bg-white rounded-2xl p-6 shadow-xl border">
          <h2 className="text-2xl font-bold text-indigo-700 mb-4">🟢 Active Rooms</h2>
          {activeRooms.length === 0 ? (
            <p className="text-gray-500">No active rooms found.</p>
          ) : (
            activeRooms.map((room) => (
              <div key={room.roomId} className="border rounded-lg p-4 mb-4 bg-indigo-50 shadow-md">
                <p><strong>Room ID:</strong> {room.roomId}</p>
                <p><strong>Host:</strong> {room.host}</p>
                <p><strong>Participants:</strong> {room.participants}</p>
                <div className="mt-3 flex gap-3">
                  <button
                    onClick={() => navigate(`/join-room?room=${room.roomId}`)}
                    className="bg-indigo-600 text-white px-4 py-1 rounded hover:bg-indigo-700"
                  >
                    Join
                  </button>
                  <button
                    onClick={() => handleLeaveRoom(room.roomId)}
                    className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                  >
                    Leave
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* 📜 Past Rooms */}
        <div className="bg-white rounded-2xl p-6 shadow-xl border">
          <h2 className="text-2xl font-bold text-slate-700 mb-4">📜 Past Rooms Joined</h2>
          {roomHistory.length === 0 ? (
            <p className="text-gray-500">No room history available.</p>
          ) : (
            roomHistory.map((room) => (
              <div key={room.roomId} className="border rounded-lg p-4 mb-4 bg-gray-50 shadow relative">
                <p><strong>Room ID:</strong> {room.roomId}</p>
                <p><strong>Host:</strong> {room.host}</p>
                <p><strong>Participants:</strong> {room.participants}</p>
                <p><strong>Joined At:</strong> {new Date(room.joinedAt).toLocaleString()}</p>
                <p><strong>Left At:</strong> {new Date(room.leftAt).toLocaleString()}</p>
                <button
                  onClick={() => handleDeleteHistory(room.roomId)}
                  className="absolute top-2 right-3 text-sm text-red-500 hover:underline"
                >
                  Delete
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Room;
