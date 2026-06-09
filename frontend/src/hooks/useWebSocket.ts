import { useEffect, useRef, useCallback } from 'react';

interface WebSocketHookProps {
  clientId: string | null | number;
  onMessage: (event: string, data: any) => void;
}

export const useWebSocket = ({ clientId, onMessage }: WebSocketHookProps) => {
  const socketRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const onMessageRef = useRef(onMessage);

  useEffect(() => {
    onMessageRef.current = onMessage;
  }, [onMessage]);

  const connectRef = useRef<() => void>(() => {});

  const connect = useCallback(() => {
    if (!clientId) return;

    if (socketRef.current) {
      socketRef.current.close();
    }

    // Connect to WebSocket server running on port 8000
    const wsUrl = `ws://localhost:8000/ws/${clientId}`;
    console.log(`[WebSocket] Connecting to: ${wsUrl}`);
    
    const socket = new WebSocket(wsUrl);
    socketRef.current = socket;

    let pingInterval: NodeJS.Timeout;

    socket.onopen = () => {
      console.log('[WebSocket] Connection established');
      // Set up heartbeat ping every 30 seconds to prevent idle timeout
      pingInterval = setInterval(() => {
        if (socket.readyState === WebSocket.OPEN) {
          socket.send('ping');
        }
      }, 30000);
    };

    socket.onmessage = (event) => {
      if (event.data === 'pong') return;
      try {
        const parsed = JSON.parse(event.data);
        if (parsed.event) {
          console.log('[WebSocket] Message received:', parsed);
          onMessageRef.current(parsed.event, parsed.data);
        }
      } catch (e) {
        // Handle non-JSON payload or custom raw message
      }
    };

    socket.onclose = (event) => {
      clearInterval(pingInterval);
      if (event.code !== 1000) { // If closed abnormally, reconnect
        console.warn('[WebSocket] Closed abnormally. Reconnecting in 5s...');
        reconnectTimeoutRef.current = setTimeout(() => {
          connectRef.current();
        }, 5000);
      } else {
        console.log('[WebSocket] Connection closed cleanly');
      }
    };

    socket.onerror = (error) => {
      console.error('[WebSocket] Error occurred:', error);
      socket.close();
    };
  }, [clientId]);

  useEffect(() => {
    connectRef.current = connect;
  }, [connect]);

  useEffect(() => {
    connect();

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (socketRef.current) {
        socketRef.current.onclose = null;
        socketRef.current.close(1000, 'Component unmounted');
      }
    };
  }, [clientId, connect]);

  const sendMessage = useCallback((message: string) => {
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(message);
    }
  }, []);

  return { sendMessage };
};
