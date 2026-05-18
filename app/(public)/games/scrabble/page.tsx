'use client';

import React from "react";
import { Bot, Play, UserPlus, Users } from "lucide-react";
import { useRouter } from "next/navigation";

const SERVER_URL = process.env.SERVER_URL || 'localhost:4000';

export default function Page() {
    const router = useRouter();
    const [roomCode, setRoomCode] = React.useState("");

    const handleCreateGame = async () => {
        try {
            const res = await fetch(`http://${SERVER_URL}/v1/rooms`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    game: "scrabble",
                }),
            });
            if (!res.ok) {
                throw new Error("Failed to create room");
            }
            const data = await res.json();
            console.log("Room created:", data);
            
            const playerRes = await fetch(`http://${SERVER_URL}/v1/rooms/${data.roomId}/players`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    name: `Invitado-${Math.floor(Math.random() * 1000)}`,
                }),
            });

            if (!playerRes.ok) {
                throw new Error("Failed to join room");
            }

            const playerData = await playerRes.json();
            console.log("Joined room as player:", playerData);
            
            localStorage.setItem("playerId", playerData.playerId);

            router.push(`/games/scrabble/${data.roomId}`);

        } catch (error) {
            console.error(error);
        }
    }
    
    return (
        <div className="flex flex-col items-center h-screen bg-amber-50 p-8">
            <div className="text-center mb-16">
                <h1 className="text-4xl md:text-5xl font-extrabold text-amber-900 mb-4 tracking-tight">Scrabble</h1>
                <p className="text-lg text-amber-700/80 max-w-2xl mx-auto">Select a game to play or create a new one.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
                <div className="bg-white rounded-2xl shadow-xl shadow-amber-900/5 overflow-hidden border border-amber-100 flex flex-col">
                    <div className="h-2 bg-red-500"></div>
                    <div className="p-8 flex-1 flex flex-col">
                        <div className="w-14 h-14 bg-red-100 text-red-600 rounded-2xl flex items-center justify-center mb-6 ">
                            <UserPlus size={28} strokeWidth={2.5} />
                        </div>
                        <h2 className="text-xl font-bold mb-2">Create Game</h2>
                        <p className="text-slate-500 mb-8 flex-1">
                            Start a new game and invite your friends to play Scrabble together. Create a private room and share the link to get started.
                        </p>
                        <button className="w-full px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 flex items-center justify-center"
                        onClick={handleCreateGame}
                        >
                            <span>
                                Create New Game
                            </span>
                            <Play size={16} strokeWidth={2.5} className="inline-block ml-2" />
                        </button>
                    </div>
                </div>
                <div className="bg-white rounded-2xl shadow-xl shadow-amber-900/5 overflow-hidden border border-amber-100 flex flex-col">
                    <div className="h-2 bg-green-500"></div>
                    <div className="p-8 flex-1 flex flex-col">
                        <div className="w-14 h-14 bg-green-100 text-green-600 rounded-2xl flex items-center justify-center mb-6 ">
                            <Users size={28} strokeWidth={2.5} />
                        </div>
                        <h2 className="text-xl font-bold mb-2">Join Game</h2>
                        <p className="text-slate-500 mb-8 flex-1">
                            Join an existing game and play Scrabble with your friends. Enter the game code to get started.
                        </p>
                        <div className="mb-8">
                            <input 
                                type="text" 
                                placeholder="Ej. X7KP29" 
                                value={roomCode}
                                onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                                maxLength={6}
                                className="w-full bg-slate-50 border border-slate-200 text-center text-xl font-bold py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white uppercase tracking-widest placeholder:text-slate-300 placeholder:font-normal"
                            />
                        </div>
                        <button className="w-full px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 flex items-center justify-center">
                            <span>
                                Join Game
                            </span>
                            <Play size={16} strokeWidth={2.5} className="inline-block ml-2" />
                        </button>
                    </div>
                </div>
                <div className="bg-white rounded-2xl shadow-xl shadow-amber-900/5 overflow-hidden border border-amber-100 flex flex-col">
                    <div className="h-2 bg-blue-600"></div>
                    <div className="p-8 flex-1 flex flex-col">
                        <div className="w-14 h-14 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mb-6 ">
                            <Bot size={28} strokeWidth={2.5} />
                        </div>
                        <h2 className="text-xl font-bold mb-2">Play against AI</h2>
                        <p className="text-slate-500 mb-8 flex-1">
                            Challenge the AI and test your Scrabble skills. Play solo and improve your strategy against a computer opponent.
                        </p>
                        <button className="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 flex items-center justify-center">
                            <span>
                                Play Against AI
                            </span>
                            <Play size={16} strokeWidth={2.5} className="inline-block ml-2" />
                        </button>
                    </div>
                </div>
            </div>
            <div>

            </div>
        </div>
    )
}