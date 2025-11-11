import { useState } from "react";
import ChatRoom from "./ChatRoom";

const App = () => {
  const [roomId, setRoomId] = useState("");
  const [joined, setJoined] = useState(false);

  const handleJoin = () => {
    if (!roomId.trim()) return;
    setJoined(true);
  };

  const generateRoom = () => {
    const randomId = Math.random().toString(36).substring(2, 7);
    setRoomId(randomId);
  };

  if (joined) return <ChatRoom roomId={roomId} />;

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-900 text-white">
      <h1 className="text-3xl font-bold mb-6">Join a Chatroom</h1>

      <input
        type="text"
        placeholder="Enter room ID..."
        value={roomId}
        onChange={(e) => setRoomId(e.target.value)}
        className="p-2 rounded-md bg-gray-800 border border-gray-700 mb-4 text-center"
      />

      <div className="flex gap-3">
        <button
          onClick={generateRoom}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg"
        >
          Random Room
        </button>
        <button
          onClick={handleJoin}
          className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg"
        >
          Join
        </button>
      </div>
    </div>
  );
};

export default App;
