// // src/services/socket.js
// import { io } from 'socket.io-client';

// const socket = io('http://localhost:5000', {
//   transports: ['websocket'], // force websocket
//   withCredentials: true,
// });

// export default socket;
import { io } from 'socket.io-client';

const user = JSON.parse(localStorage.getItem('user')); // or use currentUser from auth context

const socket = io('http://localhost:5000', {
  transports: ['websocket'],
  withCredentials: true,
  query: {
    userId: user?._id || '',
  },
});

export default socket;
