import { Server } from "socket.io";
import Chat from "../models/chatModel.js";
import Attachment from "../models/attachmentModel.js";
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
      if (data.attachment) {
        let url = `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${data.attachment.name}`;
        data.attachment.url = url;
      }
      io.to(data.conversationId).emit("newMessage", data);
      if (data.attachment) {
        const attachment = new Attachment(data.attachment);
        await attachment.save();
        const chat = new Chat({
          ...data,
          attachment: { url: data.attachment.url, _id: attachment._id },
        });
        await chat.save();
      } else {
        const chat = new Chat(data);
        await chat.save();
      }
    });

    // Handle disconnection
    socket.on("disconnect", () => {
      console.log(`Client disconnected: ${socket.id}`);
    });
  });

  return io;
};
