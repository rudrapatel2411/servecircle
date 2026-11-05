import { io } from 'socket.io-client';
import { getWorkerCategory } from './utils/workerCategoryHelper';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const URL = API_URL.replace(/\/api\/?$/, '');

export const socket = io(URL, {
  autoConnect: true,
  reconnection: true,
  reconnectionAttempts: 20,
  reconnectionDelay: 1000,
  transports: ['websocket', 'polling'], // Fallback to polling if ws blocked
});

let activeSessionContext = null;

const emitRoomJoin = (user, panel) => {
  const role = user?.role || panel;
  const userId = user?._id || user?.id;

  if (role === 'admin' || panel === 'admin') {
    socket.emit('join_admin');
  } else if (role === 'worker' || panel === 'worker') {
    const workerId = userId || '6a5f4c90437c4810f45fe0eb';
    socket.emit('join_worker', workerId);
    
    // Join category rooms for precise notifications
    const cat = getWorkerCategory(user);
    if (cat) {
      socket.emit('join_worker_category', cat);
      socket.emit('join_worker_category', cat.toLowerCase().replace(/[^a-z0-9]/g, '-'));
    }
  } else if (role === 'customer' || panel === 'customer') {
    const customerId = userId || '6a5f4c90437c4810f45fe0e9';
    socket.emit('join_customer', customerId);
  } else if (role === 'b2b' || panel === 'b2b') {
    const b2bUserId = userId || 'b2b_user';
    socket.emit('join_b2b', b2bUserId);
  }
};

export const joinUserRoom = (user, panel) => {
  activeSessionContext = { user, panel };
  if (socket.connected) {
    emitRoomJoin(user, panel);
  } else {
    socket.connect();
  }
};

// When socket connects or reconnects, join the active session room immediately
socket.on('connect', () => {
  if (activeSessionContext) {
    emitRoomJoin(activeSessionContext.user, activeSessionContext.panel);
  }
});

export const leaveUserRoom = () => {
  activeSessionContext = null;
};
