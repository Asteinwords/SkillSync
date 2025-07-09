// 🛠 Fix "global is not defined" error (Peer.js compatibility with Vite)
window.global = window;

import React, { useEffect, useRef, useState } from 'react';
import io from 'socket.io-client';
import Peer from 'simple-peer';
import { useParams, useNavigate } from 'react-router-dom';
import { ReactSketchCanvas } from 'react-sketch-canvas';
import { Mic, MicOff, Video, VideoOff, PhoneOff } from 'lucide-react';
import starsBg from '../assets/stars.svg';

const socket = io("http://localhost:5000");

const LiveRoom = () => {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const role = localStorage.getItem("role");

  const [strokeColor, setStrokeColor] = useState('black');
  const [strokeWidth, setStrokeWidth] = useState(4);
  const [peer, setPeer] = useState(null);
  const [stream, setStream] = useState(null);
  const [micOn, setMicOn] = useState(true);
  const [videoOn, setVideoOn] = useState(true);

  const myVideo = useRef();
  const peerVideo = useRef();
  const canvasRef = useRef();

  useEffect(() => {
    let currentPeer = null;

    navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then(currentStream => {
      setStream(currentStream);
      if (myVideo.current) myVideo.current.srcObject = currentStream;

      socket.emit('joinRoom', { roomId });

      socket.on('signal', ({ from, signal }) => {
        if (currentPeer) return;

        const peer = new Peer({ initiator: false, trickle: false, stream: currentStream });

        peer.on('signal', data => {
          socket.emit('signal', { to: from, from: socket.id, signal: data });
        });

        peer.on('stream', userStream => {
          if (peerVideo.current) peerVideo.current.srcObject = userStream;
        });

        peer.signal(signal);
        setPeer(peer);
        currentPeer = peer;
      });

      socket.on('user-joined', (otherUserId) => {
        const peer = new Peer({ initiator: true, trickle: false, stream: currentStream });

        peer.on('signal', data => {
          socket.emit('signal', { to: otherUserId, from: socket.id, signal: data });
        });

        peer.on('stream', userStream => {
          if (peerVideo.current) peerVideo.current.srcObject = userStream;
        });

        setPeer(peer);
        currentPeer = peer;
      });

      socket.on("room-ended", () => {
        alert("The host has ended the session.");
        cleanup();
        navigate("/dashboard");
      });
    });

    socket.on("draw", (data) => {
      if (canvasRef.current) canvasRef.current.loadPaths(data);
    });

    return () => {
      socket.off("signal");
      socket.off("user-joined");
      socket.off("draw");
      socket.off("room-ended");
      cleanup();
    };
  }, [roomId]);

  const cleanup = () => {
    if (peer) peer.destroy();
    if (stream) stream.getTracks().forEach(track => track.stop());
  };

  const handleDraw = async () => {
    const paths = await canvasRef.current?.exportPaths();
    socket.emit("draw", { roomId, data: paths });
  };

  const handleClear = () => canvasRef.current?.clearCanvas();

  const handleExport = async () => {
    const image = await canvasRef.current.exportImage('png');
    const link = document.createElement('a');
    link.download = 'whiteboard.png';
    link.href = image;
    link.click();
  };

  const toggleMic = () => {
    const audioTrack = stream?.getAudioTracks()?.[0];
    if (audioTrack) {
      audioTrack.enabled = !micOn;
      setMicOn(!micOn);
    }
  };

  const toggleVideo = () => {
    const videoTrack = stream?.getVideoTracks()?.[0];
    if (videoTrack) {
      videoTrack.enabled = !videoOn;
      setVideoOn(!videoOn);
    }
  };

  const handleEndSession = () => {
    socket.emit("end-room", { roomId });
    cleanup();
    navigate("/dashboard");
  };

  return (
    <div
      className="relative min-h-screen bg-gradient-to-br from-indigo-100 via-pink-100 to-blue-100 px-4 py-10 pt-24 font-body "
      style={{ backgroundImage: `url(${starsBg})`, backgroundRepeat: 'repeat', backgroundSize: 'cover' }}
    >
      <div className="max-w-7xl mx-auto relative z-10 bg-white/80 backdrop-blur-2xl rounded-3xl p-6 shadow-2xl">
        <h2 className="text-3xl font-extrabold text-center text-indigo-700 mb-6 font-display tracking-wide animate-fade-in">
          🚀 Live Learning Room
        </h2>

        {/* Side-by-side layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left: Videos + Controls */}
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="border-4 border-indigo-300 rounded-xl overflow-hidden shadow-md">
                <video playsInline muted ref={myVideo} autoPlay className="w-full h-52 object-cover bg-black" />
                <p className="text-center py-1 text-xs bg-indigo-50">🎤 You ({role})</p>
              </div>
              <div className="border-4 border-pink-300 rounded-xl overflow-hidden shadow-md">
                <video playsInline ref={peerVideo} autoPlay className="w-full h-52 object-cover bg-black" />
                <p className="text-center py-1 text-xs bg-pink-50">🎥 Partner</p>
              </div>
            </div>

            <div className="flex justify-center gap-4">
              <button onClick={toggleMic} className="text-white bg-indigo-500 p-2 rounded-full hover:scale-110 transition-transform">
                {micOn ? <Mic /> : <MicOff />}
              </button>
              <button onClick={toggleVideo} className="text-white bg-purple-500 p-2 rounded-full hover:scale-110 transition-transform">
                {videoOn ? <Video /> : <VideoOff />}
              </button>
              {role === "host" && (
                <button onClick={handleEndSession} className="text-white bg-red-600 p-2 rounded-full hover:scale-110 transition-transform">
                  <PhoneOff />
                </button>
              )}
            </div>
          </div>

          {/* Right: Whiteboard */}
          <div className="bg-gradient-to-br from-white via-indigo-50 to-purple-100 rounded-2xl p-6 shadow-2xl border border-indigo-100">
  <h3 className="text-2xl font-extrabold text-indigo-700 mb-4 flex items-center gap-2">
    🖊️ <span>Collaborative Whiteboard</span>
  </h3>

  <div className="flex flex-wrap items-center gap-4 mb-4 text-sm font-medium text-gray-700">
    <div className="flex items-center gap-2">
      <label htmlFor="color" className="text-xs uppercase tracking-wide text-gray-600">
        🎨 Color
      </label>
      <select
        id="color"
        value={strokeColor}
        onChange={(e) => setStrokeColor(e.target.value)}
        className="px-3 py-1 rounded-md shadow-sm border border-indigo-200 focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white transition"
      >
        <option value="black">Black</option>
        <option value="red">Red</option>
        <option value="blue">Blue</option>
        <option value="green">Green</option>
        <option value="purple">Purple</option>
      </select>
    </div>

    <div className="flex items-center gap-2">
      <label htmlFor="width" className="text-xs uppercase tracking-wide text-gray-600">
        🖌 Width
      </label>
      <input
        id="width"
        type="range"
        min="1"
        max="10"
        value={strokeWidth}
        onChange={(e) => setStrokeWidth(parseInt(e.target.value))}
        className="accent-indigo-500 w-32"
      />
      <span className="text-indigo-700 font-bold">{strokeWidth}px</span>
    </div>

    <button
      onClick={handleClear}
      className="px-4 py-1 rounded-full bg-yellow-400 hover:bg-yellow-500 text-white text-xs shadow transition duration-200"
    >
      🔄 Clear
    </button>
    <button
      onClick={handleExport}
      className="px-4 py-1 rounded-full bg-green-500 hover:bg-green-600 text-white text-xs shadow transition duration-200"
    >
      📤 Export PNG
    </button>
  </div>

  <ReactSketchCanvas
    ref={canvasRef}
    width="100%"
    height="450px"
    strokeColor={strokeColor}
    strokeWidth={strokeWidth}
    style={{
      border: "3px dashed #a5b4fc",
      borderRadius: "16px",
      backgroundColor: "#fdfdfd",
      transition: "all 0.3s ease-in-out"
    }}
    onStroke={handleDraw}
  />
</div>

        </div>
      </div>
    </div>
  );
};

export default LiveRoom;
