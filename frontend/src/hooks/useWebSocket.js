import { useEffect, useRef, useState } from "react";

export default function useWebSocket(url, { enabled = true, onMessage } = {}) {
    const socketRef = useRef(null);
    const [status, setStatus] = useState("idle");

    useEffect(() => {
        if (!enabled || !url) return undefined;

        const socket = new WebSocket(url);
        socketRef.current = socket;
        setStatus("connecting");

        socket.onopen = () => setStatus("open");
        socket.onerror = () => setStatus("error");
        socket.onclose = () => setStatus((prev) => (prev === "error" ? "error" : "closed"));
        socket.onmessage = (event) => {
            try {
                const parsed = JSON.parse(event.data);
                onMessage?.(parsed);
            } catch (err) {
                onMessage?.(event.data);
            }
        };

        return () => {
            socket.close();
            socketRef.current = null;
        };
    }, [url, enabled, onMessage]);

    return { socket: socketRef.current, status };
}
