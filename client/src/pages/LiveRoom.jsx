window.global = window; // ✅ Peer.js fix for Vite

import React, { useEffect, useRef, useState } from 'react';
import io from 'socket.io-client';
import Peer from 'simple-peer';
import { useParams, useNavigate } from 'react-router-dom';
import { ReactSketchCanvas } from 'react-sketch-canvas';
import { Mic, MicOff, Video, VideoOff, PhoneOff, CircleDot, Square } from 'lucide-react';
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
  const [partnerStream, setPartnerStream] = useState(null);
  const [micOn, setMicOn] = useState(true);
  const [videoOn, setVideoOn] = useState(true);
  const [isRecording, setIsRecording] = useState(false);
  const [recorder, setRecorder] = useState(null);
  const [includeWhiteboard, setIncludeWhiteboard] = useState(true);
  const [whiteboardVisible, setWhiteboardVisible] = useState(true);

  const myVideo = useRef();
  const peerVideo = useRef();
  const canvasRef = useRef();

  useEffect(() => {
    navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then(currentStream => {
      setStream(currentStream);
      if (myVideo.current) myVideo.current.srcObject = currentStream;

      const user = JSON.parse(localStorage.getItem("user")); // or from auth context
      socket.emit('joinRoom', { roomId, userId: user._id });


      socket.on('user-joined', (otherUserId) => {
        const newPeer = new Peer({ initiator: true, trickle: false, stream: currentStream });

        newPeer.on('signal', data => {
          socket.emit('signal', { to: otherUserId, from: socket.id, signal: data });
        });

        newPeer.on('stream', userStream => {
          setPartnerStream(userStream);
          if (peerVideo.current) peerVideo.current.srcObject = userStream;
        });

        setPeer(newPeer);
      });

      socket.on('signal', ({ from, signal }) => {
        const newPeer = new Peer({ initiator: false, trickle: false, stream: currentStream });

        newPeer.on('signal', data => {
          socket.emit('signal', { to: from, from: socket.id, signal: data });
        });

        newPeer.on('stream', userStream => {
          setPartnerStream(userStream);
          if (peerVideo.current) peerVideo.current.srcObject = userStream;
        });

        newPeer.signal(signal);
        setPeer(newPeer);
      });

      socket.on("room-ended", () => {
        alert("Session ended by host.");
        cleanup();
        navigate("/dashboard");
      });

      socket.on("draw", (data) => {
        if (canvasRef.current) canvasRef.current.loadPaths(data);
      });
    });

    return () => {
      socket.off("signal");
      socket.off("user-joined");
      socket.off("draw");
      socket.off("room-ended");
      cleanup();
    };
  }, [roomId]);

const cleanup = async () => {
  if (peer) peer.destroy();
  if (recorder?.state === 'recording') recorder.stop();
  stream?.getTracks().forEach(t => t.stop());
  partnerStream?.getTracks().forEach(t => t.stop());

  const user = JSON.parse(localStorage.getItem('user'));
  if (user?._id) {
    await leaveRoom(roomId, user._id);
  }
  socket.disconnect();
};

  const toggleMic = () => {
    const audioTrack = stream?.getAudioTracks()[0];
    if (audioTrack) {
      audioTrack.enabled = !micOn;
      setMicOn(!micOn);
    }
  };

  const toggleVideo = () => {
    const videoTrack = stream?.getVideoTracks()[0];
    if (videoTrack) {
      videoTrack.enabled = !videoOn;
      setVideoOn(!videoOn);
    }
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

  const combineStreams = async () => {
  const combined = new MediaStream();

  if (stream) {
    stream.getTracks().forEach(track => combined.addTrack(track));
  }

  if (partnerStream) {
    partnerStream.getTracks().forEach(track => combined.addTrack(track));
  }

  if (includeWhiteboard && whiteboardVisible) {
    const canvasEl = document.querySelector("canvas");
    if (canvasEl && canvasEl.captureStream) {
      const whiteboardStream = canvasEl.captureStream(15);
      whiteboardStream.getTracks().forEach(track => combined.addTrack(track));
    } else {
      console.warn("Whiteboard canvas not available or not yet rendered.");
    }
  }

  return combined;
};

  const startRecording = async () => {
  const finalStream = await combineStreams();
  if (!finalStream || finalStream.getTracks().length === 0) {
    alert("No media tracks available to record.");
    return;
  }

  const mediaRecorder = new MediaRecorder(finalStream);
  const chunks = [];

  mediaRecorder.ondataavailable = (e) => chunks.push(e.data);
  mediaRecorder.onstop = () => {
    const blob = new Blob(chunks, { type: 'video/webm' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${roomId}-recording.webm`;
    a.click();
    URL.revokeObjectURL(url);
  };

  mediaRecorder.start();
  setRecorder(mediaRecorder);
  setIsRecording(true);
};

  const stopRecording = () => {
    if (recorder) recorder.stop();
    setIsRecording(false);
  };

  const handleEndSession = () => {
    if (role === 'host') {
      socket.emit("end-room", { roomId });
    }
    cleanup();
    navigate("/dashboard");
  };
useEffect(() => {
  const handleBeforeUnload = (e) => {
      const user = JSON.parse(localStorage.getItem("user"));
      if (user && roomId) {
        const data = JSON.stringify({ roomId, userId: user._id });
        const blob = new Blob([data], { type: 'application/json' });
        navigator.sendBeacon('http://localhost:5000/api/rooms/leave', blob);
      }
      
    cleanup();
  };

  window.addEventListener("beforeunload", handleBeforeUnload);
  return () => {
    window.removeEventListener("beforeunload", handleBeforeUnload);
  };
}, [roomId]);


  return (
    <div className="relative min-h-screen px-4 py-10 pt-24 font-body bg-gradient-to-br from-indigo-100 via-pink-100 to-blue-100" style={{ backgroundImage: `url(${starsBg})`, backgroundRepeat: 'repeat' }}>
      <div className="max-w-7xl mx-auto bg-white/80 backdrop-blur-2xl rounded-3xl p-6 shadow-2xl">
        <h2 className="text-3xl font-extrabold text-center text-indigo-700 mb-6">🚀 Live Learning Room</h2>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="border-4 border-indigo-300 rounded-xl">
                <video playsInline muted ref={myVideo} autoPlay className="w-full h-52 object-cover bg-black" />
                <p className="text-center text-xs bg-indigo-50">🎤 You ({role})</p>
              </div>
              <div className="border-4 border-pink-300 rounded-xl">
                <video playsInline ref={peerVideo} autoPlay className="w-full h-52 object-cover bg-black" />
                <p className="text-center text-xs bg-pink-50">🎥 Partner</p>
              </div>
            </div>

            <div className="flex justify-center flex-wrap gap-3 mt-2">
              <button onClick={toggleMic} className="text-white bg-indigo-500 p-2 rounded-full">{micOn ? <Mic /> : <MicOff />}</button>
              <button onClick={toggleVideo} className="text-white bg-purple-500 p-2 rounded-full">{videoOn ? <Video /> : <VideoOff />}</button>
              {role === "host" && !isRecording && <button onClick={startRecording} className="bg-green-500 text-white p-2 rounded-full"><CircleDot /></button>}
              {role === "host" && isRecording && <button onClick={stopRecording} className="bg-red-600 text-white p-2 rounded-full"><Square /></button>}
              {role === "host" && <button onClick={handleEndSession} className="bg-red-800 text-white p-2 rounded-full"><PhoneOff /></button>}
            </div>

            {role === "host" && (
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
            )}
          </div>

          <div>
            <button
              className="text-sm mb-2 px-4 py-1 rounded-full bg-indigo-600 text-white hover:bg-indigo-700"
              onClick={() => setWhiteboardVisible(!whiteboardVisible)}
            >
              {whiteboardVisible ? 'Hide Whiteboard' : 'Show Whiteboard'}
            </button>

            {whiteboardVisible && (
              <div className="bg-white p-4 rounded-xl shadow border border-indigo-200">
                <h3 className="text-xl font-semibold text-indigo-700 mb-2">🖊 Collaborative Whiteboard</h3>
                <div className="flex gap-3 text-sm mb-2">
                  <select value={strokeColor} onChange={(e) => setStrokeColor(e.target.value)} className="border rounded px-2 py-1">
                    <option value="black">Black</option>
                    <option value="red">Red</option>
                    <option value="blue">Blue</option>
                    <option value="green">Green</option>
                  </select>
                  <input type="range" min="1" max="10" value={strokeWidth} onChange={(e) => setStrokeWidth(Number(e.target.value))} />
                  <button onClick={handleClear} className="bg-yellow-400 text-white px-2 rounded">Clear</button>
                  <button onClick={handleExport} className="bg-green-500 text-white px-2 rounded">Export</button>
                </div>
                <ReactSketchCanvas
                  ref={canvasRef}
                  width="100%"
                  height="400px"
                  strokeColor={strokeColor}
                  strokeWidth={strokeWidth}
                  onStroke={handleDraw}
                  style={{ border: "2px dashed #ccc", borderRadius: 10, background: "#fefefe" }}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LiveRoom;
