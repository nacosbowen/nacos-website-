import { io, Socket } from 'socket.io-client';
import { getToken } from '@/lib/token';
import { refreshAccessToken } from '@/lib/api';

export const socket: Socket = io(process.env.NEXT_PUBLIC_API_URL!, {
  autoConnect: false,
  withCredentials: true,
  // read fresh on every connection attempt, so expired tokens aren't reused
  auth: (cb) => cb({ token: getToken() }),
});

// If the token has expired, refresh it once and reconnect
socket.on('connect_error', async (err) => {
  if (err.message === 'TokenExpired') {
    try {
      await refreshAccessToken();
      socket.connect();
    } catch {
      // refresh failed: the normal session handling will log the user out
    }
  }
});