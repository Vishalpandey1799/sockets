import { useEffect, useRef, useState } from "react";

interface Message {
  sender: string;
  text: string;
}

const ChatRoom = ({ roomId }: { roomId: string }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    const ws = new WebSocket("ws://localhost:8080");
    wsRef.current = ws;

    ws.onopen = () => {
      console.log("Connected to server, joining room:", roomId);
      ws.send(JSON.stringify({ type: "join", payload: { roomId } }));
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      console.log("Incoming:", data);

      if (data.type === "message") {
        setMessages((prev) => [
          ...prev,
          { sender: data.payload.sender || "user", text: data.payload.message },
        ]);
      } else if (data.type === "join" || data.type === "leave") {
        setMessages((prev) => [
          ...prev,
          { sender: "system", text: data.payload.message },
        ]);
      }
    };


    return () => {
      ws.close();
    };
  }, [roomId]);

  const sendMessage = () => {
    const msg = input.trim();
    if (!msg || !wsRef.current) return;

    wsRef.current.send(
      JSON.stringify({
        type: "message",
        payload: { roomId, message: msg },
      })
    );
    setMessages((prev) => [...prev, { sender: "me", text: msg }]);
    setInput("");
  };


  const leaveRoom = () => {
    if (!wsRef.current) return;
    wsRef.current.send(
      JSON.stringify({
        type: "leave",
        payload: { roomId },
      })
    );

    wsRef.current.close();
    window.location.reload();
  };

  return (
    <div className="flex flex-col h-screen bg-gray-900 text-white">
      <header className="flex justify-between items-center px-6 py-3 border-b border-gray-700">
        <h2 className="font-bold text-xl">Room: {roomId}</h2>
        <button
          onClick={() => leaveRoom()}
          className="px-3 py-1 bg-red-500 hover:bg-red-600 rounded-md text-sm"
        >
          Leave
        </button>
      </header>

      <main className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((m, idx) => (
          <div
            key={idx}
            className={`flex ${
              m.sender === "me"
                ? "justify-end"
                : m.sender === "system"
                ? "justify-center"
                : "justify-start"
            }`}
          >
            <p
              className={`max-w-xs px-3 py-2 rounded-xl ${
                m.sender === "me"
                  ? "bg-blue-500 text-white rounded-br-none"
                  : m.sender === "system"
                  ? "text-gray-400 italic text-sm"
                  : "bg-gray-300 text-gray-900 rounded-bl-none"
              }`}
            >
              {m.text}
            </p>
          </div>
        ))}
      </main>

      <footer className="p-4 border-t border-gray-700 flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          placeholder="Type a message..."
          className="flex-1 bg-gray-800 border border-gray-600 rounded-md p-2 outline-none"
        />
        <button
          onClick={sendMessage}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg"
        >
          Send
        </button>
      </footer>
    </div>
  );
};

export default ChatRoom;
