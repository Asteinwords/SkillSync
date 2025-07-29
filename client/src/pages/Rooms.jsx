// import React, { useState, useEffect } from 'react';
// import { motion, AnimatePresence } from 'framer-motion';
// import { useNavigate } from 'react-router-dom';
// import { Copy, CheckCircle, Sparkles } from 'lucide-react';
// import axios from 'axios';
// import toast, { Toaster } from 'react-hot-toast';
// import { io } from 'socket.io-client';
// import Stars from '../assets/stars.svg';

// const socket = io('http://localhost:5000');

// import {
//   getActiveRooms,
//   getRoomHistory,
//   leaveRoom,
//   joinRoom,
// } from '../services/roomAPI';

// const containerVariants = {
//   hidden: { opacity: 0 },
//   visible: {
//     opacity: 1,
//     transition: {
//       staggerChildren: 0.1,
//     },
//   },
// };

// const itemVariants = {
//   hidden: { opacity: 0, y: 30 },
//   visible: {
//     opacity: 1,
//     y: 0,
//     transition: {
//       duration: 0.5,
//       ease: 'easeOut',
//     },
//   },
// };

// const Room = () => {
//   const navigate = useNavigate();
//   const userId = localStorage.getItem('userId');

//   const [roomName, setRoomName] = useState('');
//   const [createPassword, setCreatePassword] = useState('');
//   const [createdRoomId, setCreatedRoomId] = useState('');
//   const [copied, setCopied] = useState(false);

//   const [joinRoomId, setJoinRoomId] = useState('');
//   const [joinPassword, setJoinPassword] = useState('');

//   const [activeRooms, setActiveRooms] = useState([]);
//   const [roomHistory, setRoomHistory] = useState([]);

//   const fetchRooms = async () => {
//     try {
//       const { data: active } = await getActiveRooms(userId);
//       const { data: history } = await getRoomHistory(userId);
//       setActiveRooms(active || []);
//       setRoomHistory(history || []);
//     } catch (err) {
//       console.error('❌ Error fetching rooms:', err);
//       toast.error('Error loading rooms');
//     }
//   };

//   useEffect(() => {
//     if (userId) fetchRooms();

//     socket.on('room-ended', () => {
//       fetchRooms(); // Refresh on room end
//     });

//     socket.on('room-created', () => {
//       fetchRooms(); // Refresh on new room
//     });
//     return () => {
//       socket.disconnect();
//     };
//   }, [userId]);

//   const handleCreate = async () => {
//     if (!roomName || !createPassword)
//       return toast.error('Room name and password required');

//     const generatedRoomId = `${roomName}-${Date.now()}`;
//     try {
//       const res = await axios.post('http://localhost:5000/api/rooms/create', {
//         roomId: generatedRoomId,
//         password: createPassword,
//         userId,
//       });

//       if (res.data.success) {
//         localStorage.setItem('role', 'host');
//         setCreatedRoomId(generatedRoomId);
//         toast.success('Room created! Redirecting...');
//         socket.emit('room-created', { roomId: generatedRoomId });
//         setTimeout(() => navigate(`/live/${generatedRoomId}`), 2000);
//       } else {
//         toast.error('Failed to create room');
//       }
//     } catch (err) {
//       toast.error('❌ Error creating room.');
//     }
//   };

//   const handleCopy = () => {
//     navigator.clipboard.writeText(createdRoomId);
//     setCopied(true);
//     toast.success('Room ID copied!');
//     setTimeout(() => setCopied(false), 2000);
//   };

//   const handleJoin = async () => {
//     if (!joinRoomId || !joinPassword)
//       return toast.error('Room ID and password required');

//     try {
//       await joinRoom(joinRoomId, joinPassword, userId);
//       localStorage.setItem('role', 'guest');
//       navigate(`/live/${joinRoomId}`);
//     } catch (err) {
//       toast.error(err.response?.data?.error || 'Unable to join room');
//     }
//   };

//   const handleLeaveRoom = async (roomId) => {
//     try {
//       await leaveRoom(roomId, userId);
//       await fetchRooms();
//       toast.success('Left room');
//     } catch (err) {
//       toast.error('Could not leave room');
//     }
//   };

//   const handleDeleteHistory = async (roomId) => {
//     try {
//       await axios.delete(`http://localhost:5000/api/rooms/history/${roomId}/${userId}`);
//       await fetchRooms();
//       toast.success('Deleted from history');
//     } catch (err) {
//       toast.error('Failed to delete');
//     }
//   };

//   return (
//     <motion.div
//       className="relative min-h-screen bg-gradient-to-br from-blue-200 via-purple-100 to-pink-200 p-6 font-sans text-slate-800"
//       initial="hidden"
//       animate="visible"
//       variants={containerVariants}
//     >
//       {/* Stars Background */}
//       <div className="absolute inset-0 w-full h-full -z-10">
//         <img
//           src={Stars}
//           alt="Stars"
//           className="w-full h-full object-cover opacity-30 pointer-events-none animate-pulse"
//         />
//       </div>

//       <Toaster position="top-center" />

//       <div className="max-w-5xl mx-auto space-y-10">
//         {/* 🎥 Create Room */}
//         <motion.div
//           className="bg-white/90 backdrop-blur-xl rounded-3xl p-6 shadow-2xl border border-blue-300/50"
//           variants={itemVariants}
//         >
//           <motion.h2
//             className="text-2xl font-extrabold text-transparent bg-gradient-to-r from-blue-500 to-pink-500 bg-clip-text mb-4 flex items-center gap-2"
//             variants={itemVariants}
//           >
//             <Sparkles className="w-6 h-6 text-yellow-400 animate-bounce" />
//             Create Live Room
//           </motion.h2>
//           <motion.input
//             type="text"
//             placeholder="Room Name"
//             className="w-full border border-blue-300/50 bg-white/80 px-4 py-2 rounded-lg mb-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
//             value={roomName}
//             onChange={(e) => setRoomName(e.target.value)}
//             variants={itemVariants}
//           />
//           <motion.input
//             type="password"
//             placeholder="Set Password"
//             className="w-full border border-blue-300/50 bg-white/80 px-4 py-2 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
//             value={createPassword}
//             onChange={(e) => setCreatePassword(e.target.value)}
//             variants={itemVariants}
//           />
//           <motion.button
//             onClick={handleCreate}
//             className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition"
//             whileHover={{ scale: 1.02 }}
//             transition={{ duration: 0.3 }}
//             variants={itemVariants}
//           >
//             Create & Enter Room
//           </motion.button>

//           {createdRoomId && (
//             <motion.div
//               className="mt-4 bg-green-100 border border-blue-300/50 rounded-2xl p-3 shadow-xl"
//               variants={itemVariants}
//             >
//               <p className="font-semibold text-green-700">Room Created! Share this ID:</p>
//               <div className="flex items-center justify-between mt-2 bg-white/90 border border-blue-300/50 rounded-lg px-3 py-2">
//                 <span className="text-sm break-all">{createdRoomId}</span>
//                 <motion.button
//                   onClick={handleCopy}
//                   className="text-blue-600 hover:text-blue-800"
//                   whileHover={{ scale: 1.1 }}
//                   transition={{ duration: 0.3 }}
//                 >
//                   {copied ? <CheckCircle className="w-5 h-5 text-green-600" /> : <Copy className="w-5 h-5" />}
//                 </motion.button>
//               </div>
//             </motion.div>
//           )}
//         </motion.div>

//         {/* 🔑 Join Room */}
//         <motion.div
//           className="bg-white/90 backdrop-blur-xl rounded-3xl p-6 shadow-2xl border border-blue-300/50"
//           variants={itemVariants}
//         >
//           <motion.h2
//             className="text-2xl font-extrabold text-transparent bg-gradient-to-r from-blue-500 to-pink-500 bg-clip-text mb-4 flex items-center gap-2"
//             variants={itemVariants}
//           >
//             <Sparkles className="w-6 h-6 text-yellow-400 animate-bounce" />
//             Join Live Room
//           </motion.h2>
//           <motion.input
//             type="text"
//             placeholder="Room ID"
//             className="w-full border border-blue-300/50 bg-white/80 px-4 py-2 rounded-lg mb-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
//             value={joinRoomId}
//             onChange={(e) => setJoinRoomId(e.target.value)}
//             variants={itemVariants}
//           />
//           <motion.input
//             type="password"
//             placeholder="Room Password"
//             className="w-full border border-blue-300/50 bg-white/80 px-4 py-2 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
//             value={joinPassword}
//             onChange={(e) => setJoinPassword(e.target.value)}
//             variants={itemVariants}
//           />
//           <motion.button
//             onClick={handleJoin}
//             className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition"
//             whileHover={{ scale: 1.02 }}
//             transition={{ duration: 0.3 }}
//             variants={itemVariants}
//           >
//             Join Room
//           </motion.button>
//         </motion.div>

//         {/* 🟢 Active Rooms */}
//         <motion.div
//           className="bg-white/90 backdrop-blur-xl rounded-3xl p-6 shadow-2xl border border-blue-300/50"
//           variants={itemVariants}
//         >
//           <motion.h2
//             className="text-2xl font-extrabold text-transparent bg-gradient-to-r from-blue-500 to-pink-500 bg-clip-text mb-4 flex items-center gap-2"
//             variants={itemVariants}
//           >
//             <Sparkles className="w-6 h-6 text-yellow-400 animate-bounce" />
//             Active Rooms
//           </motion.h2>
//           {activeRooms.length === 0 ? (
//             <motion.p
//               className="text-gray-500 bg-white/90 rounded-2xl p-4 shadow-xl border border-blue-300/50"
//               variants={itemVariants}
//             >
//               No active rooms found.
//             </motion.p>
//           ) : (
//             <AnimatePresence>
//               {activeRooms.map((room) => (
//                 <motion.div
//                   key={room.roomId}
//                   className="bg-white/90 border border-blue-300/50 rounded-2xl p-4 mb-4 shadow-xl hover:shadow-2xl transition"
//                   initial="hidden"
//                   animate="visible"
//                   exit="hidden"
//                   variants={itemVariants}
//                 >
//                   <div>
//                     <p><strong>Room ID:</strong> {room.roomId}</p>
//                     <p><strong>Host:</strong> {room.host}</p>
//                     <p><strong>Participants:</strong> {room.participants}</p>
//                   </div>
//                   <div className="mt-3 flex gap-3">
//                     <motion.button
//                       onClick={() => navigate(`/join-room?room=${room.roomId}`)}
//                       className="bg-blue-600 text-white px-4 py-1 rounded-lg hover:bg-blue-700"
//                       whileHover={{ scale: 1.02 }}
//                       transition={{ duration: 0.3 }}
//                     >
//                       Join
//                     </motion.button>
//                     <motion.button
//                       onClick={() => handleLeaveRoom(room.roomId)}
//                       className="bg-red-600 text-white px-3 py-1 rounded-lg hover:bg-red-700"
//                       whileHover={{ scale: 1.02 }}
//                       transition={{ duration: 0.3 }}
//                     >
//                       Leave
//                     </motion.button>
//                   </div>
//                 </motion.div>
//               ))}
//             </AnimatePresence>
//           )}
//         </motion.div>

//         {/* 📜 Past Rooms */}
//         <motion.div
//           className="bg-white/90 backdrop-blur-xl rounded-3xl p-6 shadow-2xl border border-blue-300/50"
//           variants={itemVariants}
//         >
//           <motion.h2
//             className="text-2xl font-extrabold text-transparent bg-gradient-to-r from-blue-500 to-pink-500 bg-clip-text mb-4 flex items-center gap-2"
//             variants={itemVariants}
//           >
//             <Sparkles className="w-6 h-6 text-yellow-400 animate-bounce" />
//             Past Rooms Joined
//           </motion.h2>
//           {roomHistory.length === 0 ? (
//             <motion.p
//               className="text-gray-500 bg-white/90 rounded-2xl p-4 shadow-xl border border-blue-300/50"
//               variants={itemVariants}
//             >
//               No room history available.
//             </motion.p>
//           ) : (
//             <AnimatePresence>
//               {roomHistory.map((room) => (
//                 <motion.div
//                   key={room.roomId}
//                   className="bg-white/90 border border-blue-300/50 rounded-2xl p-4 mb-4 shadow-xl hover:shadow-2xl transition relative"
//                   initial="hidden"
//                   animate="visible"
//                   exit="hidden"
//                   variants={itemVariants}
//                 >
//                   <div>
//                     <p><strong>Room ID:</strong> {room.roomId}</p>
//                     <p><strong>Host:</strong> {room.host}</p>
//                     <p><strong>Participants:</strong> {room.participants}</p>
//                     <p><strong>Joined At:</strong> {new Date(room.joinedAt).toLocaleString()}</p>
//                     <p><strong>Left At:</strong> {new Date(room.leftAt).toLocaleString()}</p>
//                   </div>
//                   <motion.button
//                     onClick={() => handleDeleteHistory(room.roomId)}
//                     className="absolute top-2 right-3 text-sm text-red-500 hover:text-red-700 hover:underline"
//                     whileHover={{ scale: 1.1 }}
//                     transition={{ duration: 0.3 }}
//                   >
//                     Delete
//                   </motion.button>
//                 </motion.div>
//               ))}
//             </AnimatePresence>
//           )}
//         </motion.div>
//       </div>
//     </motion.div>
//   );
// };

// // export default Room;
// import React, { useState, useEffect } from 'react';
// import { motion, AnimatePresence } from 'framer-motion';
// import { useNavigate, useLocation } from 'react-router-dom';
// import { Copy, CheckCircle, Sparkles } from 'lucide-react';
// import axios from 'axios';
// import toast, { Toaster } from 'react-hot-toast';
// import { io } from 'socket.io-client';
// import Stars from '../assets/stars.svg';

// import {
//   getActiveRooms,
//   getRoomHistory,
//   leaveRoom,
//   joinRoom,
// } from '../services/roomAPI';

// const containerVariants = {
//   hidden: { opacity: 0 },
//   visible: {
//     opacity: 1,
//     transition: {
//       staggerChildren: 0.1,
//     },
//   },
// };

// const itemVariants = {
//   hidden: { opacity: 0, y: 30 },
//   visible: {
//     opacity: 1,
//     y: 0,
//     transition: {
//       duration: 0.5,
//       ease: 'easeOut',
//     },
//   },
// };

// const Room = () => {
//   const navigate = useNavigate();
//   const location = useLocation();
//   const userId = localStorage.getItem('userId');
//   const [socket, setSocket] = useState(null);

//   const [roomName, setRoomName] = useState('');
//   const [createPassword, setCreatePassword] = useState('');
//   const [createdRoomId, setCreatedRoomId] = useState('');
//   const [copied, setCopied] = useState(false);

//   const [joinRoomId, setJoinRoomId] = useState('');
//   const [joinPassword, setJoinPassword] = useState('');

//   const [activeRooms, setActiveRooms] = useState([]);
//   const [roomHistory, setRoomHistory] = useState([]);

// //  const fetchRooms = async () => {
// //   try {
// //     console.log('[Room] Fetching rooms for userId:', userId);
// //     const { data: active } = await getActiveRooms(userId);
// //     const { data: history } = await getRoomHistory(userId);
// //     console.log('[Room] Active rooms:', active);
// //     console.log('[Room] Room history:', history);
// //     setActiveRooms(active || []);
// //     setRoomHistory(history || []);
// //   } catch (err) {
// //     console.error('[Room] Error fetching rooms:', err);
// //     toast.error('Error loading rooms');
// //   }
// // };
// const fetchActiveRooms = async () => {
//   try {
//     console.log('[Room] Fetching active rooms for userId:', userId);
//     const { data: active } = await getActiveRooms(userId);
//     setActiveRooms(active || []);
//   } catch (err) {
//     console.error('[Room] Error fetching active rooms:', err);
//     toast.error('Error loading active rooms');
//   }
// };

// const fetchRoomHistory = async () => {
//   try {
//     console.log('[Room] Fetching room history for userId:', userId);
//     const { data: history } = await getRoomHistory(userId);
//     setRoomHistory(history || []);
//   } catch (err) {
//     console.error('[Room] Error fetching room history:', err);
//     toast.error('Error loading room history');
//   }
// };

// const fetchAllRooms = async () => {
//   await Promise.all([fetchActiveRooms(), fetchRoomHistory()]);
// };

// useEffect(() => {
//   if (!userId) {
//     toast.error('Please log in to access rooms');
//     navigate('/login');
//     return;
//   }

//   const newSocket = io('http://localhost:5000', { forceNew: true });
//   setSocket(newSocket);

//   fetchAllRooms();

//   newSocket.on('room-created', () => {
//     console.log('[Room] room-created event received');
//     fetchActiveRooms();
//   });

//   newSocket.on('room-ended', () => {
//     console.log('[Room] room-ended event received');
//     fetchAllRooms();
//   });

//   newSocket.on('user-joined', () => {
//     console.log('[Room] user-joined event received');
//     fetchActiveRooms();
//   });

//   newSocket.on('leave-room', ({ userId: leavingUserId }) => {
//     console.log('[Room] leave-room event received for user:', leavingUserId);
//     fetchAllRooms();
//   });

//   newSocket.on('error', (message) => {
//     console.log('[Room] Error received:', message);
//     toast.error(message);
//   });

//   return () => {
//     console.log('[Room] Cleaning up socket listeners');
//     newSocket.off('room-created');
//     newSocket.off('room-ended');
//     newSocket.off('user-joined');
//     newSocket.off('leave-room');
//     newSocket.off('error');
//     newSocket.disconnect();
//   };
// }, [userId, navigate]);

//   // useEffect(() => {
//   //   console.log('[Room] userId from localStorage:', userId);
//   //   if (!userId) {
//   //     console.error('[Room] No userId found, redirecting to login');
//   //     toast.error('Please log in to access rooms');
//   //     navigate('/login');
//   //     return;
//   //   }

//   //   const newSocket = io('http://localhost:5000', { forceNew: true });
//   //   setSocket(newSocket);

//   //   fetchRooms();

//   //   newSocket.on('room-created', () => {
//   //     console.log('[Room] room-created event received');
//   //     fetchRooms();
//   //   });

//   //   newSocket.on('room-ended', () => {
//   //     console.log('[Room] room-ended event received');
//   //     fetchRooms();
//   //   });

//   //   newSocket.on('user-joined', () => {
//   //     console.log('[Room] user-joined event received');
//   //     fetchRooms();
//   //   });

//   //   newSocket.on('leave-room', ({ userId: leavingUserId }) => {
//   //     console.log('[Room] leave-room event received for user:', leavingUserId);
//   //     setTimeout(() => {
//   //       console.log('[Room] Fetching rooms after leave-room delay');
//   //       fetchRooms();
//   //     }, 1000);
//   //   });

//   //   newSocket.on('error', (message) => {
//   //     console.log('[Room] Error received:', message);
//   //     toast.error(message);
//   //   });

//   //   return () => {
//   //     console.log('[Room] Cleaning up socket listeners');
//   //     newSocket.off('room-created');
//   //     newSocket.off('room-ended');
//   //     newSocket.off('user-joined');
//   //     newSocket.off('leave-room');
//   //     newSocket.off('error');
//   //     newSocket.disconnect();
//   //   };
//   // }, [userId, navigate]);

//   // Trigger fetchRooms when navigating to /dashboard
//   useEffect(() => {
//     if (location.pathname === '/dashboard') {
//       console.log('[Room] Navigated to /dashboard, fetching rooms');
//       fetchRooms();
//     }
//   }, [location.pathname]);

//   const handleCreate = async () => {
//     if (!roomName || !createPassword)
//       return toast.error('Room name and password required');

//     const generatedRoomId = `${roomName}-${Date.now()}`;
//     try {
//       console.log('[Room] Creating room:', { roomId: generatedRoomId, userId });
//       const res = await axios.post('http://localhost:5000/api/rooms/create', {
//         roomId: generatedRoomId,
//         password: createPassword,
//         userId,
//       });

//       if (res.data.success) {
//         localStorage.setItem('role', 'host');
//         setCreatedRoomId(generatedRoomId);
//         toast.success('Room created! Redirecting...');
//         socket?.emit('room-created', { roomId: generatedRoomId });
//         console.log('[Room] Emitted room-created:', generatedRoomId);
//         setTimeout(() => navigate(`/live/${generatedRoomId}`), 2000);
//       } else {
//         toast.error('Failed to create room');
//       }
//     } catch (err) {
//       console.error('[Room] Create room error:', err);
//       toast.error('❌ Error creating room.');
//     }
//   };

//   const handleCopy = () => {
//     navigator.clipboard.writeText(createdRoomId);
//     setCopied(true);
//     toast.success('Room ID copied!');
//     setTimeout(() => setCopied(false), 2000);
//     console.log('[Room] Copied roomId:', createdRoomId);
//   };

//   const handleJoin = async () => {
//     if (!joinRoomId || !joinPassword)
//       return toast.error('Room ID and password required');

//     try {
//       console.log('[Room] Joining room:', { joinRoomId, userId });
//       await joinRoom(joinRoomId, joinPassword, userId);
//       localStorage.setItem('role', 'guest');
//       socket?.emit('user-joined', { roomId: joinRoomId, userId });
//       navigate(`/live/${joinRoomId}`);
//     } catch (err) {
//       console.error('[Room] Join room error:', err);
//       toast.error(err.response?.data?.error || 'Unable to join room');
//     }
//   };

//   const handleLeaveRoom = async (roomId) => {
//     try {
//       console.log('[Room] Leaving room:', { roomId, userId });
//       await leaveRoom(roomId, userId);
//       socket?.emit('leave-room', { roomId, userId });
//       console.log('[Room] Emitted leave-room from handleLeaveRoom:', { roomId, userId });
//       setTimeout(() => {
//         console.log('[Room] Fetching rooms after handleLeaveRoom delay');
//         fetchRooms();
//       }, 1000);
//     } catch (err) {
//       console.error('[Room] Leave room error:', err);
//       toast.error('Could not leave room');
//     }
//   };

//   const handleDeleteHistory = async (roomId) => {
//     try {
//       console.log('[Room] Deleting history:', { roomId, userId });
//       await axios.delete(`http://localhost:5000/api/rooms/history/${roomId}/${userId}`);
//       await fetchRooms();
//       toast.success('Deleted from history');
//     } catch (err) {
//       console.error('[Room] Delete history error:', err);
//       toast.error('Failed to delete');
//     }
//   };

//   if (!userId) {
//     return null;
//   }

//   return (
//     <motion.div
//       className="relative min-h-screen bg-gradient-to-br from-blue-200 via-purple-100 to-pink-200 p-6 font-sans text-slate-800"
//       initial="hidden"
//       animate="visible"
//       variants={containerVariants}
//     >
//       <div className="absolute inset-0 w-full h-full -z-10">
//         <img
//           src={Stars}
//           alt="Stars"
//           className="w-full h-full object-cover opacity-30 pointer-events-none animate-pulse"
//         />
//       </div>

//       <Toaster position="top-center" />

//       <div className="max-w-5xl mx-auto space-y-10">
//         <motion.div
//           className="bg-white/90 backdrop-blur-xl rounded-3xl p-6 shadow-2xl border border-blue-300/50"
//           variants={itemVariants}
//         >
//           <motion.h2
//             className="text-2xl font-extrabold text-transparent bg-gradient-to-r from-blue-500 to-pink-500 bg-clip-text mb-4 flex items-center gap-2"
//             variants={itemVariants}
//           >
//             <Sparkles className="w-6 h-6 text-yellow-400 animate-bounce" />
//             Create Live Room
//           </motion.h2>
//           <motion.input
//             type="text"
//             placeholder="Room Name"
//             className="w-full border border-blue-300/50 bg-white/80 px-4 py-2 rounded-lg mb-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
//             value={roomName}
//             onChange={(e) => setRoomName(e.target.value)}
//             variants={itemVariants}
//           />
//           <motion.input
//             type="password"
//             placeholder="Set Password"
//             className="w-full border border-blue-300/50 bg-white/80 px-4 py-2 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
//             value={createPassword}
//             onChange={(e) => setCreatePassword(e.target.value)}
//             variants={itemVariants}
//           />
//           <motion.button
//             onClick={handleCreate}
//             className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition"
//             whileHover={{ scale: 1.02 }}
//             transition={{ duration: 0.3 }}
//             variants={itemVariants}
//           >
//             Create & Enter Room
//           </motion.button>

//           {createdRoomId && (
//             <motion.div
//               className="mt-4 bg-green-100 border border-blue-300/50 rounded-2xl p-3 shadow-xl"
//               variants={itemVariants}
//             >
//               <p className="font-semibold text-green-700">Room Created! Share this ID:</p>
//               <div className="flex items-center justify-between mt-2 bg-white/90 border border-blue-300/50 rounded-lg px-3 py-2">
//                 <span className="text-sm break-all">{createdRoomId}</span>
//                 <motion.button
//                   onClick={handleCopy}
//                   className="text-blue-600 hover:text-blue-800"
//                   whileHover={{ scale: 1.1 }}
//                   transition={{ duration: 0.3 }}
//                 >
//                   {copied ? <CheckCircle className="w-5 h-5 text-green-600" /> : <Copy className="w-5 h-5" />}
//                 </motion.button>
//               </div>
//             </motion.div>
//           )}
//         </motion.div>

//         <motion.div
//           className="bg-white/90 backdrop-blur-xl rounded-3xl p-6 shadow-2xl border border-blue-300/50"
//           variants={itemVariants}
//         >
//           <motion.h2
//             className="text-2xl font-extrabold text-transparent bg-gradient-to-r from-blue-500 to-pink-500 bg-clip-text mb-4 flex items-center gap-2"
//             variants={itemVariants}
//           >
//             <Sparkles className="w-6 h-6 text-yellow-400 animate-bounce" />
//             Join Live Room
//           </motion.h2>
//           <motion.input
//             type="text"
//             placeholder="Room ID"
//             className="w-full border border-blue-300/50 bg-white/80 px-4 py-2 rounded-lg mb-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
//             value={joinRoomId}
//             onChange={(e) => setJoinRoomId(e.target.value)}
//             variants={itemVariants}
//           />
//           <motion.input
//             type="password"
//             placeholder="Room Password"
//             className="w-full border border-blue-300/50 bg-white/80 px-4 py-2 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
//             value={joinPassword}
//             onChange={(e) => setJoinPassword(e.target.value)}
//             variants={itemVariants}
//           />
//           <motion.button
//             onClick={handleJoin}
//             className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition"
//             whileHover={{ scale: 1.02 }}
//             transition={{ duration: 0.3 }}
//             variants={itemVariants}
//           >
//             Join Room
//           </motion.button>
//         </motion.div>

//         <motion.div
//           className="bg-white/90 backdrop-blur-xl rounded-3xl p-6 shadow-2xl border border-blue-300/50"
//           variants={itemVariants}
//         >
//           <motion.h2
//             className="text-2xl font-extrabold text-transparent bg-gradient-to-r from-blue-500 to-pink-500 bg-clip-text mb-4 flex items-center gap-2"
//             variants={itemVariants}
//           >
//             <Sparkles className="w-6 h-6 text-yellow-400 animate-bounce" />
//             Active Rooms
//           </motion.h2>
//           {activeRooms.length === 0 ? (
//             <motion.p
//               className="text-gray-500 bg-white/90 rounded-2xl p-4 shadow-xl border border-blue-300/50"
//               variants={itemVariants}
//             >
//               No active rooms found.
//             </motion.p>
//           ) : (
//             <AnimatePresence>
//               {activeRooms.map((room) => (
//                 <motion.div
//                   key={room.roomId}
//                   className="bg-white/90 border border-blue-300/50 rounded-2xl p-4 mb-4 shadow-xl hover:shadow-2xl transition"
//                   initial="hidden"
//                   animate="visible"
//                   exit="hidden"
//                   variants={itemVariants}
//                 >
//                   <div>
//                     <p><strong>Room ID:</strong> {room.roomId}</p>
//                     <p><strong>Host:</strong> {room.host}</p>
//                     <p><strong>Participants:</strong> {room.participants}</p>
//                   </div>
//                   <div className="mt-3 flex gap-3">
//                     <motion.button
//                       onClick={() => navigate(`/live/${room.roomId}`)}
//                       className="bg-blue-600 text-white px-4 py-1 rounded-lg hover:bg-blue-700"
//                       whileHover={{ scale: 1.02 }}
//                       transition={{ duration: 0.3 }}
//                     >
//                       Join
//                     </motion.button>
//                     <motion.button
//                       onClick={() => handleLeaveRoom(room.roomId)}
//                       className="bg-red-600 text-white px-3 py-1 rounded-lg hover:bg-red-700"
//                       whileHover={{ scale: 1.02 }}
//                       transition={{ duration: 0.3 }}
//                     >
//                       Leave
//                     </motion.button>
//                   </div>
//                 </motion.div>
//               ))}
//             </AnimatePresence>
//           )}
//         </motion.div>

//         <motion.div
//           className="bg-white/90 backdrop-blur-xl rounded-3xl p-6 shadow-2xl border border-blue-300/50"
//           variants={itemVariants}
//         >
//           <motion.h2
//             className="text-2xl font-extrabold text-transparent bg-gradient-to-r from-blue-500 to-pink-500 bg-clip-text mb-4 flex items-center gap-2"
//             variants={itemVariants}
//           >
//             <Sparkles className="w-6 h-6 text-yellow-400 animate-bounce" />
//             Past Rooms Joined
//           </motion.h2>
//           {roomHistory.length === 0 ? (
//             <motion.p
//               className="text-gray-500 bg-white/90 rounded-2xl p-4 shadow-xl border border-blue-300/50"
//               variants={itemVariants}
//             >
//               No room history available.
//             </motion.p>
//           ) : (
//             <AnimatePresence>
//               {roomHistory.map((room) => (
//                 <motion.div
//                   key={room.roomId}
//                   className="bg-white/90 border border-blue-300/50 rounded-2xl p-4 mb-4 shadow-xl hover:shadow-2xl transition relative"
//                   initial="hidden"
//                   animate="visible"
//                   exit="hidden"
//                   variants={itemVariants}
//                 >
//                   <div>
//                     <p><strong>Room ID:</strong> {room.roomId}</p>
//                     <p><strong>Host:</strong> {room.host}</p>
//                     <p><strong>Participants:</strong> {room.participants}</p>
//                     <p><strong>Joined At:</strong> {new Date(room.joinedAt).toLocaleString()}</p>
//                     <p><strong>Left At:</strong> {new Date(room.leftAt).toLocaleString()}</p>
//                   </div>
//                   <motion.button
//                     onClick={() => handleDeleteHistory(room.roomId)}
//                     className="absolute top-2 right-3 text-sm text-red-500 hover:text-red-700 hover:underline"
//                     whileHover={{ scale: 1.1 }}
//                     transition={{ duration: 0.3 }}
//                   >
//                     Delete
//                   </motion.button>
//                 </motion.div>
//               ))}
//             </AnimatePresence>
//           )}
//         </motion.div>
//       </div>
//     </motion.div>
//   );
// };

// export default Room;
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { toast, Toaster } from 'react-hot-toast';
import { Copy, CheckCircle, Sparkles } from 'lucide-react';
import API from '../services/api';
import Stars from '../assets/stars.svg';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: 'easeOut',
    },
  },
};

const Room = () => {
  const [createForm, setCreateForm] = useState({ name: '', password: '' });
  const [joinForm, setJoinForm] = useState({ roomId: '', password: '' });
  const [pastRooms, setPastRooms] = useState([]);
  const [createdRoomId, setCreatedRoomId] = useState('');
  const [copied, setCopied] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPastRooms = async () => {
      try {
        const userId = localStorage.getItem('userId');
        if (!userId) {
          toast.error('Please log in to access rooms');
          navigate('/login');
          return;
        }
        const res = await API.get(`/rooms/past/${userId}`);
        setPastRooms(res.data || []);
      } catch (err) {
        console.error('[Room] Error fetching past rooms:', err);
        toast.error('Error fetching past rooms');
      }
    };
    fetchPastRooms();
  }, [navigate]);

  const handleCreateChange = (e) =>
    setCreateForm({ ...createForm, [e.target.name]: e.target.value });

  const handleJoinChange = (e) =>
    setJoinForm({ ...joinForm, [e.target.name]: e.target.value });

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    try {
      const userId = localStorage.getItem('userId');
      const res = await API.post('/rooms/create', { ...createForm, userId });
      setCreatedRoomId(res.data.roomId);
      toast.success('Room created! Copy the Room ID to share.');
      navigate(`/live-room/${res.data.roomId}`);
    } catch (err) {
      console.error('[Room] Error creating room:', err);
      toast.error('Error creating room');
    }
  };

  const handleJoinSubmit = async (e) => {
    e.preventDefault();
    try {
      const userId = localStorage.getItem('userId');
      const res = await API.post('/rooms/join', { ...joinForm, userId });
      toast.success('Joined room successfully');
      navigate(`/live-room/${joinForm.roomId}`);
    } catch (err) {
      console.error('[Room] Error joining room:', err);
      toast.error('Error joining room');
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(createdRoomId);
    setCopied(true);
    toast.success('Room ID copied!');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDeleteHistory = async (roomId) => {
    try {
      const userId = localStorage.getItem('userId');
      console.log('[Room] Deleting history:', { roomId, userId });
      await API.delete(`/rooms/history/${roomId}/${userId}`);
      const res = await API.get(`/rooms/past/${userId}`);
      setPastRooms(res.data || []);
      toast.success('Deleted from history');
    } catch (err) {
      console.error('[Room] Delete history error:', err);
      toast.error('Failed to delete');
    }
  };

  return (
    <motion.div
      className="relative min-h-screen bg-gradient-to-br from-blue-200 via-purple-100 to-pink-200 p-6 font-sans text-slate-800"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <div className="absolute inset-0 w-full h-full -z-10">
        <img
          src={Stars}
          alt="Stars"
          className="w-full h-full object-cover opacity-30 pointer-events-none animate-pulse"
        />
      </div>

      <Toaster position="top-center" />

      <div className="max-w-5xl mx-auto space-y-10">
        {/* Create Room */}
        <motion.div
          className="bg-white/90 backdrop-blur-xl rounded-3xl p-6 shadow-2xl border border-blue-300/50"
          variants={itemVariants}
        >
          <motion.h2
            className="text-2xl font-extrabold text-transparent bg-gradient-to-r from-blue-500 to-pink-500 bg-clip-text mb-4 flex items-center gap-2"
            variants={itemVariants}
          >
            <Sparkles className="w-6 h-6 text-yellow-400 animate-bounce" />
            Create Live Room
          </motion.h2>
          <form onSubmit={handleCreateSubmit} className="space-y-4">
            <motion.input
              type="text"
              name="name"
              placeholder="Room Name"
              className="w-full border border-blue-300/50 bg-white/80 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={createForm.name}
              onChange={handleCreateChange}
              required
              variants={itemVariants}
            />
            <motion.input
              type="password"
              name="password"
              placeholder="Set Password"
              className="w-full border border-blue-300/50 bg-white/80 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={createForm.password}
              onChange={handleCreateChange}
              required
              variants={itemVariants}
            />
            <motion.button
              type="submit"
              className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition"
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.3 }}
              variants={itemVariants}
            >
              Create & Enter Room
            </motion.button>
          </form>

          {createdRoomId && (
            <motion.div
              className="mt-4 bg-green-100 border border-blue-300/50 rounded-2xl p-3 shadow-xl"
              variants={itemVariants}
            >
              <p className="font-semibold text-green-700">Room Created! Share this ID:</p>
              <div className="flex items-center justify-between mt-2 bg-white/90 border border-blue-300/50 rounded-lg px-3 py-2">
                <span className="text-sm break-all">{createdRoomId}</span>
                <motion.button
                  onClick={handleCopy}
                  className="text-blue-600 hover:text-blue-800"
                  whileHover={{ scale: 1.1 }}
                  transition={{ duration: 0.3 }}
                >
                  {copied ? <CheckCircle className="w-5 h-5 text-green-600" /> : <Copy className="w-5 h-5" />}
                </motion.button>
              </div>
            </motion.div>
          )}
        </motion.div>

        {/* Join Room */}
        <motion.div
          className="bg-white/90 backdrop-blur-xl rounded-3xl p-6 shadow-2xl border border-blue-300/50"
          variants={itemVariants}
        >
          <motion.h2
            className="text-2xl font-extrabold text-transparent bg-gradient-to-r from-blue-500 to-pink-500 bg-clip-text mb-4 flex items-center gap-2"
            variants={itemVariants}
          >
            <Sparkles className="w-6 h-6 text-yellow-400 animate-bounce" />
            Join Live Room
          </motion.h2>
          <form onSubmit={handleJoinSubmit} className="space-y-4">
            <motion.input
              type="text"
              name="roomId"
              placeholder="Room ID"
              className="w-full border border-blue-300/50 bg-white/80 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={joinForm.roomId}
              onChange={handleJoinChange}
              required
              variants={itemVariants}
            />
            <motion.input
              type="password"
              name="password"
              placeholder="Room Password"
              className="w-full border border-blue-300/50 bg-white/80 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={joinForm.password}
              onChange={handleJoinChange}
              required
              variants={itemVariants}
            />
            <motion.button
              type="submit"
              className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition"
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.3 }}
              variants={itemVariants}
            >
              Join Room
            </motion.button>
          </form>
        </motion.div>

        {/* Past Rooms */}
        <motion.div
          className="bg-white/90 backdrop-blur-xl rounded-3xl p-6 shadow-2xl border border-blue-300/50"
          variants={itemVariants}
        >
          <motion.h2
            className="text-2xl font-extrabold text-transparent bg-gradient-to-r from-blue-500 to-pink-500 bg-clip-text mb-4 flex items-center gap-2"
            variants={itemVariants}
          >
            <Sparkles className="w-6 h-6 text-yellow-400 animate-bounce" />
            Past Rooms Joined
          </motion.h2>
          {pastRooms.length === 0 ? (
            <motion.p
              className="text-gray-500 bg-white/90 rounded-2xl p-4 shadow-xl border border-blue-300/50"
              variants={itemVariants}
            >
              No past rooms found.
            </motion.p>
          ) : (
            <AnimatePresence>
              {pastRooms.map((room) => {
                const userId = localStorage.getItem('userId');
                const participant = room.participants.find(
                  (p) => p.userId && p.userId.toString() === userId
                );
                return (
                  <motion.div
                    key={room._id}
                    className="bg-white/90 border border-blue-300/50 rounded-2xl p-4 mb-4 shadow-xl hover:shadow-2xl transition relative"
                    initial="hidden"
                    animate="visible"
                    exit="hidden"
                    variants={itemVariants}
                  >
                    <div>
                      <p><strong>Room Name:</strong> {room.name}</p>
                      <p><strong>Room ID:</strong> {room.roomId}</p>
                      <p><strong>Host:</strong> {room.host?.email || 'Unknown'}</p>
                      <p><strong>Created:</strong> {new Date(room.createdAt).toLocaleString()}</p>
                      {room.endedAt && (
                        <p><strong>Ended:</strong> {new Date(room.endedAt).toLocaleString()}</p>
                      )}
                      {participant && participant.joinedAt && (
                        <p><strong>Joined:</strong> {new Date(participant.joinedAt).toLocaleString()}</p>
                      )}
                      {participant && participant.leftAt && (
                        <p><strong>Left:</strong> {new Date(participant.leftAt).toLocaleString()}</p>
                      )}
                      <p><strong>Total Participants:</strong> {room.totalParticipants}</p>
                    </div>
                    <motion.button
                      onClick={() => handleDeleteHistory(room.roomId)}
                      className="absolute top-2 right-3 text-sm text-red-500 hover:text-red-700 hover:underline"
                      whileHover={{ scale: 1.1 }}
                      transition={{ duration: 0.3 }}
                    >
                      Delete
                    </motion.button>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          )}
        </motion.div>
      </div>
    </motion.div>
  );
};

export default Room;

// import React, { useState, useEffect } from 'react';
// import { motion, AnimatePresence } from 'framer-motion';
// import { useNavigate, useLocation } from 'react-router-dom';
// import { Copy, CheckCircle, Sparkles } from 'lucide-react';
// import axios from 'axios';
// import toast, { Toaster } from 'react-hot-toast';
// import { io } from 'socket.io-client';
// import Stars from '../assets/stars.svg';

// import {
//   getActiveRooms,
//   getRoomHistory,
//   leaveRoom,
//   joinRoom,
// } from '../services/roomAPI';

// const containerVariants = {
//   hidden: { opacity: 0 },
//   visible: {
//     opacity: 1,
//     transition: {
//       staggerChildren: 0.1,
//     },
//   },
// };

// const itemVariants = {
//   hidden: { opacity: 0, y: 30 },
//   visible: {
//     opacity: 1,
//     y: 0,
//     transition: {
//       duration: 0.5,
//       ease: 'easeOut',
//     },
//   },
// };

// const Room = () => {
//   const navigate = useNavigate();
//   const location = useLocation();
//   const userId = localStorage.getItem('userId');
//   const [socket, setSocket] = useState(null);

//   const [roomName, setRoomName] = useState('');
//   const [createPassword, setCreatePassword] = useState('');
//   const [createdRoomId, setCreatedRoomId] = useState('');
//   const [copied, setCopied] = useState(false);

//   const [joinRoomId, setJoinRoomId] = useState('');
//   const [joinPassword, setJoinPassword] = useState('');

//   const [activeRooms, setActiveRooms] = useState([]);
//   const [roomHistory, setRoomHistory] = useState([]);

//   // Flag to track if leave or end action was initiated manually by user
//   const [manualLeaveOrEnd, setManualLeaveOrEnd] = useState(false);

//   // Fetch only active rooms
//   const fetchActiveRooms = async () => {
//     try {
//       console.log('[Room] Fetching active rooms for userId:', userId);
//       const { data: active } = await getActiveRooms(userId);
//       setActiveRooms(active || []);
//     } catch (err) {
//       console.error('[Room] Error fetching active rooms:', err);
//       toast.error('Error loading active rooms');
//     }
//   };

//   // Fetch only room history (past rooms)
//   const fetchRoomHistory = async () => {
//     try {
//       console.log('[Room] Fetching room history for userId:', userId);
//       const { data: history } = await getRoomHistory(userId);
//       setRoomHistory(history || []);
//     } catch (err) {
//       console.error('[Room] Error fetching room history:', err);
//       toast.error('Error loading room history');
//     }
//   };

//   // Fetch both active rooms and past rooms
//   const fetchAllRooms = async () => {
//     await Promise.all([fetchActiveRooms(), fetchRoomHistory()]);
//   };

//   useEffect(() => {
//     console.log('[Room] userId from localStorage:', userId);
//     if (!userId) {
//       console.error('[Room] No userId found, redirecting to login');
//       toast.error('Please log in to access rooms');
//       navigate('/login');
//       return;
//     }

//     const newSocket = io('http://localhost:5000', { forceNew: true });
//     setSocket(newSocket);

//     // Initial fetch of all rooms
//     fetchAllRooms();

//     newSocket.on('room-created', () => {
//       console.log('[Room] room-created event received');
//       // Only update active rooms on room creation
//       fetchActiveRooms();
//     });

//     newSocket.on('user-joined', () => {
//       console.log('[Room] user-joined event received');
//       // Only update active rooms when new user joins
//       fetchActiveRooms();
//     });

//     newSocket.on('room-ended', () => {
//       console.log('[Room] room-ended event received');
//       if (manualLeaveOrEnd) {
//         console.log('[Room] Manual leave/end flag set, fetching all rooms...');
//         fetchAllRooms();
//         setManualLeaveOrEnd(false);
//       } else {
//         console.log('[Room] Ignored room-ended event (no manual leave/end flag)');
//       }
//     });

//     newSocket.on('leave-room', ({ userId: leavingUserId }) => {
//       console.log('[Room] leave-room event received for user:', leavingUserId);
//       if (manualLeaveOrEnd) {
//         console.log('[Room] Manual leave/end flag set, fetching all rooms...');
//         fetchAllRooms();
//         setManualLeaveOrEnd(false);
//       } else {
//         console.log('[Room] Ignored leave-room event (no manual leave/end flag)');
//       }
//     });

//     newSocket.on('error', (message) => {
//       console.log('[Room] Error received:', message);
//       toast.error(message);
//     });

//     return () => {
//       console.log('[Room] Cleaning up socket listeners');
//       newSocket.off('room-created');
//       newSocket.off('room-ended');
//       newSocket.off('user-joined');
//       newSocket.off('leave-room');
//       newSocket.off('error');
//       newSocket.disconnect();
//     };
//   }, [userId, navigate, manualLeaveOrEnd]);

//   // Trigger fetchRooms when navigating to /dashboard
//   useEffect(() => {
//     if (location.pathname === '/dashboard') {
//       console.log('[Room] Navigated to /dashboard, fetching all rooms');
//       fetchAllRooms();
//     }
//   }, [location.pathname]);

//   const handleCreate = async () => {
//     if (!roomName || !createPassword) {
//       return toast.error('Room name and password required');
//     }

//     const generatedRoomId = `${roomName}-${Date.now()}`;
//     try {
//       console.log('[Room] Creating room:', { roomId: generatedRoomId, userId });
//       const res = await axios.post('http://localhost:5000/api/rooms/create', {
//         roomId: generatedRoomId,
//         password: createPassword,
//         userId,
//       });

//       if (res.data.success) {
//         localStorage.setItem('role', 'host');
//         setCreatedRoomId(generatedRoomId);
//         toast.success('Room created! Redirecting...');
//         socket?.emit('room-created', { roomId: generatedRoomId });
//         console.log('[Room] Emitted room-created:', generatedRoomId);
//         setTimeout(() => navigate(`/live/${generatedRoomId}`), 2000);
//       } else {
//         toast.error('Failed to create room');
//       }
//     } catch (err) {
//       console.error('[Room] Create room error:', err);
//       toast.error('❌ Error creating room.');
//     }
//   };

//   const handleCopy = () => {
//     navigator.clipboard.writeText(createdRoomId);
//     setCopied(true);
//     toast.success('Room ID copied!');
//     setTimeout(() => setCopied(false), 2000);
//     console.log('[Room] Copied roomId:', createdRoomId);
//   };

//   const handleJoin = async () => {
//     if (!joinRoomId || !joinPassword) {
//       return toast.error('Room ID and password required');
//     }

//     try {
//       console.log('[Room] Joining room:', { joinRoomId, userId });
//       await joinRoom(joinRoomId, joinPassword, userId);
//       localStorage.setItem('role', 'guest');
//       socket?.emit('user-joined', { roomId: joinRoomId, userId });
//       navigate(`/live/${joinRoomId}`);
//     } catch (err) {
//       console.error('[Room] Join room error:', err);
//       toast.error(err.response?.data?.error || 'Unable to join room');
//     }
//   };

//   const handleLeaveRoom = async (roomId) => {
//     try {
//       console.log('[Room] Leaving room:', { roomId, userId });
//       setManualLeaveOrEnd(true);  // Flag manual leave
//       await leaveRoom(roomId, userId);
//       socket?.emit('leave-room', { roomId, userId });
//       console.log('[Room] Emitted leave-room from handleLeaveRoom:', { roomId, userId });
//       // Immediately refresh all rooms
//       await fetchAllRooms();
//     } catch (err) {
//       console.error('[Room] Leave room error:', err);
//       toast.error('Could not leave room');
//     }
//   };

//   const handleDeleteHistory = async (roomId) => {
//     try {
//       console.log('[Room] Deleting history:', { roomId, userId });
//       await axios.delete(`http://localhost:5000/api/rooms/history/${roomId}/${userId}`);
//       await fetchAllRooms();
//       toast.success('Deleted from history');
//     } catch (err) {
//       console.error('[Room] Delete history error:', err);
//       toast.error('Failed to delete');
//     }
//   };

//   if (!userId) {
//     return null;
//   }

//   return (
//     <motion.div
//       className="relative min-h-screen bg-gradient-to-br from-blue-200 via-purple-100 to-pink-200 p-6 font-sans text-slate-800"
//       initial="hidden"
//       animate="visible"
//       variants={containerVariants}
//     >
//       <div className="absolute inset-0 w-full h-full -z-10">
//         <img
//           src={Stars}
//           alt="Stars"
//           className="w-full h-full object-cover opacity-30 pointer-events-none animate-pulse"
//         />
//       </div>

//       <Toaster position="top-center" />

//       <div className="max-w-5xl mx-auto space-y-10">
//         {/* Create Live Room */}
//         <motion.div
//           className="bg-white/90 backdrop-blur-xl rounded-3xl p-6 shadow-2xl border border-blue-300/50"
//           variants={itemVariants}
//         >
//           <motion.h2
//             className="text-2xl font-extrabold text-transparent bg-gradient-to-r from-blue-500 to-pink-500 bg-clip-text mb-4 flex items-center gap-2"
//             variants={itemVariants}
//           >
//             <Sparkles className="w-6 h-6 text-yellow-400 animate-bounce" />
//             Create Live Room
//           </motion.h2>
//           <motion.input
//             type="text"
//             placeholder="Room Name"
//             className="w-full border border-blue-300/50 bg-white/80 px-4 py-2 rounded-lg mb-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
//             value={roomName}
//             onChange={(e) => setRoomName(e.target.value)}
//             variants={itemVariants}
//           />
//           <motion.input
//             type="password"
//             placeholder="Set Password"
//             className="w-full border border-blue-300/50 bg-white/80 px-4 py-2 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
//             value={createPassword}
//             onChange={(e) => setCreatePassword(e.target.value)}
//             variants={itemVariants}
//           />
//           <motion.button
//             onClick={handleCreate}
//             className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition"
//             whileHover={{ scale: 1.02 }}
//             transition={{ duration: 0.3 }}
//             variants={itemVariants}
//           >
//             Create & Enter Room
//           </motion.button>

//           {createdRoomId && (
//             <motion.div
//               className="mt-4 bg-green-100 border border-blue-300/50 rounded-2xl p-3 shadow-xl"
//               variants={itemVariants}
//             >
//               <p className="font-semibold text-green-700">Room Created! Share this ID:</p>
//               <div className="flex items-center justify-between mt-2 bg-white/90 border border-blue-300/50 rounded-lg px-3 py-2">
//                 <span className="text-sm break-all">{createdRoomId}</span>
//                 <motion.button
//                   onClick={handleCopy}
//                   className="text-blue-600 hover:text-blue-800"
//                   whileHover={{ scale: 1.1 }}
//                   transition={{ duration: 0.3 }}
//                 >
//                   {copied ? <CheckCircle className="w-5 h-5 text-green-600" /> : <Copy className="w-5 h-5" />}
//                 </motion.button>
//               </div>
//             </motion.div>
//           )}
//         </motion.div>

//         {/* Join Live Room */}
//         <motion.div
//           className="bg-white/90 backdrop-blur-xl rounded-3xl p-6 shadow-2xl border border-blue-300/50"
//           variants={itemVariants}
//         >
//           <motion.h2
//             className="text-2xl font-extrabold text-transparent bg-gradient-to-r from-blue-500 to-pink-500 bg-clip-text mb-4 flex items-center gap-2"
//             variants={itemVariants}
//           >
//             <Sparkles className="w-6 h-6 text-yellow-400 animate-bounce" />
//             Join Live Room
//           </motion.h2>
//           <motion.input
//             type="text"
//             placeholder="Room ID"
//             className="w-full border border-blue-300/50 bg-white/80 px-4 py-2 rounded-lg mb-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
//             value={joinRoomId}
//             onChange={(e) => setJoinRoomId(e.target.value)}
//             variants={itemVariants}
//           />
//           <motion.input
//             type="password"
//             placeholder="Room Password"
//             className="w-full border border-blue-300/50 bg-white/80 px-4 py-2 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
//             value={joinPassword}
//             onChange={(e) => setJoinPassword(e.target.value)}
//             variants={itemVariants}
//           />
//           <motion.button
//             onClick={handleJoin}
//             className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition"
//             whileHover={{ scale: 1.02 }}
//             transition={{ duration: 0.3 }}
//             variants={itemVariants}
//           >
//             Join Room
//           </motion.button>
//         </motion.div>

//         {/* Active Rooms List */}
//         <motion.div
//           className="bg-white/90 backdrop-blur-xl rounded-3xl p-6 shadow-2xl border border-blue-300/50"
//           variants={itemVariants}
//         >
//           <motion.h2
//             className="text-2xl font-extrabold text-transparent bg-gradient-to-r from-blue-500 to-pink-500 bg-clip-text mb-4 flex items-center gap-2"
//             variants={itemVariants}
//           >
//             <Sparkles className="w-6 h-6 text-yellow-400 animate-bounce" />
//             Active Rooms
//           </motion.h2>
//           {activeRooms.length === 0 ? (
//             <motion.p
//               className="text-gray-500 bg-white/90 rounded-2xl p-4 shadow-xl border border-blue-300/50"
//               variants={itemVariants}
//             >
//               No active rooms found.
//             </motion.p>
//           ) : (
//             <AnimatePresence>
//               {activeRooms.map((room) => (
//                 <motion.div
//                   key={room.roomId}
//                   className="bg-white/90 border border-blue-300/50 rounded-2xl p-4 mb-4 shadow-xl hover:shadow-2xl transition"
//                   initial="hidden"
//                   animate="visible"
//                   exit="hidden"
//                   variants={itemVariants}
//                 >
//                   <div>
//                     <p><strong>Room ID:</strong> {room.roomId}</p>
//                     <p><strong>Host:</strong> {room.host}</p>
//                     <p><strong>Participants:</strong> {room.participants}</p>
//                   </div>
//                   <div className="mt-3 flex gap-3">
//                     <motion.button
//                       onClick={() => navigate(`/live/${room.roomId}`)}
//                       className="bg-blue-600 text-white px-4 py-1 rounded-lg hover:bg-blue-700"
//                       whileHover={{ scale: 1.02 }}
//                       transition={{ duration: 0.3 }}
//                     >
//                       Join
//                     </motion.button>
//                     <motion.button
//                       onClick={() => handleLeaveRoom(room.roomId)}
//                       className="bg-red-600 text-white px-3 py-1 rounded-lg hover:bg-red-700"
//                       whileHover={{ scale: 1.02 }}
//                       transition={{ duration: 0.3 }}
//                     >
//                       Leave
//                     </motion.button>
//                   </div>
//                 </motion.div>
//               ))}
//             </AnimatePresence>
//           )}
//         </motion.div>

//         {/* Past Rooms History */}
//         <motion.div
//           className="bg-white/90 backdrop-blur-xl rounded-3xl p-6 shadow-2xl border border-blue-300/50"
//           variants={itemVariants}
//         >
//           <motion.h2
//             className="text-2xl font-extrabold text-transparent bg-gradient-to-r from-blue-500 to-pink-500 bg-clip-text mb-4 flex items-center gap-2"
//             variants={itemVariants}
//           >
//             <Sparkles className="w-6 h-6 text-yellow-400 animate-bounce" />
//             Past Rooms Joined
//           </motion.h2>
//           {roomHistory.length === 0 ? (
//             <motion.p
//               className="text-gray-500 bg-white/90 rounded-2xl p-4 shadow-xl border border-blue-300/50"
//               variants={itemVariants}
//             >
//               No room history available.
//             </motion.p>
//           ) : (
//             <AnimatePresence>
//               {roomHistory.map((room) => (
//                 <motion.div
//                   key={room.roomId}
//                   className="bg-white/90 border border-blue-300/50 rounded-2xl p-4 mb-4 shadow-xl hover:shadow-2xl transition relative"
//                   initial="hidden"
//                   animate="visible"
//                   exit="hidden"
//                   variants={itemVariants}
//                 >
//                   <div>
//                     <p><strong>Room ID:</strong> {room.roomId}</p>
//                     <p><strong>Host:</strong> {room.host}</p>
//                     <p><strong>Participants:</strong> {room.participants}</p>
//                     <p><strong>Joined At:</strong> {new Date(room.joinedAt).toLocaleString()}</p>
//                     <p><strong>Left At:</strong> {new Date(room.leftAt).toLocaleString()}</p>
//                   </div>
//                   <motion.button
//                     onClick={() => handleDeleteHistory(room.roomId)}
//                     className="absolute top-2 right-3 text-sm text-red-500 hover:text-red-700 hover:underline"
//                     whileHover={{ scale: 1.1 }}
//                     transition={{ duration: 0.3 }}
//                   >
//                     Delete
//                   </motion.button>
//                 </motion.div>
//               ))}
//             </AnimatePresence>
//           )}
//         </motion.div>
//       </div>
//     </motion.div>
//   );
// };

// export default Room;
