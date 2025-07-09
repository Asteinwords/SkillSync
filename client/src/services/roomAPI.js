// import axios from 'axios';

// const API = axios.create({
//   baseURL: 'http://localhost:5000/api/rooms',
// });

// export const createRoom = (roomId, password, userId) =>
//   API.post('/create', { roomId, password, userId });

// export const joinRoom = (roomId, password, userId) =>
//   API.post('/join', { roomId, password, userId });


// export const getActiveRooms = () => axios.get('http://localhost:5000/api/rooms/active');

// export const leaveRoom = (roomId, userId) =>
//   axios.post('/api/rooms/leave', { roomId, userId });

// export const getRoomHistory = (userId) =>
//   axios.get(`/api/rooms/history/${userId}`);
import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:5000/api/rooms',
});

export const createRoom = (roomId, password, userId) =>
  API.post('/create', { roomId, password, userId });

export const joinRoom = (roomId, password, userId) =>
  API.post('/join', { roomId, password, userId });

export const leaveRoom = (roomId, userId) =>
  API.post('/leave', { roomId, userId });

export const getActiveRooms = (userId) =>
  API.get(`/active?userId=${userId}`);

export const getRoomHistory = (userId) =>
  API.get(`/history/${userId}`);
