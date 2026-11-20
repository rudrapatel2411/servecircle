import { io } from 'socket.io-client';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const URL = API_URL.replace(/\/api\/?$/, '');

export const socket = io(URL, {
  autoConnect: false,
  reconnection: true,
  reconnectionAttempts: 10,
  reconnectionDelay: 1000,
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
  } else if (role === 'customer' || panel === 'customer') {
    const customerId = userId || '6a5f4c90437c4810f45fe0e9';
    socket.emit('join_customer', customerId);
  }
};

export const joinUserRoom = (user, panel) => {
  activeSessionContext = { user, panel };
  if (!socket.connected) {
    socket.connect();
  } else {
    emitRoomJoin(user, panel);
  }
};

// Reconnect handler ensures room is restored automatically
socket.on('connect', () => {
  if (activeSessionContext) {
    emitRoomJoin(activeSessionContext.user, activeSessionContext.panel);
  }
});

export const leaveUserRoom = () => {
  activeSessionContext = null;
  if (socket.connected) {
    socket.disconnect();
  }
};
