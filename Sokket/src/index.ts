import { WebSocketServer, WebSocket } from "ws";
import http from "http"

interface User {
  slug: string;
  roomId: string;
}

function generateSlug(): string {
  const adjectives = ["Calm", "Bright", "Wild", "Lucky", "Bold"];
  const nouns = ["Otter", "Falcon", "Knight", "Wolf", "Dragon"];
  const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
  const noun = nouns[Math.floor(Math.random() * nouns.length)];
  const timestamp = Date.now().toString(36).slice(-3);
  return `${adj}${noun}-${timestamp}`;
}


const server = http.createServer();

const wss = new WebSocketServer({ server });
const sockets = new Map<WebSocket, User>();

wss.on("connection", (socket : WebSocket) => {
  console.log(" Client connected");

  socket.send(
    JSON.stringify({
      type: "system",
      message: "Welcome to the chat server 👋",
    })
  );

  socket.on("message", (raw : Buffer) => {
    try {
      const msg = JSON.parse(raw.toString());
      const user = sockets.get(socket);

      switch (msg.type) {
      
        case "join": {
          const roomId = msg.payload.roomId;
          const slug = generateSlug();

          sockets.set(socket, { roomId, slug });
          console.log(`${slug} joined room ${roomId}`);

          
          for (const [client, u] of sockets) {
            if (u.roomId === roomId && client.readyState === WebSocket.OPEN) {
                if(client === socket) {
                    continue
                }
              client.send(
                JSON.stringify({
                  type: "join",
                  payload: { message: `${slug} joined ${roomId}` },
                })
              );
            }
          }
          break;
        }

       
        case "message": {
          if (!user) return;
          const { roomId, slug } = user;
          for (const [client, u] of sockets) {
            if (u.roomId === roomId && client.readyState === WebSocket.OPEN) {

                if(client === socket) {
                    continue
                }
              client.send(
                JSON.stringify({
                  type: "message",
                  payload: {
                    message: msg.payload.message,
                    sender: slug,
                  },
                })
              );
            }
          }
          break;
        }

  
        case "leave": {
          if (!user) return;
          const { roomId, slug } = user;

          sockets.delete(socket);
          for (const [client, u] of sockets) {
            if (u.roomId === roomId && client.readyState === WebSocket.OPEN) {
                if(client === socket) {
                    continue;
                }
              client.send(
                JSON.stringify({
                  type: "leave",
                  payload: { message: `${slug} left ${roomId}` },
                })
              );
            }
          }

          socket.close();
          break;
        }

        default:
          socket.send(JSON.stringify({ type: "error", message: "Invalid type" }));
      }
    } catch (err) {
      console.error("Error handling message:", err);
    }
  });

  socket.on("close", () => {
    const user = sockets.get(socket);
    if (user) {
      sockets.delete(socket);
      console.log(`${user.slug} disconnected`);
    }
  });
});


server.listen(8080, "0.0.0.0", () => {
  console.log("✅ Server started on port 8080");
});