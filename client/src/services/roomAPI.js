
import axios from 'axios';

const API = axios.create({
  baseURL: 'https://skillsync-cvqg.onrender.com/api/rooms',
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

export const deleteRoomHistory = (roomId, userId) =>
  API.delete(`/history/${roomId}/${userId}`);