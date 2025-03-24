import { Server } from "socket.io";
import Chat from "../models/chatModel.js";
export const initChatSocket = (server) => {
  // Initialize Socket.IO server
  const io = new Server(server, {
    cors: {
      origin: "*",
    },
  });

  // Listen for new client connections
  io.on("connection", (socket) => {
    console.log(`Client connected: ${socket.id}`);

    // Event: Join a conversation room
    socket.on("joinConversation", (conversationId) => {
      socket.join(conversationId);
      console.log(`Socket ${socket.id} joined conversation ${conversationId}`);
    });

    // Event: Leave a conversation room
    socket.on("leaveConversation", (conversationId) => {
      socket.leave(conversationId);
      console.log(`Socket ${socket.id} left conversation ${conversationId}`);
    });

    // Event: Send a message
    // Data should include at least: conversationId, senderId, and message content.
    socket.on("sendMessage", async (data) => {
      console.log(data);
      io.to(data.conversationId).emit("newMessage", data);
      const chat = new Chat(data);
      await chat.save();
      // Broadcast the message to everyone in the conversation room
    });

    // Handle disconnection
    socket.on("disconnect", () => {
      console.log(`Client disconnected: ${socket.id}`);
    });
  });

  return io;
};
