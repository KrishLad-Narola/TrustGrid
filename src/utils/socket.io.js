import { io } from "socket.io-client";

export let socket = null;

export const connectSocket = (accessToken) => {
    if (socket?.connected) {
        return socket;
    }

    socket = io("http://192.168.100.149:3000/", {
        transports: ["websocket"],
        auth: { 
            token: accessToken
        }
    });

    socket.on("connect", () => {
        console.log("Socket connected:", socket.id);
    });

    socket.on("disconnect", (reason) => {
        console.log("Socket disconnected:", reason);
    });

    socket.on("connect_error", (error) => {
        console.error("Socket error:", error.message);
    });

    return socket;
};

export const getSocket = () => socket;

export const disconnectSocket = () => {
    socket?.disconnect();
    socket = null;
};