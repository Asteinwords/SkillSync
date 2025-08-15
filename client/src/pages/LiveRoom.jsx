// // // window.global = window;

// // // import React, { useEffect, useRef, useState } from 'react';
// // // import io from 'socket.io-client';
// // // import Peer from 'simple-peer';
// // // import { useParams, useNavigate } from 'react-router-dom';
// // // import { ReactSketchCanvas } from 'react-sketch-canvas';
// // // import {
// // //   Mic, MicOff, Video, VideoOff, PhoneOff,
// // //   CircleDot, Square, Monitor, MonitorX
// // // } from 'lucide-react';
// // // import starsBg from '../assets/stars.svg';

// // // const socket = io("https://skillsync-cvqg.onrender.com");

// // // const LiveRoom = () => {
// // //   const { roomId } = useParams();
// // //   const navigate = useNavigate();
// // //   const role = localStorage.getItem("role");
// // //   const user = JSON.parse(localStorage.getItem("user"));

// // //   const [strokeColor, setStrokeColor] = useState('black');
// // //   const [strokeWidth, setStrokeWidth] = useState(4);
// // //   const [peer, setPeer] = useState(null);
// // //   const [stream, setStream] = useState(null);
// // //   const [partnerStream, setPartnerStream] = useState(null);
// // //   const [micOn, setMicOn] = useState(true);
// // //   const [videoOn, setVideoOn] = useState(true);
// // //   const [isRecording, setIsRecording] = useState(false);
// // //   const [recorder, setRecorder] = useState(null);
// // //   const [includeWhiteboard, setIncludeWhiteboard] = useState(true);
// // //   const [whiteboardVisible, setWhiteboardVisible] = useState(true);
// // //   const [screenSharing, setScreenSharing] = useState(false);
// // //   const [screenSharingUser, setScreenSharingUser] = useState(null);

// // //   const myVideo = useRef();
// // //   const peerVideo = useRef();
// // //   const canvasRef = useRef();

// // //   useEffect(() => {
// // //     navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then(currentStream => {
// // //       setStream(currentStream);
// // //       if (myVideo.current) myVideo.current.srcObject = currentStream;

// // //       socket.emit('joinRoom', { roomId, userId: user._id });

// // //       socket.on('user-joined', (otherUserId) => {
// // //         const newPeer = new Peer({ initiator: true, trickle: false, stream: currentStream });

// // //         newPeer.on('signal', data => {
// // //           socket.emit('signal', { to: otherUserId, from: socket.id, signal: data });
// // //         });

// // //         newPeer.on('stream', userStream => {
// // //           setPartnerStream(userStream);
// // //           if (peerVideo.current) peerVideo.current.srcObject = userStream;
// // //         });

// // //         setPeer(newPeer);
// // //       });

// // //       socket.on('signal', ({ from, signal }) => {
// // //         const newPeer = new Peer({ initiator: false, trickle: false, stream: currentStream });

// // //         newPeer.on('signal', data => {
// // //           socket.emit('signal', { to: from, from: socket.id, signal: data });
// // //         });

// // //         newPeer.on('stream', userStream => {
// // //           setPartnerStream(userStream);
// // //           if (peerVideo.current) peerVideo.current.srcObject = userStream;
// // //         });

// // //         newPeer.signal(signal);
// // //         setPeer(newPeer);
// // //       });

// // //       socket.on("room-ended", () => {
// // //         alert("Session ended by host.");
// // //         cleanup();
// // //         navigate("/dashboard");
// // //       });

// // //       socket.on("draw", (data) => {
// // //         if (canvasRef.current) canvasRef.current.loadPaths(data);
// // //       });

// // //       socket.on("screen-sharing-started", ({ userId }) => {
// // //         setScreenSharingUser(userId);
// // //       });

// // //       socket.on("screen-sharing-stopped", () => {
// // //         setScreenSharingUser(null);
// // //       });

// // //     });

// // //     return () => {
// // //       socket.off("signal");
// // //       socket.off("user-joined");
// // //       socket.off("draw");
// // //       socket.off("room-ended");
// // //       cleanup();
// // //     };
// // //   }, [roomId]);

// // //   const cleanup = async () => {
// // //     if (peer) peer.destroy();
// // //     if (recorder?.state === 'recording') recorder.stop();
// // //     stream?.getTracks().forEach(t => t.stop());
// // //     partnerStream?.getTracks().forEach(t => t.stop());
// // //     await leaveRoom(roomId, user._id);
// // //     socket.disconnect();
// // //   };

// // //   const toggleMic = () => {
// // //     const audioTrack = stream?.getAudioTracks()[0];
// // //     if (audioTrack) {
// // //       audioTrack.enabled = !micOn;
// // //       setMicOn(!micOn);
// // //     }
// // //   };

// // //   const toggleVideo = () => {
// // //     const videoTrack = stream?.getVideoTracks()[0];
// // //     if (videoTrack) {
// // //       videoTrack.enabled = !videoOn;
// // //       setVideoOn(!videoOn);
// // //     }
// // //   };

// // //   const handleDraw = async () => {
// // //     const paths = await canvasRef.current?.exportPaths();
// // //     socket.emit("draw", { roomId, data: paths });
// // //   };

// // //   const handleClear = () => canvasRef.current?.clearCanvas();
// // //   const handleExport = async () => {
// // //     const image = await canvasRef.current.exportImage('png');
// // //     const link = document.createElement('a');
// // //     link.download = 'whiteboard.png';
// // //     link.href = image;
// // //     link.click();
// // //   };

// // //   const combineStreams = async () => {
// // //     const combined = new MediaStream();

// // //     // local camera + mic
// // //     stream.getAudioTracks().forEach(track => combined.addTrack(track));
// // //     stream.getVideoTracks().forEach(track => combined.addTrack(track));

// // //     // remote audio
// // //     if (partnerStream) {
// // //       partnerStream.getAudioTracks().forEach(track => combined.addTrack(track));
// // //     }

// // //     // whiteboard if shown
// // //     if (includeWhiteboard && whiteboardVisible) {
// // //       const canvas = document.querySelector("canvas");
// // //       if (canvas?.captureStream) {
// // //         const wbStream = canvas.captureStream(15);
// // //         wbStream.getVideoTracks().forEach(track => combined.addTrack(track));
// // //       }
// // //     }

// // //     return combined;
// // //   };

// // //   const startRecording = async () => {
// // //     const finalStream = await combineStreams();
// // //     if (!finalStream || finalStream.getTracks().length === 0) {
// // //       alert("Nothing to record");
// // //       return;
// // //     }

// // //     const chunks = [];
// // //     const mediaRecorder = new MediaRecorder(finalStream);

// // //     mediaRecorder.ondataavailable = e => chunks.push(e.data);
// // //     mediaRecorder.onstop = () => {
// // //       const blob = new Blob(chunks, { type: 'video/webm' });
// // //       const url = URL.createObjectURL(blob);
// // //       const a = document.createElement('a');
// // //       a.href = url;
// // //       a.download = `${roomId}-recording.webm`;
// // //       a.click();
// // //       URL.revokeObjectURL(url);
// // //     };

// // //     mediaRecorder.start();
// // //     setRecorder(mediaRecorder);
// // //     setIsRecording(true);
// // //   };

// // //   const stopRecording = () => {
// // //     if (recorder && recorder.state === "recording") recorder.stop();
// // //     setIsRecording(false);
// // //   };

// // //   const handleScreenShare = async () => {
// // //     if (screenSharingUser && screenSharingUser !== user._id) {
// // //       alert("Someone else is already sharing the screen.");
// // //       return;
// // //     }

// // //     try {
// // //       const displayStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
// // //       const screenTrack = displayStream.getVideoTracks()[0];

// // //       const sender = peer?._pc.getSenders().find(s => s.track.kind === "video");
// // //       if (sender) sender.replaceTrack(screenTrack);

// // //       screenTrack.onended = () => {
// // //         const camTrack = stream.getVideoTracks()[0];
// // //         if (sender) sender.replaceTrack(camTrack);
// // //         socket.emit("screen-sharing-stopped");
// // //         setScreenSharing(false);
// // //       };

// // //       socket.emit("screen-sharing-started", { userId: user._id });
// // //       setScreenSharing(true);
// // //     } catch (err) {
// // //       console.error("Screen share denied:", err);
// // //     }
// // //   };

// // //   const handleEndSession = () => {
// // //     if (role === 'host') {
// // //       socket.emit("end-room", { roomId });
// // //     }
// // //     cleanup();
// // //     navigate("/dashboard");
// // //   };

// // //   useEffect(() => {
// // //     const handleBeforeUnload = (e) => {
// // //       const data = JSON.stringify({ roomId, userId: user._id });
// // //       const blob = new Blob([data], { type: 'application/json' });
// // //       navigator.sendBeacon('https://skillsync-cvqg.onrender.com/api/rooms/leave', blob);
// // //       cleanup();
// // //     };

// // //     window.addEventListener("beforeunload", handleBeforeUnload);
// // //     return () => {
// // //       window.removeEventListener("beforeunload", handleBeforeUnload);
// // //     };
// // //   }, [roomId]);

// // //   return (
// // //     <div className="relative min-h-screen px-4 py-10 pt-24 font-body bg-gradient-to-br from-indigo-100 via-pink-100 to-blue-100" style={{ backgroundImage: `url(${starsBg})`, backgroundRepeat: 'repeat' }}>
// // //       <div className="max-w-7xl mx-auto bg-white/80 backdrop-blur-2xl rounded-3xl p-6 shadow-2xl">
// // //         <h2 className="text-3xl font-extrabold text-center text-indigo-700 mb-6">🚀 Live Learning Room</h2>

// // //         <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
// // //           <div className="space-y-6">
// // //             <div className="grid grid-cols-2 gap-4">
// // //               <div className="border-4 border-indigo-300 rounded-xl">
// // //                 <video playsInline muted ref={myVideo} autoPlay className="w-full h-52 object-cover bg-black" />
// // //                 <p className="text-center text-xs bg-indigo-50">🎤 You ({role})</p>
// // //               </div>
// // //               <div className="border-4 border-pink-300 rounded-xl">
// // //                 <video playsInline ref={peerVideo} autoPlay className="w-full h-52 object-cover bg-black" />
// // //                 <p className="text-center text-xs bg-pink-50">🎥 Partner</p>
// // //               </div>
// // //             </div>

// // //             <div className="flex justify-center flex-wrap gap-3 mt-2">
// // //               <button onClick={toggleMic} className="text-white bg-indigo-500 p-2 rounded-full">{micOn ? <Mic /> : <MicOff />}</button>
// // //               <button onClick={toggleVideo} className="text-white bg-purple-500 p-2 rounded-full">{videoOn ? <Video /> : <VideoOff />}</button>
// // //               {!isRecording && <button onClick={startRecording} className="bg-green-500 text-white p-2 rounded-full"><CircleDot /></button>}
// // //               {isRecording && <button onClick={stopRecording} className="bg-red-600 text-white p-2 rounded-full"><Square /></button>}
// // //               <button onClick={handleScreenShare} className="bg-blue-600 text-white p-2 rounded-full">{screenSharing ? <MonitorX /> : <Monitor />}</button>
// // //               <button onClick={handleEndSession} className="bg-red-800 text-white p-2 rounded-full"><PhoneOff /></button>
// // //             </div>

// // //             <div className="text-center mt-2 text-sm">
// // //               <label className={`mr-2 font-medium text-indigo-700 ${!whiteboardVisible ? "opacity-50 cursor-not-allowed" : ""}`}>
// // //                 <input type="checkbox" disabled={!whiteboardVisible} checked={includeWhiteboard} onChange={() => setIncludeWhiteboard(!includeWhiteboard)} />
// // //                 {' '}Record Whiteboard?
// // //               </label>
// // //             </div>
// // //           </div>

// // //           <div>
// // //             <button className="text-sm mb-2 px-4 py-1 rounded-full bg-indigo-600 text-white hover:bg-indigo-700" onClick={() => setWhiteboardVisible(!whiteboardVisible)}>
// // //               {whiteboardVisible ? 'Hide Whiteboard' : 'Show Whiteboard'}
// // //             </button>

// // //             {whiteboardVisible && (
// // //               <div className="bg-white p-4 rounded-xl shadow border border-indigo-200">
// // //                 <h3 className="text-xl font-semibold text-indigo-700 mb-2">🖊 Collaborative Whiteboard</h3>
// // //                 <div className="flex gap-3 text-sm mb-2">
// // //                   <select value={strokeColor} onChange={(e) => setStrokeColor(e.target.value)} className="border rounded px-2 py-1">
// // //                     <option value="black">Black</option>
// // //                     <option value="red">Red</option>
// // //                     <option value="blue">Blue</option>
// // //                     <option value="green">Green</option>
// // //                   </select>
// // //                   <input type="range" min="1" max="10" value={strokeWidth} onChange={(e) => setStrokeWidth(Number(e.target.value))} />
// // //                   <button onClick={handleClear} className="bg-yellow-400 text-white px-2 rounded">Clear</button>
// // //                   <button onClick={handleExport} className="bg-green-500 text-white px-2 rounded">Export</button>
// // //                 </div>
// // //                 <ReactSketchCanvas
// // //                   ref={canvasRef}
// // //                   width="100%"
// // //                   height="400px"
// // //                   strokeColor={strokeColor}
// // //                   strokeWidth={strokeWidth}
// // //                   onStroke={handleDraw}
// // //                   style={{ border: "2px dashed #ccc", borderRadius: 10, background: "#fefefe" }}
// // //                 />
// // //               </div>
// // //             )}
// // //           </div>
// // //         </div>
// // //       </div>
// // //     </div>
// // //   );
// // // };
// // import React, { useEffect, useRef, useState } from 'react';
// // import io from 'socket.io-client';
// // import Peer from 'simple-peer';
// // import { useParams, useNavigate } from 'react-router-dom';
// // import { ReactSketchCanvas } from 'react-sketch-canvas';
// // import {
// //   Mic, MicOff, Video, VideoOff, PhoneOff,
// //   CircleDot, Square, Monitor, MonitorX
// // } from 'lucide-react';
// // import toast from 'react-hot-toast';
// // import starsBg from '../assets/stars.svg';
// // import { leaveRoom } from '../services/roomAPI';

// // const LiveRoom = () => {
// //   const { roomId } = useParams();
// //   const navigate = useNavigate();
// //   const role = localStorage.getItem("role");
// //   const user = JSON.parse(localStorage.getItem("user") || null);
// //   const socketRef = useRef(null);

// //   const [strokeColor, setStrokeColor] = useState('black');
// //   const [strokeWidth, setStrokeWidth] = useState(4);
// //   const [peer, setPeer] = useState(null);
// //   const [stream, setStream] = useState(null);
// //   const [partnerStream, setPartnerStream] = useState(null);
// //   const [micOn, setMicOn] = useState(true);
// //   const [videoOn, setVideoOn] = useState(true);
// //   const [isRecording, setIsRecording] = useState(false);
// //   const [recorder, setRecorder] = useState(null);
// //   const [includeWhiteboard, setIncludeWhiteboard] = useState(true);
// //   const [whiteboardVisible, setWhiteboardVisible] = useState(true);
// //   const [screenSharing, setScreenSharing] = useState(false);
// //   const [screenSharingUser, setScreenSharingUser] = useState(null);

// //   const myVideo = useRef();
// //   const peerVideo = useRef();
// //   const canvasRef = useRef();

// //   useEffect(() => {
// //     console.log('[LiveRoom] user from localStorage:', user);
// //     if (!user || !user._id) {
// //       console.error('[LiveRoom] No user found in localStorage, redirecting to login');
// //       toast.error('Please log in to access the room');
// //       navigate('/login');
// //       return;
// //     }

// //     socketRef.current = io("https://skillsync-cvqg.onrender.com", { forceNew: true });
// //     console.log('[LiveRoom] Socket initialized:', socketRef.current.id);

// //     navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then(currentStream => {
// //       console.log('[LiveRoom] Media stream acquired:', currentStream);
// //       setStream(currentStream);
// //       if (myVideo.current) myVideo.current.srcObject = currentStream;

// //       socketRef.current.emit('joinRoom', { roomId, userId: user._id });
// //       console.log('[LiveRoom] Emitted joinRoom:', { roomId, userId: user._id });

// //       socketRef.current.on('user-joined', (otherUserId) => {
// //         console.log('[LiveRoom] user-joined received:', otherUserId);
// //         const newPeer = new Peer({ initiator: true, trickle: false, stream: currentStream });

// //         newPeer.on('signal', data => {
// //           socketRef.current.emit('signal', { to: otherUserId, from: socketRef.current.id, signal: data });
// //         });

// //         newPeer.on('stream', userStream => {
// //           console.log('[LiveRoom] Partner stream received');
// //           setPartnerStream(userStream);
// //           if (peerVideo.current) peerVideo.current.srcObject = userStream;
// //         });

// //         setPeer(newPeer);
// //       });

// //       socketRef.current.on('signal', ({ from, signal }) => {
// //         console.log('[LiveRoom] signal received from:', from);
// //         const newPeer = new Peer({ initiator: false, trickle: false, stream: currentStream });

// //         newPeer.on('signal', data => {
// //           socketRef.current.emit('signal', { to: from, from: socketRef.current.id, signal: data });
// //         });

// //         newPeer.on('stream', userStream => {
// //           console.log('[LiveRoom] Partner stream received');
// //           setPartnerStream(userStream);
// //           if (peerVideo.current) peerVideo.current.srcObject = userStream;
// //         });

// //         newPeer.signal(signal);
// //         setPeer(newPeer);
// //       });

// //       socketRef.current.on('room-ended', () => {
// //         console.log('[LiveRoom] room-ended received, navigating to dashboard');
// //         toast.success("Session ended by host.");
// //         cleanup(socketRef.current);
// //         navigate("/dashboard");
// //       });

// //       socketRef.current.on('draw', (data) => {
// //         console.log('[LiveRoom] draw event received');
// //         if (canvasRef.current) canvasRef.current.loadPaths(data);
// //       });

// //       socketRef.current.on('screen-sharing-started', ({ userId }) => {
// //         console.log('[LiveRoom] screen-sharing-started:', userId);
// //         setScreenSharingUser(userId);
// //         setScreenSharing(userId === user._id);
// //       });

// //       socketRef.current.on('screen-sharing-stopped', () => {
// //         console.log('[LiveRoom] screen-sharing-stopped');
// //         setScreenSharingUser(null);
// //         setScreenSharing(false);
// //       });

// //       socketRef.current.on('record-action', ({ action }) => {
// //         console.log('[LiveRoom] record-action:', action);
// //         setIsRecording(action === 'start');
// //       });

// //       socketRef.current.on('error', (message) => {
// //         console.log('[LiveRoom] Error received:', message);
// //         toast.error(message);
// //       });

// //     }).catch(err => {
// //       console.error('[LiveRoom] Media access error:', err);
// //       toast.error('Failed to access camera/mic. Please allow permissions.');
// //     });

// //     return () => {
// //       console.log('[LiveRoom] Cleaning up socket listeners');
// //       socketRef.current?.off('signal');
// //       socketRef.current?.off('user-joined');
// //       socketRef.current?.off('draw');
// //       socketRef.current?.off('room-ended');
// //       socketRef.current?.off('screen-sharing-started');
// //       socketRef.current?.off('screen-sharing-stopped');
// //       socketRef.current?.off('record-action');
// //       socketRef.current?.off('error');
// //       cleanup(socketRef.current);
// //     };
// //   }, [roomId, navigate]);

// //   const cleanup = async (socket) => {
// //     console.log('[LiveRoom] Running cleanup');
// //     if (peer) {
// //       peer.destroy();
// //       console.log('[LiveRoom] Peer destroyed');
// //     }
// //     if (recorder?.state === 'recording') {
// //       recorder.stop();
// //       console.log('[LiveRoom] Recorder stopped');
// //     }
// //     if (stream) {
// //       stream.getTracks().forEach(t => {
// //         t.stop();
// //         console.log('[LiveRoom] Stopped track:', t.kind);
// //       });
// //       setStream(null);
// //     }
// //     if (partnerStream) {
// //       partnerStream.getTracks().forEach(t => {
// //         t.stop();
// //         console.log('[LiveRoom] Stopped partner track:', t.kind);
// //       });
// //       setPartnerStream(null);
// //     }
// //     if (user?._id && socket) {
// //       try {
// //         await leaveRoom(roomId, user._id);
// //         console.log('[LiveRoom] leaveRoom API called:', { roomId, userId: user._id });
// //         socket.emit('leave-room-global', { roomId, userId: user._id });
// //         console.log('[LiveRoom] Emitted leave-room-global:', { roomId, userId: user._id });
// //         setTimeout(() => {
// //           socket.disconnect();
// //           console.log('[LiveRoom] Socket disconnected after delay');
// //         }, 1000);
// //       } catch (err) {
// //         console.error('[LiveRoom] leaveRoom API error:', err);
// //       }
// //     }
// //   };

// //   const toggleMic = () => {
// //     const audioTrack = stream?.getAudioTracks()[0];
// //     if (audioTrack) {
// //       audioTrack.enabled = !micOn;
// //       setMicOn(!micOn);
// //       console.log('[LiveRoom] Toggled mic:', !micOn);
// //     }
// //   };

// //   const toggleVideo = () => {
// //     const videoTrack = stream?.getVideoTracks()[0];
// //     if (videoTrack) {
// //       videoTrack.enabled = !videoOn;
// //       setVideoOn(!videoOn);
// //       console.log('[LiveRoom] Toggled video:', !videoOn);
// //     }
// //   };

// //   const handleDraw = async () => {
// //     const paths = await canvasRef.current?.exportPaths();
// //     socketRef.current?.emit("draw", { roomId, data: paths });
// //     console.log('[LiveRoom] Emitted draw event');
// //   };

// //   const handleClear = () => {
// //     canvasRef.current?.clearCanvas();
// //     console.log('[LiveRoom] Cleared canvas');
// //   };

// //   const handleExport = async () => {
// //     const image = await canvasRef.current?.exportImage('png');
// //     const link = document.createElement('a');
// //     link.download = 'whiteboard.png';
// //     link.href = image;
// //     link.click();
// //     console.log('[LiveRoom] Exported whiteboard');
// //   };

// //   const combineStreams = async () => {
// //     const combined = new MediaStream();

// //     if (stream) {
// //       stream.getAudioTracks().forEach(track => combined.addTrack(track));
// //       if (!screenSharing) {
// //         stream.getVideoTracks().forEach(track => combined.addTrack(track));
// //       }
// //     }

// //     if (partnerStream) {
// //       partnerStream.getAudioTracks().forEach(track => combined.addTrack(track));
// //     }

// //     if (includeWhiteboard && whiteboardVisible) {
// //       const canvas = document.querySelector("canvas");
// //       if (canvas?.captureStream) {
// //         const wbStream = canvas.captureStream(15);
// //         wbStream.getVideoTracks().forEach(track => combined.addTrack(track));
// //       }
// //     }

// //     console.log('[LiveRoom] Combined streams for recording');
// //     return combined;
// //   };

// //   const startRecording = async () => {
// //     try {
// //       const displayStream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: true });
// //       const combined = new MediaStream();

// //       displayStream.getVideoTracks().forEach(track => combined.addTrack(track));
// //       displayStream.getAudioTracks().forEach(track => combined.addTrack(track));

// //       if (stream) stream.getAudioTracks().forEach(track => combined.addTrack(track));
// //       if (partnerStream) partnerStream.getAudioTracks().forEach(track => combined.addTrack(track));

// //       if (includeWhiteboard && whiteboardVisible) {
// //         const canvas = document.querySelector("canvas");
// //         if (canvas?.captureStream) {
// //           const wbStream = canvas.captureStream(15);
// //           wbStream.getVideoTracks().forEach(track => combined.addTrack(track));
// //         }
// //       }

// //       const chunks = [];
// //       const mediaRecorder = new MediaRecorder(combined, { mimeType: 'video/webm' });

// //       mediaRecorder.ondataavailable = e => chunks.push(e.data);
// //       mediaRecorder.onstop = () => {
// //         const blob = new Blob(chunks, { type: 'video/webm' });
// //         const url = URL.createObjectURL(blob);
// //         const a = document.createElement('a');
// //         a.href = url;
// //         a.download = `${roomId}-recording.webm`;
// //         a.click();
// //         URL.revokeObjectURL(url);
// //         displayStream.getTracks().forEach(track => track.stop());
// //         console.log('[LiveRoom] Recording stopped and downloaded');
// //       };

// //       mediaRecorder.start();
// //       setRecorder(mediaRecorder);
// //       setIsRecording(true);
// //       socketRef.current?.emit('record-action', { roomId, action: 'start' });
// //       console.log('[LiveRoom] Recording started');
// //     } catch (err) {
// //       console.error('[LiveRoom] Recording error:', err);
// //       toast.error('Failed to start recording.');
// //     }
// //   };

// //   const stopRecording = () => {
// //     if (recorder && recorder.state === "recording") {
// //       recorder.stop();
// //       setIsRecording(false);
// //       socketRef.current?.emit('record-action', { roomId, action: 'stop' });
// //       console.log('[LiveRoom] Recording stopped');
// //     }
// //   };

// //   const handleScreenShare = async () => {
// //     if (screenSharingUser && screenSharingUser !== user._id) {
// //       toast.error("Someone else is already sharing the screen.");
// //       console.log('[LiveRoom] Screen share blocked: another user sharing');
// //       return;
// //     }

// //     try {
// //       const displayStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
// //       const screenTrack = displayStream.getVideoTracks()[0];

// //       const sender = peer?._pc.getSenders().find(s => s.track.kind === "video");
// //       if (sender) sender.replaceTrack(screenTrack);

// //       screenTrack.onended = () => {
// //         const camTrack = stream.getVideoTracks()[0];
// //         if (sender && camTrack) sender.replaceTrack(camTrack);
// //         socketRef.current?.emit("screen-sharing-stopped", { roomId });
// //         setScreenSharing(false);
// //         console.log('[LiveRoom] Screen sharing stopped');
// //       };

// //       socketRef.current?.emit("screen-sharing-started", { roomId, userId: user._id });
// //       setScreenSharing(true);
// //       console.log('[LiveRoom] Screen sharing started');
// //     } catch (err) {
// //       console.error('[LiveRoom] Screen share error:', err);
// //       toast.error("Screen sharing failed.");
// //     }
// //   };

// //   const handleEndRoom = () => {
// //     if (role === 'host') {
// //       socketRef.current?.emit("end-room", { roomId });
// //       console.log('[LiveRoom] Emitted end-room:', roomId);
// //     } else {
// //       toast.error("Only the host can end the room.");
// //       console.log('[LiveRoom] End room attempted by non-host');
// //     }
// //   };

// //   // const handleLeaveRoom = () => {
// //   //   console.log('[LiveRoom] handleLeaveRoom called');
// //   //   cleanup(socketRef.current);
// //   //   setTimeout(() => {
// //   //     console.log('[LiveRoom] Navigating to /dashboard after cleanup');
// //   //     navigate("/dashboard");
// //   //   }, 1500); // Delay navigation to ensure emission
// //   // };
// // const handleLeaveRoom = async (roomId) => {
// //   try {
// //     console.log('[Room] Leaving room:', { roomId, userId });
// //     await leaveRoom(roomId, userId);
// //     socket?.emit('leave-room', { roomId, userId });
// //     console.log('[Room] Emitted leave-room from handleLeaveRoom:', { roomId, userId });
// //     // Immediately fetch rooms without delay
// //     await fetchRooms();
// //   } catch (err) {
// //     console.error('[Room] Leave room error:', err);
// //     toast.error('Could not leave room');
// //   }
// // };
// //   useEffect(() => {
// //     if (!user || !user._id) return;

// //     const handleBeforeUnload = (e) => {
// //       console.log('[LiveRoom] beforeunload triggered');
// //       const data = JSON.stringify({ roomId, userId: user._id });
// //       const blob = new Blob([data], { type: 'application/json' });
// //       navigator.sendBeacon('https://skillsync-cvqg.onrender.com/api/rooms/leave', blob);
// //       cleanup(socketRef.current);
// //     };

// //     window.addEventListener("beforeunload", handleBeforeUnload);
// //     return () => {
// //       console.log('[LiveRoom] Removing beforeunload listener');
// //       window.removeEventListener("beforeunload", handleBeforeUnload);
// //     };
// //   }, [roomId, navigate]);

// //   if (!user || !user._id) {
// //     return null;
// //   }

// //   return (
// //     <div className="relative min-h-screen px-4 py-10 pt-24 font-body bg-gradient-to-br from-indigo-100 via-pink-100 to-blue-100" style={{ backgroundImage: `url(${starsBg})`, backgroundRepeat: 'repeat' }}>
// //       <div className="max-w-7xl mx-auto bg-white/80 backdrop-blur-2xl rounded-3xl p-6 shadow-2xl">
// //         <h2 className="text-3xl font-extrabold text-center text-indigo-700 mb-6">🚀 Live Learning Room</h2>

// //         <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
// //           <div className="space-y-6">
// //             <div className="grid grid-cols-2 gap-4">
// //               <div className="border-4 border-indigo-300 rounded-xl">
// //                 <video playsInline muted ref={myVideo} autoPlay className="w-full h-52 object-cover bg-black" />
// //                 <p className="text-center text-xs bg-indigo-50">🎤 You ({role})</p>
// //               </div>
// //               <div className="border-4 border-pink-300 rounded-xl">
// //                 <video playsInline ref={peerVideo} autoPlay className="w-full h-52 object-cover bg-black" />
// //                 <p className="text-center text-xs bg-pink-50">🎥 Partner</p>
// //               </div>
// //             </div>

// //             <div className="flex justify-center flex-wrap gap-3 mt-2">
// //               <button onClick={toggleMic} className="text-white bg-indigo-500 p-2 rounded-full">{micOn ? <Mic /> : <MicOff />}</button>
// //               <button onClick={toggleVideo} className="text-white bg-purple-500 p-2 rounded-full">{videoOn ? <Video /> : <VideoOff />}</button>
// //               {!isRecording && <button onClick={startRecording} className="bg-green-500 text-white p-2 rounded-full"><CircleDot /></button>}
// //               {isRecording && <button onClick={stopRecording} className="bg-red-600 text-white p-2 rounded-full"><Square /></button>}
// //               <button onClick={handleScreenShare} className="bg-blue-600 text-white p-2 rounded-full">{screenSharing ? <MonitorX /> : <Monitor />}</button>
// //               <button onClick={handleEndRoom} className="bg-red-800 text-white p-2 rounded-full" disabled={role !== 'host'} title={role !== 'host' ? 'Only host can end room' : ''}><PhoneOff /></button>
// //               <button onClick={handleLeaveRoom} className="bg-orange-600 text-white p-2 rounded-full">Leave Room</button>
// //             </div>

// //             <div className="text-center mt-2 text-sm">
// //               <label className={`mr-2 font-medium text-indigo-700 ${!whiteboardVisible ? "opacity-50 cursor-not-allowed" : ""}`}>
// //                 <input type="checkbox" disabled={!whiteboardVisible} checked={includeWhiteboard} onChange={() => setIncludeWhiteboard(!includeWhiteboard)} />
// //                 {' '}Record Whiteboard?
// //               </label>
// //             </div>
// //           </div>

// //           <div>
// //             <button className="text-sm mb-2 px-4 py-1 rounded-full bg-indigo-600 text-white hover:bg-indigo-700" onClick={() => setWhiteboardVisible(!whiteboardVisible)}>
// //               {whiteboardVisible ? 'Hide Whiteboard' : 'Show Whiteboard'}
// //             </button>

// //             {whiteboardVisible && (
// //               <div className="bg-white p-4 rounded-xl shadow border border-indigo-200">
// //                 <h3 className="text-xl font-semibold text-indigo-700 mb-2">🖊 Collaborative Whiteboard</h3>
// //                 <div className="flex gap-3 text-sm mb-2">
// //                   <select value={strokeColor} onChange={(e) => setStrokeColor(e.target.value)} className="border rounded px-2 py-1">
// //                     <option value="black">Black</option>
// //                     <option value="red">Red</option>
// //                     <option value="blue">Blue</option>
// //                     <option value="green">Green</option>
// //                   </select>
// //                   <input type="range" min="1" max="10" value={strokeWidth} onChange={(e) => setStrokeWidth(Number(e.target.value))} />
// //                   <button onClick={handleClear} className="bg-yellow-400 text-white px-2 rounded">Clear</button>
// //                   <button onClick={handleExport} className="bg-green-500 text-white px-2 rounded">Export</button>
// //                 </div>
// //                 <ReactSketchCanvas
// //                   ref={canvasRef}
// //                   width="100%"
// //                   height="400px"
// //                   strokeColor={strokeColor}
// //                   strokeWidth={strokeWidth}
// //                   onStroke={handleDraw}
// //                   style={{ border: "2px dashed #ccc", borderRadius: 10, background: "#fefefe" }}
// //                 />
// //               </div>
// //             )}
// //           </div>
// //         </div>
// //       </div>
// //     </div>
// //   );
// // };

// // export default LiveRoom;
// import React, { useEffect, useRef, useState } from 'react';
// import { useParams, useNavigate } from 'react-router-dom';
// import io from 'socket.io-client';
// import Peer from 'simple-peer';
// import { ReactSketchCanvas } from 'react-sketch-canvas';
// import { toast } from 'react-hot-toast';
// import { motion } from 'framer-motion';
// import html2canvas from 'html2canvas';
// import API from '../services/api';
// import {
//   Mic, MicOff, Video, VideoOff, PhoneOff,
//   CircleDot, Square, Monitor, MonitorX
// } from 'lucide-react';
// import starsBg from '../assets/stars.svg';

// const LiveRoom = () => {
//   const { roomId } = useParams();
//   const navigate = useNavigate();
//   const [isHost, setIsHost] = useState(false);
//   const [videoOn, setVideoOn] = useState(true);
//   const [micOn, setMicOn] = useState(true);
//   const [screenSharing, setScreenSharing] = useState(false);
//   const [recording, setRecording] = useState(false);
//   const [strokeColor, setStrokeColor] = useState('black');
//   const [strokeWidth, setStrokeWidth] = useState(4);
//   const [whiteboardVisible, setWhiteboardVisible] = useState(true);
//   const [includeWhiteboard, setIncludeWhiteboard] = useState(true);
//   const [shareType, setShareType] = useState('entire');
//   const [isRoomJoined, setIsRoomJoined] = useState(false);
//   const userVideo = useRef();
//   const partnerVideo = useRef();
//   const screenStream = useRef();
//   const sharedScreenVideo = useRef();
//   const socketRef = useRef();
//   const videoPeerRef = useRef();
//   const screenPeerRef = useRef();
//   const mediaRecorderRef = useRef();
//   const recordedChunks = useRef([]);
//   const userStream = useRef();
//   const screenRef = useRef();
//   const recordingCanvasRef = useRef();
//   const whiteboardCanvasRef = useRef();
//   const animationFrameRef = useRef();

//   useEffect(() => {
//     socketRef.current = io('https://skillsync-cvqg.onrender.com', {
//       transports: ['websocket', 'polling'],
//       reconnection: true,
//       reconnectionAttempts: 5,
//       reconnectionDelay: 1000,
//     });

//     socketRef.current.on('connect', () => {
//       console.log('Socket.IO connected:', socketRef.current.id);
//       const userId = localStorage.getItem('userId');
//       if (userId && roomId && !isRoomJoined) {
//         socketRef.current.emit('join-room', { roomId, userId, isHost });
//       }
//     });

//     socketRef.current.on('connect_error', (err) => {
//       console.error('Socket.IO connection error:', err);
//       toast.error('Failed to connect to server. Please ensure the backend is running on port 5000.');
//     });

//     socketRef.current.on('room-joined', () => {
//       console.log(`[${new Date().toISOString()}] Room ${roomId} joined successfully`);
//       setIsRoomJoined(true);
//     });

//     const userId = localStorage.getItem('userId');

//     const initializeMedia = async () => {
//       try {
//         const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
//         userStream.current = stream;
//         if (userVideo.current) {
//           userVideo.current.srcObject = stream;
//           userVideo.current.play().catch((err) => console.error('Error playing user video:', err));
//         }

//         const res = await API.get(`/rooms/past/${userId}`);
//         const room = res.data?.find((r) => r.roomId === roomId);
//         if (room && room.host?._id) {
//           setIsHost(room.host._id === userId);
//         } else {
//           toast.error('Room data not found. Redirecting...');
//           navigate('/room');
//           return;
//         }

//         socketRef.current.emit('join-room', { roomId, userId, isHost });

//         socketRef.current.on('user-connected', (connectedUserId) => {
//           console.log('User connected:', connectedUserId);
//           const videoPeer = new Peer({ initiator: true, trickle: false, stream });
//           videoPeerRef.current = videoPeer;

//           videoPeer.on('signal', (data) => {
//             socketRef.current.emit('signal', { userId: connectedUserId, signal: data, type: 'video' });
//           });

//           videoPeer.on('stream', (partnerStream) => {
//             console.log('Received video stream:', partnerStream.active, partnerStream.getTracks());
//             if (partnerVideo.current) {
//               partnerVideo.current.srcObject = partnerStream;
//               partnerVideo.current.play().catch((err) => console.error('Error playing partner video:', err));
//             }
//           });
//         });

//         socketRef.current.on('signal', ({ signal, type }) => {
//           if (type === 'video' && videoPeerRef.current) {
//             videoPeerRef.current.signal(signal);
//           }
//         });

//         socketRef.current.on('screen-signal', ({ signal }) => {
//           if (screenPeerRef.current) {
//             console.log('Received screen signal:', JSON.stringify(signal).substring(0, 100));
//             screenPeerRef.current.signal(signal).catch((err) => {
//               console.error('Error signaling screen peer:', err);
//             });
//           } else if (!isHost) {
//             console.log('Initializing screen peer for participant');
//             screenPeerRef.current = new Peer({ initiator: false, trickle: false });

//             screenPeerRef.current.on('signal', (data) => {
//               console.log('Emitting screen signal for participant:', JSON.stringify(data).substring(0, 100));
//               socketRef.current.emit('screen-signal', { userId, signal: data });
//             });

//             screenPeerRef.current.on('stream', (screenPartnerStream) => {
//               console.log('Received screen stream:', screenPartnerStream.active, screenPartnerStream.getTracks());
//               if (sharedScreenVideo.current) {
//                 sharedScreenVideo.current.srcObject = screenPartnerStream;
//                 const playWithRetry = async (attempts = 5, delay = 500) => {
//                   try {
//                     await sharedScreenVideo.current.play();
//                   } catch (err) {
//                     console.error('Error playing shared screen video:', err);
//                     if (attempts > 0) {
//                       setTimeout(() => playWithRetry(attempts - 1, delay * 2), delay);
//                     } else {
//                       toast.error('Failed to display shared screen. Ensure the host is sharing and permissions are granted.');
//                     }
//                   }
//                 };
//                 playWithRetry();
//               }
//             });

//             screenPeerRef.current.on('error', (err) => {
//               console.error('Screen peer error:', err);
//               toast.error('Screen sharing connection failed.');
//             });

//             screenPeerRef.current.signal(signal);
//           }
//         });

//         socketRef.current.on('screen-share', async (streamId) => {
//           console.log('Screen share event received:', streamId);
//           setScreenSharing(!!streamId);
//           if (streamId && !isHost) {
//             if (!screenPeerRef.current) {
//               console.log('Initializing screen peer for participant');
//               screenPeerRef.current = new Peer({ initiator: false, trickle: false });

//               screenPeerRef.current.on('signal', (data) => {
//                 console.log('Emitting screen signal for participant:', JSON.stringify(data).substring(0, 100));
//                 socketRef.current.emit('screen-signal', { userId, signal: data });
//               });

//               screenPeerRef.current.on('stream', (screenPartnerStream) => {
//                 console.log('Received screen stream:', screenPartnerStream.active, screenPartnerStream.getTracks());
//                 if (sharedScreenVideo.current) {
//                   sharedScreenVideo.current.srcObject = screenPartnerStream;
//                   const playWithRetry = async (attempts = 5, delay = 500) => {
//                     try {
//                       await sharedScreenVideo.current.play();
//                     } catch (err) {
//                       console.error('Error playing shared screen video:', err);
//                       if (attempts > 0) {
//                         setTimeout(() => playWithRetry(attempts - 1, delay * 2), delay);
//                       } else {
//                         toast.error('Failed to display shared screen. Ensure the host is sharing and permissions are granted.');
//                       }
//                     }
//                   };
//                   playWithRetry();
//                 }
//               });

//               screenPeerRef.current.on('error', (err) => {
//                 console.error('Screen peer error:', err);
//                 toast.error('Screen sharing connection failed.');
//               });
//             }
//           } else if (!streamId) {
//             setScreenSharing(false);
//             if (sharedScreenVideo.current) {
//               sharedScreenVideo.current.srcObject = null;
//             }
//             if (screenPeerRef.current) {
//               screenPeerRef.current.destroy();
//               screenPeerRef.current = null;
//             }
//           }
//         });

//         socketRef.current.on('whiteboard-update', (data) => {
//           console.log('Received whiteboard data:', data);
//           if (whiteboardCanvasRef.current) {
//             whiteboardCanvasRef.current.loadPaths(data).catch((err) => {
//               console.error('Error loading whiteboard paths:', err);
//               toast.error('Failed to sync whiteboard');
//             });
//           }
//         });

//         socketRef.current.on('meeting-ended', () => {
//           console.log('Meeting ended, redirecting to /room');
//           navigate('/room');
//           toast.success('Meeting ended by host');
//         });

//         socketRef.current.on('end-meeting-error', (message) => {
//           toast.error(message);
//         });

//         socketRef.current.on('user-disconnected', () => {
//           if (partnerVideo.current) {
//             partnerVideo.current.srcObject = null;
//           }
//           if (sharedScreenVideo.current) {
//             sharedScreenVideo.current.srcObject = null;
//           }
//           setScreenSharing(false);
//         });
//       } catch (err) {
//         toast.error('Error accessing camera or microphone. Please check permissions and try again.');
//         console.error('Media initialization error:', err);
//       }
//     };

//     initializeMedia();

//     return () => {
//       socketRef.current.disconnect();
//       if (userStream.current) {
//         userStream.current.getTracks().forEach((track) => track.stop());
//       }
//       if (screenStream.current) {
//         screenStream.current.getTracks().forEach((track) => track.stop());
//       }
//       if (animationFrameRef.current) {
//         cancelAnimationFrame(animationFrameRef.current);
//       }
//       if (screenPeerRef.current) {
//         screenPeerRef.current.destroy();
//         screenPeerRef.current = null;
//       }
//     };
//   }, [roomId, navigate, isHost]);

//   const toggleVideo = () => {
//     if (userStream.current) {
//       userStream.current.getVideoTracks()[0].enabled = !videoOn;
//       setVideoOn(!videoOn);
//     }
//   };

//   const toggleMic = () => {
//     if (userStream.current) {
//       userStream.current.getAudioTracks()[0].enabled = !micOn;
//       setMicOn(!micOn);
//     }
//   };

//   const shareScreen = async () => {
//     if (!isRoomJoined) {
//       toast.error('Please wait until the room is joined before sharing screen.');
//       return;
//     }

//     if (screenSharing) {
//       if (screenStream.current) {
//         screenStream.current.getTracks().forEach((track) => track.stop());
//         screenStream.current = null;
//       }
//       if (screenPeerRef.current) {
//         screenPeerRef.current.destroy();
//         screenPeerRef.current = null;
//       }
//       if (sharedScreenVideo.current) {
//         sharedScreenVideo.current.srcObject = null;
//       }
//       setScreenSharing(false);
//       socketRef.current.emit('screen-share', null);
//       return;
//     }

//     try {
//       if (!navigator.mediaDevices.getDisplayMedia) {
//         throw new Error('Screen sharing is not supported in this browser. Please use Chrome, Edge, or Firefox.');
//       }

//       const constraints = {
//         video: {
//           cursor: 'always',
//           displaySurface: shareType,
//           width: { ideal: 1920, max: 1920 },
//           height: { ideal: 1080, max: 1080 },
//           frameRate: { ideal: 30 },
//         },
//         audio: {
//           echoCancellation: true,
//           noiseSuppression: true,
//           sampleRate: 44100,
//         },
//       };

//       const stream = await navigator.mediaDevices.getDisplayMedia(constraints);
//       screenStream.current = stream;

//       if (!stream.getVideoTracks().length) {
//         throw new Error('No video tracks available for screen sharing.');
//       }

//       if (!stream.getVideoTracks()[0].enabled) {
//         throw new Error('Screen sharing stream is disabled. Ensure the shared window is visible.');
//       }

//       if (shareType === 'tab') {
//         toast.warn(
//           'Sharing the meeting tab will cause an infinity mirror effect, like Google Meet. For best results, share a different tab or window.',
//           { duration: 5000 }
//         );
//       }

//       // Initialize screen peer for sharer
//       if (screenPeerRef.current) {
//         screenPeerRef.current.destroy();
//       }
//       screenPeerRef.current = new Peer({ initiator: true, trickle: false, stream });

//       screenPeerRef.current.on('signal', (data) => {
//         console.log('Emitting screen signal for sharer:', JSON.stringify(data).substring(0, 100));
//         socketRef.current.emit('screen-signal', { userId: localStorage.getItem('userId'), signal: data });
//       });

//       screenPeerRef.current.on('error', (err) => {
//         console.error('Screen peer error:', err);
//         toast.error('Screen sharing connection failed.');
//       });

//       // Show own screen share for the sharer (like Google Meet)
//       if (sharedScreenVideo.current) {
//         sharedScreenVideo.current.srcObject = stream;
//         const playWithRetry = async (attempts = 5, delay = 500) => {
//           try {
//             await sharedScreenVideo.current.play();
//           } catch (err) {
//             console.error('Error playing shared screen video:', err);
//             if (attempts > 0) {
//               setTimeout(() => playWithRetry(attempts - 1, delay * 2), delay);
//             } else {
//               toast.error('Failed to display shared screen. Ensure the shared window is visible and permissions are granted.');
//             }
//           }
//         };
//         playWithRetry();
//       }

//       socketRef.current.emit('screen-share', stream.id);
//       setScreenSharing(true);

//       stream.getVideoTracks()[0].onended = () => {
//         if (screenPeerRef.current) {
//           screenPeerRef.current.destroy();
//           screenPeerRef.current = null;
//         }
//         if (sharedScreenVideo.current) {
//           sharedScreenVideo.current.srcObject = null;
//         }
//         setScreenSharing(false);
//         socketRef.current.emit('screen-share', null);
//         screenStream.current = null;
//       };
//     } catch (err) {
//       console.error('Screen sharing error:', err);
//       let errorMessage = 'Error sharing screen. Please try again.';
//       if (err.name === 'NotAllowedError') {
//         errorMessage = 'Screen sharing permission denied. Please enable screen recording in your browser or system settings (e.g., macOS: System Settings > Privacy & Security > Screen & System Audio Recording).';
//       } else if (err.name === 'NotFoundError') {
//         errorMessage = 'No screen or window available to share. Ensure a valid window or tab is open.';
//       } else if (err.name === 'NotSupportedError') {
//         errorMessage = 'Screen sharing is not supported in this browser. Please use Chrome, Edge, or Firefox.';
//       }
//       toast.error(errorMessage);
//     }
//   };

//   const startRecording = async () => {
//     try {
//       recordedChunks.current = [];
//       let combinedStream;

//       try {
//         const displayStream = await navigator.mediaDevices.getDisplayMedia({
//           video: {
//             cursor: 'always',
//             displaySurface: shareType,
//             width: { ideal: 1920, max: 1920 },
//             height: { ideal: 1080, max: 1080 },
//             frameRate: { ideal: 30 },
//           },
//           audio: {
//             echoCancellation: true,
//             noiseSuppression: true,
//             sampleRate: 44100,
//           },
//         });
//         if (!displayStream.getVideoTracks().length) {
//           throw new Error('No video tracks available');
//         }
//         const audioTracks = [
//           ...(userStream.current?.getAudioTracks() || []),
//           ...(partnerVideo.current?.srcObject?.getAudioTracks() || []),
//         ];
//         combinedStream = new MediaStream([
//           ...displayStream.getVideoTracks(),
//           ...audioTracks,
//         ]);

//         if (includeWhiteboard && whiteboardVisible && whiteboardCanvasRef.current) {
//           const wbCanvas = whiteboardCanvasRef.current.canvas;
//           if (wbCanvas?.captureStream) {
//             const wbStream = wbCanvas.captureStream(30);
//             wbStream.getVideoTracks().forEach(track => combinedStream.addTrack(track));
//           }
//         }

//         mediaRecorderRef.current = new MediaRecorder(combinedStream, {
//           mimeType: 'video/webm; codecs=vp9,opus',
//           videoBitsPerSecond: 5000000,
//         });
//         mediaRecorderRef.current.ondataavailable = (e) => {
//           if (e.data.size > 0) {
//             recordedChunks.current.push(e.data);
//           }
//         };
//         mediaRecorderRef.current.onstop = () => {
//           const blob = new Blob(recordedChunks.current, { type: 'video/webm' });
//           const url = URL.createObjectURL(blob);
//           const a = document.createElement('a');
//           a.href = url;
//           a.download = `recording-${roomId}.webm`;
//           a.click();
//           URL.revokeObjectURL(url);
//           displayStream.getTracks().forEach((track) => track.stop());
//         };
//         mediaRecorderRef.current.start();
//         setRecording(true);
//         toast.success('Recording started. Ensure the shared window is not minimized.');
//       } catch (err) {
//         console.warn('getDisplayMedia failed, falling back to html2canvas:', err);
//         const canvas = recordingCanvasRef.current;
//         canvas.width = 1920;
//         canvas.height = 1080;
//         const ctx = canvas.getContext('2d');

//         const draw = async () => {
//           if (!screenRef.current) return;
//           try {
//             const tempCanvas = await html2canvas(screenRef.current, {
//               scale: 2,
//               useCORS: true,
//               allowTaint: true,
//               width: 1920,
//               height: 1080,
//               logging: true,
//             });
//             ctx.clearRect(0, 0, canvas.width, canvas.height);
//             ctx.drawImage(tempCanvas, 0, 0, canvas.width, canvas.height);
//             animationFrameRef.current = requestAnimationFrame(draw);
//           } catch (err) {
//             console.error('html2canvas error:', err);
//           }
//         };
//         animationFrameRef.current = requestAnimationFrame(draw);

//         const canvasStream = canvas.captureStream(30);
//         const audioTracks = [
//           ...(userStream.current?.getAudioTracks() || []),
//           ...(partnerVideo.current?.srcObject?.getAudioTracks() || []),
//         ];
//         combinedStream = new MediaStream([...canvasStream.getVideoTracks(), ...audioTracks]);

//         if (includeWhiteboard && whiteboardVisible && whiteboardCanvasRef.current) {
//           const wbCanvas = whiteboardCanvasRef.current.canvas;
//           if (wbCanvas?.captureStream) {
//             const wbStream = wbCanvas.captureStream(30);
//             wbStream.getVideoTracks().forEach(track => combinedStream.addTrack(track));
//           }
//         }

//         mediaRecorderRef.current = new MediaRecorder(combinedStream, {
//           mimeType: 'video/webm; codecs=vp9,opus',
//           videoBitsPerSecond: 5000000,
//         });
//         mediaRecorderRef.current.ondataavailable = (e) => {
//           if (e.data.size > 0) {
//             recordedChunks.current.push(e.data);
//           }
//         };
//         mediaRecorderRef.current.onstop = () => {
//           const blob = new Blob(recordedChunks.current, { type: 'video/webm' });
//           const url = URL.createObjectURL(blob);
//           const a = document.createElement('a');
//           a.href = url;
//           a.download = `recording-${roomId}.webm`;
//           a.click();
//           URL.revokeObjectURL(url);
//           cancelAnimationFrame(animationFrameRef.current);
//         };
//         mediaRecorderRef.current.start();
//         setRecording(true);
//         toast.success('Recording started (canvas fallback). Performance may be limited.');
//       }
//     } catch (err) {
//       console.error('Recording error:', err);
//       toast.error('Error starting recording. Check permissions, update your browser, or try a different browser.');
//     }
//   };

//   const stopRecording = () => {
//     if (mediaRecorderRef.current) {
//       mediaRecorderRef.current.stop();
//       setRecording(false);
//       toast.success('Recording saved');
//     }
//   };

//   const endMeeting = async () => {
//     if (!isHost) {
//       toast.error('Only the host can end the meeting.');
//       return;
//     }
//     try {
//       const userId = localStorage.getItem('userId');
//       await API.post('/rooms/end', { roomId, userId });
//       socketRef.current.emit('end-meeting', userId);
//     } catch (err) {
//       toast.error('Error ending meeting');
//       console.error('End meeting error:', err);
//     }
//   };

//   const leaveRoom = async () => {
//     try {
//       const userId = localStorage.getItem('userId');
//       await API.post('/rooms/leave', { roomId, userId });
//       navigate('/room');
//       toast.success('Left the room');
//     } catch (err) {
//       toast.error('Error leaving room');
//       console.error('Leave room error:', err);
//     }
//   };

//   const handleWhiteboardChange = async () => {
//     if (!isRoomJoined) {
//       console.log('Skipping whiteboard-update: room not yet joined');
//       return;
//     }
//     if (whiteboardCanvasRef.current) {
//       try {
//         const paths = await whiteboardCanvasRef.current.exportPaths();
//         console.log('Emitting whiteboard paths:', paths);
//         socketRef.current.emit('whiteboard-update', paths);
//       } catch (err) {
//         console.error('Error exporting whiteboard paths:', err);
//         toast.error('Failed to sync whiteboard');
//       }
//     }
//   };

//   const handleClear = () => {
//     if (!isRoomJoined) {
//       console.log('Skipping whiteboard clear: room not yet joined');
//       return;
//     }
//     if (whiteboardCanvasRef.current) {
//       whiteboardCanvasRef.current.clearCanvas();
//       socketRef.current.emit('whiteboard-update', []);
//     }
//   };

//   const handleExport = async () => {
//     if (whiteboardCanvasRef.current) {
//       try {
//         const image = await whiteboardCanvasRef.current.exportImage('png');
//         const link = document.createElement('a');
//         link.download = 'whiteboard.png';
//         link.href = image;
//         link.click();
//       } catch (err) {
//         console.error('Error exporting whiteboard image:', err);
//         toast.error('Error exporting whiteboard');
//       }
//     }
//   };

//   const handleShareTypeChange = (e) => {
//     setShareType(e.target.value);
//   };

//   return (
//     <div className="relative min-h-screen px-4 py-10 pt-24 font-body bg-gradient-to-br from-indigo-100 via-pink-100 to-blue-100" style={{ backgroundImage: `url(${starsBg})`, backgroundRepeat: 'repeat' }}>
//       <motion.div
//         className="max-w-7xl mx-auto bg-white/80 backdrop-blur-2xl rounded-3xl p-6 shadow-2xl"
//         initial={{ opacity: 0 }}
//         animate={{ opacity: 1 }}
//         transition={{ duration: 0.6 }}
//         ref={screenRef}
//       >
//         <h2 className="text-3xl font-extrabold text-center text-indigo-700 mb-6">🚀 Video Conference Room</h2>

//         <motion.div
//           className={`grid gap-6 ${
//             screenSharing
//               ? 'lg:grid-cols-[3fr_1fr] grid-cols-1'
//               : 'lg:grid-cols-2 grid-cols-1'
//           }`}
//           initial={{ opacity: 0 }}
//           animate={{ opacity: 1 }}
//           transition={{ duration: 0.4 }}
//         >
//           {/* Main Content (Shared Screen or Whiteboard) */}
//           <motion.div
//             initial={{ x: -50, opacity: 0 }}
//             animate={{ x: 0, opacity: 1 }}
//             transition={{ duration: 0.4 }}
//           >
//             {screenSharing ? (
//               <div className="relative">
//                 <h3 className="text-xl font-semibold text-indigo-700 mb-2">🖥 Shared Screen</h3>
//                 <div className="border-4 border-indigo-200 rounded-xl h-[400px] overflow-hidden bg-black flex items-center justify-center">
//                   <video
//                     ref={sharedScreenVideo}
//                     autoPlay
//                     playsInline
//                     className="w-full h-full object-contain"
//                   />
//                   {!screenSharing && (
//                     <p className="text-white text-center">Waiting for screen share to start...</p>
//                   )}
//                 </div>
//               </div>
//             ) : whiteboardVisible ? (
//               <>
//                 <button
//                   className="text-sm mb-2 px-4 py-1 rounded-full bg-indigo-600 text-white hover:bg-indigo-700"
//                   onClick={() => setWhiteboardVisible(!whiteboardVisible)}
//                 >
//                   {whiteboardVisible ? 'Hide Whiteboard' : 'Show Whiteboard'}
//                 </button>
//                 <div className="bg-white p-4 rounded-xl shadow border border-indigo-200">
//                   <h3 className="text-xl font-semibold text-indigo-700 mb-2">🖊 Collaborative Whiteboard</h3>
//                   <div className="flex gap-3 text-sm mb-2">
//                     <select
//                       value={strokeColor}
//                       onChange={(e) => setStrokeColor(e.target.value)}
//                       className="border rounded px-2 py-1"
//                     >
//                       <option value="black">Black</option>
//                       <option value="red">Red</option>
//                       <option value="blue">Blue</option>
//                       <option value="green">Green</option>
//                     </select>
//                     <input
//                       type="range"
//                       min="1"
//                       max="10"
//                       value={strokeWidth}
//                       onChange={(e) => setStrokeWidth(Number(e.target.value))}
//                       className="w-24"
//                     />
//                     <button
//                       onClick={handleClear}
//                       className="bg-yellow-400 text-white px-2 rounded"
//                     >
//                       Clear
//                     </button>
//                     <button
//                       onClick={handleExport}
//                       className="bg-green-500 text-white px-2 rounded"
//                     >
//                       Export
//                     </button>
//                   </div>
//                   <ReactSketchCanvas
//                     ref={whiteboardCanvasRef}
//                     width="100%"
//                     height="400px"
//                     strokeColor={strokeColor}
//                     strokeWidth={strokeWidth}
//                     onChange={handleWhiteboardChange} // Changed from onStroke to onChange for better sync
//                     style={{ border: "2px dashed #ccc", borderRadius: 10, background: "#fefefe" }}
//                   />
//                 </div>
//               </>
//             ) : (
//               <button
//                 className="text-sm px-4 py-1 rounded-full bg-indigo-600 text-white hover:bg-indigo-700"
//                 onClick={() => setWhiteboardVisible(!whiteboardVisible)}
//               >
//                 Show Whiteboard
//               </button>
//             )}
//           </motion.div>

//           {/* Video Feeds (Right Column during Screen Sharing) */}
//           <motion.div
//             className={screenSharing ? 'flex flex-col space-y-4' : ''}
//             initial={{ x: 50, opacity: 0 }}
//             animate={{ x: 0, opacity: 1 }}
//             transition={{ duration: 0.4, delay: 0.2 }}
//           >
//             <h3 className="text-xl font-semibold text-indigo-700 mb-2">🎥 Video Feed</h3>
//             <div className="space-y-4">
//               <div className="border-4 border-indigo-300 rounded-xl">
//                 <video
//                   ref={userVideo}
//                   autoPlay
//                   muted
//                   playsInline
//                   className="w-full h-52 object-cover bg-black"
//                 />
//                 <p className="text-center text-xs bg-indigo-50">🎤 You {isHost ? '(Host)' : '(Participant)'}</p>
//               </div>
//               <div className="border-4 border-pink-300 rounded-xl">
//                 <video
//                   ref={partnerVideo}
//                   autoPlay
//                   playsInline
//                   className="w-full h-52 object-cover bg-black"
//                 />
//                 <p className="text-center text-xs bg-pink-50">🎥 {isHost ? 'Participant' : 'Host'}</p>
//               </div>
//               <div className="flex justify-center flex-wrap gap-3 mt-2">
//                 <button
//                   onClick={toggleMic}
//                   className="text-white bg-indigo-500 p-2 rounded-full"
//                 >
//                   {micOn ? <Mic /> : <MicOff />}
//                 </button>
//                 <button
//                   onClick={toggleVideo}
//                   className="text-white bg-purple-500 p-2 rounded-full"
//                 >
//                   {videoOn ? <Video /> : <VideoOff />}
//                 </button>
//                 <select
//                   value={shareType}
//                   onChange={handleShareTypeChange}
//                   className="text-sm px-2 py-1 rounded bg-blue-600 text-white hover:bg-blue-700"
//                 >
//                   <option value="entire">Entire Screen</option>
//                   <option value="window">Window</option>
//                   <option value="tab">Chrome Tab</option>
//                 </select>
//                 <button
//                   onClick={shareScreen}
//                   className="text-white bg-blue-600 p-2 rounded-full"
//                 >
//                   {screenSharing ? <MonitorX /> : <Monitor />}
//                 </button>
//                 {!recording && (
//                   <button
//                     onClick={startRecording}
//                     className="bg-green-500 text-white p-2 rounded-full"
//                   >
//                     <CircleDot />
//                   </button>
//                 )}
//                 {recording && (
//                   <button
//                     onClick={stopRecording}
//                     className="bg-red-600 text-white p-2 rounded-full"
//                   >
//                     <Square />
//                   </button>
//                 )}
//                 {isHost && (
//                   <button
//                     onClick={endMeeting}
//                     className="bg-red-800 text-white p-2 rounded-full"
//                     title="End meeting for all"
//                   >
//                     <PhoneOff />
//                   </button>
//                 )}
//                 <button
//                   onClick={leaveRoom}
//                   className="bg-orange-600 text-white p-2 rounded-full"
//                 >
//                   Leave Room
//                 </button>
//               </div>
//               <div className="text-center mt-2 text-sm">
//                 <label className={`mr-2 font-medium text-indigo-700 ${!whiteboardVisible ? "opacity-50 cursor-not-allowed" : ""}`}>
//                   <input
//                     type="checkbox"
//                     disabled={!whiteboardVisible}
//                     checked={includeWhiteboard}
//                     onChange={() => setIncludeWhiteboard(!includeWhiteboard)}
//                   />
//                   {' '}Record Whiteboard?
//                 </label>
//               </div>
//             </div>
//           </motion.div>
//         </motion.div>

//         <canvas
//           ref={recordingCanvasRef}
//           width="1920"
//           height="1080"
//           style={{ display: 'none' }}
//         />
//       </motion.div>
//     </div>
//   );
// };

// export default LiveRoom;
import React, { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import io from 'socket.io-client';
import Peer from 'simple-peer';
import { ReactSketchCanvas } from 'react-sketch-canvas';
import { toast } from 'react-hot-toast';
import { motion } from 'framer-motion';
import html2canvas from 'html2canvas';
import API from '../services/api';
import {
  Mic, MicOff, Video, VideoOff, PhoneOff,
  CircleDot, Square, Monitor, MonitorX
} from 'lucide-react';
import starsBg from '../assets/stars.svg';

const LiveRoom = () => {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const [isHost, setIsHost] = useState(false);
  const [videoOn, setVideoOn] = useState(true);
  const [micOn, setMicOn] = useState(true);
  const [screenSharing, setScreenSharing] = useState(false);
  const [recording, setRecording] = useState(false);
  const [strokeColor, setStrokeColor] = useState('black');
  const [strokeWidth, setStrokeWidth] = useState(4);
  const [whiteboardVisible, setWhiteboardVisible] = useState(true);
  const [includeWhiteboard, setIncludeWhiteboard] = useState(true);
  const [shareType, setShareType] = useState('entire');
  const [isRoomJoined, setIsRoomJoined] = useState(false);
  const userVideo = useRef();
  const partnerVideo = useRef();
  const screenStream = useRef();
  const sharedScreenVideo = useRef();
  const socketRef = useRef();
  const videoPeerRef = useRef();
  const screenPeerRef = useRef();
  const mediaRecorderRef = useRef();
  const recordedChunks = useRef([]);
  const userStream = useRef();
  const screenRef = useRef();
  const recordingCanvasRef = useRef();
  const whiteboardCanvasRef = useRef();
  const animationFrameRef = useRef();

  useEffect(() => {
    socketRef.current = io('https://skillsync-cvqg.onrender.com', {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    socketRef.current.on('connect', () => {
      console.log('Socket.IO connected:', socketRef.current.id);
      const userId = localStorage.getItem('userId');
      if (userId && roomId && !isRoomJoined) {
        socketRef.current.emit('join-room', { roomId, userId });
      }
    });

    socketRef.current.on('connect_error', (err) => {
      console.error('Socket.IO connection error:', err);
      toast.error('Failed to connect to server. Please ensure the backend is running on port 5000.');
    });

    socketRef.current.on('room-joined', () => {
      console.log(`[${new Date().toISOString()}] Room ${roomId} joined successfully`);
      setIsRoomJoined(true);
    });

    const initializeMedia = async () => {
      try {
        const userId = localStorage.getItem('userId');
        if (!userId) {
          toast.error('Please log in to access the room');
          navigate('/login');
          return;
        }

        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        userStream.current = stream;
        if (userVideo.current) {
          userVideo.current.srcObject = stream;
          userVideo.current.play().catch((err) => console.error('Error playing user video:', err));
        }

        const res = await API.get(`/rooms/past/${userId}`);
        const room = res.data?.find((r) => r.roomId === roomId);
        if (room && room.host?._id) {
          setIsHost(room.host._id.toString() === userId);
          console.log(`[LiveRoom] User ${userId} is ${room.host._id.toString() === userId ? 'host' : 'participant'}`);
        } else {
          toast.error('Room data not found. Redirecting...');
          navigate('/room');
          return;
        }

        socketRef.current.emit('join-room', { roomId, userId });

        socketRef.current.on('user-connected', (connectedUserId) => {
          console.log('User connected:', connectedUserId);
          if (connectedUserId === userId) return;

          const videoPeer = new Peer({ initiator: true, trickle: false, stream });
          videoPeerRef.current = videoPeer;

          videoPeer.on('signal', (data) => {
            socketRef.current.emit('signal', { userId: connectedUserId, signal: data, type: 'video' });
          });

          videoPeer.on('stream', (partnerStream) => {
            console.log('Received video stream:', partnerStream.active, partnerStream.getTracks());
            if (partnerVideo.current) {
              partnerVideo.current.srcObject = partnerStream;
              partnerVideo.current.play().catch((err) => console.error('Error playing partner video:', err));
            }
          });

          videoPeer.on('error', (err) => {
            console.error('Video peer error:', err);
            toast.error('Video connection failed');
          });
        });

        socketRef.current.on('signal', ({ signal, type, from }) => {
          if (type === 'video') {
            if (!videoPeerRef.current) {
              videoPeerRef.current = new Peer({ initiator: false, trickle: false, stream });
              videoPeerRef.current.on('signal', (data) => {
                socketRef.current.emit('signal', { userId: from, signal: data, type: 'video' });
              });
              videoPeerRef.current.on('stream', (partnerStream) => {
                console.log('Received video stream:', partnerStream.active, partnerStream.getTracks());
                if (partnerVideo.current) {
                  partnerVideo.current.srcObject = partnerStream;
                  partnerVideo.current.play().catch((err) => console.error('Error playing partner video:', err));
                }
              });
              videoPeerRef.current.on('error', (err) => {
                console.error('Video peer error:', err);
                toast.error('Video connection failed');
              });
            }
            videoPeerRef.current.signal(signal);
          }
        });

        socketRef.current.on('screen-signal', ({ signal, from }) => {
          if (screenPeerRef.current) {
            console.log('Received screen signal:', JSON.stringify(signal).substring(0, 100));
            screenPeerRef.current.signal(signal).catch((err) => {
              console.error('Error signaling screen peer:', err);
            });
          } else if (!isHost) {
            console.log('Initializing screen peer for participant');
            screenPeerRef.current = new Peer({ initiator: false, trickle: false });

            screenPeerRef.current.on('signal', (data) => {
              console.log('Emitting screen signal for participant:', JSON.stringify(data).substring(0, 100));
              socketRef.current.emit('screen-signal', { userId, signal: data });
            });

            screenPeerRef.current.on('stream', (screenPartnerStream) => {
              console.log('Received screen stream:', screenPartnerStream.active, screenPartnerStream.getTracks());
              if (sharedScreenVideo.current) {
                sharedScreenVideo.current.srcObject = screenPartnerStream;
                const playWithRetry = async (attempts = 5, delay = 500) => {
                  try {
                    await sharedScreenVideo.current.play();
                  } catch (err) {
                    console.error('Error playing shared screen video:', err);
                    if (attempts > 0) {
                      setTimeout(() => playWithRetry(attempts - 1, delay * 2), delay);
                    } else {
                      toast.error('Failed to display shared screen. Ensure the host is sharing and permissions are granted.');
                    }
                  }
                };
                playWithRetry();
              }
            });

            screenPeerRef.current.on('error', (err) => {
              console.error('Screen peer error:', err);
              toast.error('Screen sharing connection failed.');
            });

            screenPeerRef.current.signal(signal);
          }
        });

        socketRef.current.on('screen-share', async (streamId) => {
          console.log('Screen share event received:', streamId);
          setScreenSharing(!!streamId);
          if (!streamId) {
            if (sharedScreenVideo.current) {
              sharedScreenVideo.current.srcObject = null;
            }
            if (screenPeerRef.current) {
              screenPeerRef.current.destroy();
              screenPeerRef.current = null;
            }
          }
        });

        socketRef.current.on('draw', (data) => {
          console.log('Received whiteboard data:', data.length);
          if (whiteboardCanvasRef.current) {
            whiteboardCanvasRef.current.loadPaths(data).catch((err) => {
              console.error('Error loading whiteboard paths:', err);
              toast.error('Failed to sync whiteboard');
            });
          }
        });

        socketRef.current.on('meeting-ended', () => {
          console.log('Meeting ended, redirecting to /room');
          navigate('/room');
          toast.success('Meeting ended by host');
        });

        socketRef.current.on('end-meeting-error', (message) => {
          console.error('End meeting error:', message);
          toast.error(message);
        });

        socketRef.current.on('user-disconnected', (userId) => {
          console.log('User disconnected:', userId);
          if (partnerVideo.current) {
            partnerVideo.current.srcObject = null;
          }
          if (sharedScreenVideo.current) {
            sharedScreenVideo.current.srcObject = null;
          }
          setScreenSharing(false);
          if (screenPeerRef.current) {
            screenPeerRef.current.destroy();
            screenPeerRef.current = null;
          }
        });
      } catch (err) {
        console.error('Media initialization error:', err);
        toast.error('Error accessing camera or microphone. Please check permissions and try again.');
        navigate('/room');
      }
    };

    initializeMedia();

    return () => {
      socketRef.current.emit('leave-room', { roomId, userId: localStorage.getItem('userId') });
      socketRef.current.disconnect();
      if (userStream.current) {
        userStream.current.getTracks().forEach((track) => track.stop());
      }
      if (screenStream.current) {
        screenStream.current.getTracks().forEach((track) => track.stop());
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (videoPeerRef.current) {
        videoPeerRef.current.destroy();
        videoPeerRef.current = null;
      }
      if (screenPeerRef.current) {
        screenPeerRef.current.destroy();
        screenPeerRef.current = null;
      }
    };
  }, [roomId, navigate]);

  const toggleVideo = () => {
    if (userStream.current) {
      userStream.current.getVideoTracks()[0].enabled = !videoOn;
      setVideoOn(!videoOn);
      toast.success(videoOn ? 'Video turned off' : 'Video turned on');
    }
  };

  const toggleMic = () => {
    if (userStream.current) {
      userStream.current.getAudioTracks()[0].enabled = !micOn;
      setMicOn(!micOn);
      toast.success(micOn ? 'Microphone muted' : 'Microphone unmuted');
    }
  };

  const shareScreen = async () => {
    if (!isRoomJoined) {
      toast.error('Please wait until the room is joined before sharing screen.');
      return;
    }

    const userId = localStorage.getItem('userId');
    if (screenSharing) {
      console.log(`[${new Date().toISOString()}] Stopping screen sharing for user ${userId} in room ${roomId}`);
      if (screenStream.current) {
        screenStream.current.getTracks().forEach((track) => track.stop());
        screenStream.current = null;
      }
      if (screenPeerRef.current) {
        screenPeerRef.current.destroy();
        screenPeerRef.current = null;
      }
      if (sharedScreenVideo.current) {
        sharedScreenVideo.current.srcObject = null;
        console.log(`[${new Date().toISOString()}] Cleared sharedScreenVideo srcObject`);
      }
      setScreenSharing(false);
      socketRef.current.emit('screen-share', null);
      socketRef.current.emit('screen-sharing-stopped', { roomId });
      console.log(`[${new Date().toISOString()}] Emitted screen-share null and screen-sharing-stopped for room ${roomId}`);
      toast.success('Screen sharing stopped');
      return;
    }

    console.log(`[${new Date().toISOString()}] Starting screen sharing for user ${userId} in room ${roomId}`);
    try {
      if (!navigator.mediaDevices.getDisplayMedia) {
        throw new Error('Screen sharing is not supported in this browser.');
      }

      const constraints = {
        video: {
          cursor: 'always',
          displaySurface: shareType,
          width: { ideal: 1920, max: 1920 },
          height: { ideal: 1080, max: 1080 },
          frameRate: { ideal: 30 },
        },
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100,
        },
      };

      const stream = await navigator.mediaDevices.getDisplayMedia(constraints);
      screenStream.current = stream;
      console.log(`[${new Date().toISOString()}] Acquired screen stream with tracks:`, stream.getTracks());

      if (!stream.getVideoTracks().length) {
        throw new Error('No video tracks available for screen sharing.');
      }

      if (!stream.getVideoTracks()[0].enabled) {
        throw new Error('Screen sharing stream is disabled. Ensure the shared window is visible.');
      }

      if (shareType === 'tab') {
        toast.warn(
          'Sharing the meeting tab may cause an infinity mirror effect. For best results, share a different tab or window.',
          { duration: 5000 }
        );
      }

      if (screenPeerRef.current) {
        screenPeerRef.current.destroy();
        console.log(`[${new Date().toISOString()}] Destroyed existing screenPeerRef`);
      }
      screenPeerRef.current = new Peer({ initiator: true, trickle: false, stream });
      console.log(`[${new Date().toISOString()}] Initialized new screenPeerRef with stream`);

      screenPeerRef.current.on('signal', (data) => {
        console.log(`[${new Date().toISOString()}] Emitting screen signal for sharer:`, JSON.stringify(data).substring(0, 100));
        socketRef.current.emit('screen-signal', { userId, signal: data });
      });

      screenPeerRef.current.on('stream', (peerStream) => {
        console.log(`[${new Date().toISOString()}] Screen peer received stream with tracks:`, peerStream.getTracks());
      });

      screenPeerRef.current.on('error', (err) => {
        console.error(`[${new Date().toISOString()}] Screen peer error:`, err);
        toast.error('Screen sharing connection failed.');
      });

      if (sharedScreenVideo.current) {
        sharedScreenVideo.current.srcObject = stream;
        console.log(`[${new Date().toISOString()}] Set sharedScreenVideo srcObject to stream with tracks:`, stream.getTracks());
        const playWithRetry = async (attempts = 5, delay = 500) => {
          try {
            await sharedScreenVideo.current.play();
            console.log(`[${new Date().toISOString()}] Successfully played sharedScreenVideo`);
          } catch (err) {
            console.error(`[${new Date().toISOString()}] Error playing shared screen video:`, err);
            if (attempts > 0) {
              setTimeout(() => playWithRetry(attempts - 1, delay * 2), delay);
            } else {
              toast.error('Failed to display shared screen. Ensure the shared window is visible.');
            }
          }
        };
        playWithRetry();
      }

      socketRef.current.emit('screen-share', stream.id);
      socketRef.current.emit('screen-sharing-started', { roomId, userId });
      console.log(`[${new Date().toISOString()}] Emitted screen-share with stream.id ${stream.id} and screen-sharing-started for room ${roomId}`);
      setScreenSharing(true);

      stream.getVideoTracks()[0].onended = () => {
        console.log(`[${new Date().toISOString()}] Screen sharing stream ended for user ${userId}`);
        if (screenPeerRef.current) {
          screenPeerRef.current.destroy();
          screenPeerRef.current = null;
        }
        if (sharedScreenVideo.current) {
          sharedScreenVideo.current.srcObject = null;
        }
        setScreenSharing(false);
        socketRef.current.emit('screen-share', null);
        socketRef.current.emit('screen-sharing-stopped', { roomId });
        screenStream.current = null;
        toast.success('Screen sharing stopped');
      };
    } catch (err) {
      console.error(`[${new Date().toISOString()}] Screen sharing error:`, err);
      let errorMessage = 'Error sharing screen. Please try again.';
      if (err.name === 'NotAllowedError') {
        errorMessage = 'Screen sharing permission denied. Please enable screen recording permissions.';
      } else if (err.name === 'NotFoundError') {
        errorMessage = 'No screen or window available to share. Ensure a valid window or tab is open.';
      } else if (err.name === 'NotSupportedError') {
        errorMessage = 'Screen sharing is not supported in this browser. Use Chrome, Edge, or Firefox.';
      }
      toast.error(errorMessage);
    }
  };

  const startRecording = async () => {
    try {
      recordedChunks.current = [];
      let combinedStream;

      try {
        const displayStream = await navigator.mediaDevices.getDisplayMedia({
          video: {
            cursor: 'always',
            displaySurface: shareType,
            width: { ideal: 1920, max: 1920 },
            height: { ideal: 1080, max: 1080 },
            frameRate: { ideal: 30 },
          },
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            sampleRate: 44100,
          },
        });
        if (!displayStream.getVideoTracks().length) {
          throw new Error('No video tracks available');
        }
        const audioTracks = [
          ...(userStream.current?.getAudioTracks() || []),
          ...(partnerVideo.current?.srcObject?.getAudioTracks() || []),
        ];
        combinedStream = new MediaStream([
          ...displayStream.getVideoTracks(),
          ...audioTracks,
        ]);

        if (includeWhiteboard && whiteboardVisible && whiteboardCanvasRef.current) {
          const wbCanvas = whiteboardCanvasRef.current.canvas;
          if (wbCanvas?.captureStream) {
            const wbStream = wbCanvas.captureStream(30);
            wbStream.getVideoTracks().forEach(track => combinedStream.addTrack(track));
          }
        }

        mediaRecorderRef.current = new MediaRecorder(combinedStream, {
          mimeType: 'video/webm; codecs=vp9,opus',
          videoBitsPerSecond: 5000000,
        });
        mediaRecorderRef.current.ondataavailable = (e) => {
          if (e.data.size > 0) {
            recordedChunks.current.push(e.data);
          }
        };
        mediaRecorderRef.current.onstop = () => {
          const blob = new Blob(recordedChunks.current, { type: 'video/webm' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `recording-${roomId}.webm`;
          a.click();
          URL.revokeObjectURL(url);
          displayStream.getTracks().forEach((track) => track.stop());
        };
        mediaRecorderRef.current.start();
        setRecording(true);
        toast.success('Recording started. Ensure the shared window is not minimized.');
      } catch (err) {
        console.warn('getDisplayMedia failed, falling back to html2canvas:', err);
        const canvas = recordingCanvasRef.current;
        canvas.width = 1920;
        canvas.height = 1080;
        const ctx = canvas.getContext('2d');

        const draw = async () => {
          if (!screenRef.current) return;
          try {
            const tempCanvas = await html2canvas(screenRef.current, {
              scale: 2,
              useCORS: true,
              allowTaint: true,
              width: 1920,
              height: 1080,
              logging: true,
            });
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(tempCanvas, 0, 0, canvas.width, canvas.height);
            animationFrameRef.current = requestAnimationFrame(draw);
          } catch (err) {
            console.error('html2canvas error:', err);
          }
        };
        animationFrameRef.current = requestAnimationFrame(draw);

        const canvasStream = canvas.captureStream(30);
        const audioTracks = [
          ...(userStream.current?.getAudioTracks() || []),
          ...(partnerVideo.current?.srcObject?.getAudioTracks() || []),
        ];
        combinedStream = new MediaStream([...canvasStream.getVideoTracks(), ...audioTracks]);

        if (includeWhiteboard && whiteboardVisible && whiteboardCanvasRef.current) {
          const wbCanvas = whiteboardCanvasRef.current.canvas;
          if (wbCanvas?.captureStream) {
            const wbStream = wbCanvas.captureStream(30);
            wbStream.getVideoTracks().forEach(track => combinedStream.addTrack(track));
          }
        }

        mediaRecorderRef.current = new MediaRecorder(combinedStream, {
          mimeType: 'video/webm; codecs=vp9,opus',
          videoBitsPerSecond: 5000000,
        });
        mediaRecorderRef.current.ondataavailable = (e) => {
          if (e.data.size > 0) {
            recordedChunks.current.push(e.data);
          }
        };
        mediaRecorderRef.current.onstop = () => {
          const blob = new Blob(recordedChunks.current, { type: 'video/webm' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `recording-${roomId}.webm`;
          a.click();
          URL.revokeObjectURL(url);
          cancelAnimationFrame(animationFrameRef.current);
        };
        mediaRecorderRef.current.start();
        setRecording(true);
        toast.success('Recording started (canvas fallback). Performance may be limited.');
      }
    } catch (err) {
      console.error('Recording error:', err);
      toast.error('Error starting recording. Check permissions, update your browser, or try a different browser.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setRecording(false);
      toast.success('Recording saved');
    }
  };

  const endMeeting = async () => {
    if (!isHost) {
      toast.error('Only the host can end the meeting.');
      return;
    }
    try {
      const userId = localStorage.getItem('userId');
      console.log(`[LiveRoom] Attempting to end meeting for room ${roomId} by user ${userId}`);
      
      let attempts = 3;
      let success = false;
      while (attempts > 0 && !success) {
        try {
          await API.post('/rooms/end', { roomId, userId });
          success = true;
        } catch (apiErr) {
          console.error(`[LiveRoom] API attempt ${4 - attempts} failed:`, apiErr.response?.data || apiErr.message);
          attempts--;
          if (attempts === 0) throw apiErr;
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      }

      socketRef.current.emit('end-meeting', userId);
      console.log('[LiveRoom] Emitted end-meeting for:', roomId);
      toast.success('Meeting ended for all');
    } catch (err) {
      console.error('[LiveRoom] Error ending meeting:', err.response?.data || err.message);
      toast.error(`Error ending meeting: ${err.response?.data?.message || 'Server error'}`);
    }
  };

  const leaveRoom = async () => {
    try {
      const userId = localStorage.getItem('userId');
      await API.post('/rooms/leave', { roomId, userId });
      socketRef.current.emit('leave-room', { roomId, userId });
      navigate('/room');
      toast.success('Left the room');
    } catch (err) {
      console.error('[LiveRoom] Error leaving room:', err);
      toast.error('Error leaving room');
    }
  };

  const handleWhiteboardChange = async () => {
    if (!isRoomJoined) {
      console.log('Skipping whiteboard update: room not yet joined');
      return;
    }
    if (whiteboardCanvasRef.current) {
      try {
        const paths = await whiteboardCanvasRef.current.exportPaths();
        console.log('Emitting whiteboard paths:', paths.length);
        socketRef.current.emit('draw', { roomId, data: paths });
      } catch (err) {
        console.error('Error exporting whiteboard paths:', err);
        toast.error('Failed to sync whiteboard');
      }
    }
  };

  const handleClear = () => {
    if (!isRoomJoined) {
      console.log('Skipping whiteboard clear: room not yet joined');
      return;
    }
    if (whiteboardCanvasRef.current) {
      whiteboardCanvasRef.current.clearCanvas();
      socketRef.current.emit('draw', { roomId, data: [] });
      toast.success('Whiteboard cleared');
    }
  };

  const handleExport = async () => {
    if (whiteboardCanvasRef.current) {
      try {
        const image = await whiteboardCanvasRef.current.exportImage('png');
        const link = document.createElement('a');
        link.download = `whiteboard-${roomId}.png`;
        link.href = image;
        link.click();
        toast.success('Whiteboard exported');
      } catch (err) {
        console.error('Error exporting whiteboard image:', err);
        toast.error('Error exporting whiteboard');
      }
    }
  };

  const handleShareTypeChange = (e) => {
    setShareType(e.target.value);
  };

  return (
    <div className="relative min-h-screen px-4 py-10 pt-24 font-body bg-gradient-to-br from-indigo-100 via-pink-100 to-blue-100" style={{ backgroundImage: `url(${starsBg})`, backgroundRepeat: 'repeat' }}>
      <motion.div
        className="max-w-7xl mx-auto bg-white/80 backdrop-blur-2xl rounded-3xl p-6 shadow-2xl"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        ref={screenRef}
      >
        <h2 className="text-3xl font-extrabold text-center text-indigo-700 mb-6">🚀 Video Conference Room</h2>

        <motion.div
          className={`grid gap-6 ${
            screenSharing
              ? 'lg:grid-cols-[3fr_1fr] grid-cols-1'
              : 'lg:grid-cols-2 grid-cols-1'
          }`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4 }}
        >
          <motion.div
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.4 }}
          >
            {screenSharing ? (
              <div className="relative">
                <h3 className="text-xl font-semibold text-indigo-700 mb-2">🖥 Shared Screen</h3>
                <div className="border-4 border-indigo-200 rounded-xl h-[400px] overflow-hidden bg-black flex items-center justify-center">
                  <video
                    ref={sharedScreenVideo}
                    autoPlay
                    playsInline
                    className="w-full h-full object-contain"
                  />
                  {!screenSharing && (
                    <p className="text-white text-center">Waiting for screen share to start...</p>
                  )}
                </div>
              </div>
            ) : whiteboardVisible ? (
              <>
                <button
                  className="text-sm mb-2 px-4 py-1 rounded-full bg-indigo-600 text-white hover:bg-indigo-700"
                  onClick={() => setWhiteboardVisible(!whiteboardVisible)}
                >
                  {whiteboardVisible ? 'Hide Whiteboard' : 'Show Whiteboard'}
                </button>
                <div className="bg-white p-4 rounded-xl shadow border border-indigo-200">
                  <h3 className="text-xl font-semibold text-indigo-700 mb-2">🖊 Collaborative Whiteboard</h3>
                  <div className="flex gap-3 text-sm mb-2">
                    <select
                      value={strokeColor}
                      onChange={(e) => setStrokeColor(e.target.value)}
                      className="border rounded px-2 py-1"
                    >
                      <option value="black">Black</option>
                      <option value="red">Red</option>
                      <option value="blue">Blue</option>
                      <option value="green">Green</option>
                    </select>
                    <input
                      type="range"
                      min="1"
                      max="10"
                      value={strokeWidth}
                      onChange={(e) => setStrokeWidth(Number(e.target.value))}
                      className="w-24"
                    />
                    <button
                      onClick={handleClear}
                      className="bg-yellow-400 text-white px-2 rounded hover:bg-yellow-500"
                    >
                      Clear
                    </button>
                    <button
                      onClick={handleExport}
                      className="bg-green-500 text-white px-2 rounded hover:bg-green-600"
                    >
                      Export
                    </button>
                  </div>
                  <ReactSketchCanvas
                    ref={whiteboardCanvasRef}
                    width="100%"
                    height="400px"
                    strokeColor={strokeColor}
                    strokeWidth={strokeWidth}
                    onChange={handleWhiteboardChange}
                    style={{ border: "2px dashed #ccc", borderRadius: 10, background: "#fefefe" }}
                  />
                </div>
              </>
            ) : (
              <button
                className="text-sm px-4 py-1 rounded-full bg-indigo-600 text-white hover:bg-indigo-700"
                onClick={() => setWhiteboardVisible(!whiteboardVisible)}
              >
                Show Whiteboard
              </button>
            )}
          </motion.div>

          <motion.div
            className={screenSharing ? 'flex flex-col space-y-4' : ''}
            initial={{ x: 50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.2 }}
          >
            <h3 className="text-xl font-semibold text-indigo-700 mb-2">🎥 Video Feed</h3>
            <div className="space-y-4">
              <div className="border-4 border-indigo-300 rounded-xl">
                <video
                  ref={userVideo}
                  autoPlay
                  muted
                  playsInline
                  className="w-full h-52 object-cover bg-black"
                />
                <p className="text-center text-xs bg-indigo-50">🎤 You {isHost ? '(Host)' : '(Participant)'}</p>
              </div>
              <div className="border-4 border-pink-300 rounded-xl">
                <video
                  ref={partnerVideo}
                  autoPlay
                  playsInline
                  className="w-full h-52 object-cover bg-black"
                />
                <p className="text-center text-xs bg-pink-50">🎥 {isHost ? 'Participant' : 'Host'}</p>
              </div>
              <div className="flex justify-center flex-wrap gap-3 mt-2">
                <button
                  onClick={toggleMic}
                  className="text-white bg-indigo-500 p-2 rounded-full hover:bg-indigo-600"
                >
                  {micOn ? <Mic /> : <MicOff />}
                </button>
                <button
                  onClick={toggleVideo}
                  className="text-white bg-purple-500 p-2 rounded-full hover:bg-purple-600"
                >
                  {videoOn ? <Video /> : <VideoOff />}
                </button>
                <select
                  value={shareType}
                  onChange={handleShareTypeChange}
                  className="text-sm px-2 py-1 rounded bg-blue-600 text-white hover:bg-blue-700"
                >
                  <option value="entire">Entire Screen</option>
                  <option value="window">Window</option>
                  <option value="tab">Chrome Tab</option>
                </select>
                <button
                  onClick={shareScreen}
                  className="text-white bg-blue-600 p-2 rounded-full hover:bg-blue-700"
                >
                  {screenSharing ? <MonitorX /> : <Monitor />}
                </button>
                {!recording && (
                  <button
                    onClick={startRecording}
                    className="bg-green-500 text-white p-2 rounded-full hover:bg-green-600"
                  >
                    <CircleDot />
                  </button>
                )}
                {recording && (
                  <button
                    onClick={stopRecording}
                    className="bg-red-600 text-white p-2 rounded-full hover:bg-red-700"
                  >
                    <Square />
                  </button>
                )}
                {isHost && (
                  <button
                    onClick={endMeeting}
                    className="bg-red-800 text-white p-2 rounded-full hover:bg-red-900"
                    title="End meeting for all"
                  >
                    <PhoneOff />
                  </button>
                )}
                <button
                  onClick={leaveRoom}
                  className="bg-orange-600 text-white p-2 rounded-full hover:bg-orange-700"
                >
                  Leave Room
                </button>
              </div>
              <div className="text-center mt-2 text-sm">
                <label className={`mr-2 font-medium text-indigo-700 ${!whiteboardVisible ? "opacity-50 cursor-not-allowed" : ""}`}>
                  <input
                    type="checkbox"
                    disabled={!whiteboardVisible}
                    checked={includeWhiteboard}
                    onChange={() => setIncludeWhiteboard(!includeWhiteboard)}
                  />
                  {' '}Record Whiteboard?
                </label>
              </div>
            </div>
          </motion.div>
        </motion.div>

        <canvas
          ref={recordingCanvasRef}
          width="1920"
          height="1080"
          style={{ display: 'none' }}
        />
      </motion.div>
    </div>
  );
};

export default LiveRoom;