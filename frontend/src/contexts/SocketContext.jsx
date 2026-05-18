import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext(null);

const WS_URL = import.meta.env.VITE_WS_URL || 'http://localhost:8080/ws';

export function SocketProvider({ children }) {
  const { token, isAuthenticated } = useAuth();
  const clientRef = useRef(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    if (!isAuthenticated || !token) {
      if (clientRef.current) {
        clientRef.current.deactivate();
        clientRef.current = null;
        setConnected(false);
      }
      return;
    }

    const client = new Client({
      webSocketFactory: () => new SockJS(WS_URL),
      connectHeaders: { Authorization: `Bearer ${token}` },
      reconnectDelay: 5000,
      heartbeatIncoming: 10000,
      heartbeatOutgoing: 10000,
      onConnect: () => {
        setConnected(true);
        console.log('[Rentova] WebSocket connected');
      },
      onDisconnect: () => {
        setConnected(false);
        console.log('[Rentova] WebSocket disconnected');
      },
      onStompError: (frame) => {
        console.error('[Rentova] STOMP error', frame);
      },
    });

    client.activate();
    clientRef.current = client;

    return () => {
      client.deactivate();
    };
  }, [isAuthenticated, token]);

  const subscribe = (destination, callback) => {
    if (clientRef.current && connected) {
      return clientRef.current.subscribe(destination, (message) => {
        callback(JSON.parse(message.body));
      });
    }
    return null;
  };

  const publish = (destination, body) => {
    if (clientRef.current && connected) {
      clientRef.current.publish({
        destination,
        body: JSON.stringify(body),
      });
    }
  };

  return (
    <SocketContext.Provider value={{ connected, subscribe, publish, client: clientRef.current }}>
      {children}
    </SocketContext.Provider>
  );
}

export function useSocket() {
  const context = useContext(SocketContext);
  if (!context) throw new Error('useSocket must be used within SocketProvider');
  return context;
}
