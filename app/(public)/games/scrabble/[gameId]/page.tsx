'use client';
import { useParams } from 'next/navigation';
import { useEffect, useState, useRef } from 'react';
import Lobby from './components/lobby';
import { GameState, Player } from '../types';
import { set } from 'date-fns';

const SERVER_URL = process.env.SERVER_URL || 'localhost:4000';

export default function ScrabbleGamePage() {
    const params = useParams<{ gameId: string }>();

    const [connectionStatus, setConnectionStatus] = useState('Conectando...');
    const [gameState, setGameState] = useState<GameState | null>({ players: [], board: [], bag: [] });
    
    const wsRef = useRef<WebSocket | null>(null);

    useEffect(() => {
        if (!params.gameId) return;

        let playerId = localStorage.getItem("playerId");
        if (!playerId) {
            playerId = `Invitado-${Math.floor(Math.random() * 1000)}`;
            localStorage.setItem("playerId", playerId);
        }

        console.log("Intentando conectar a la sala:", params.gameId, "como jugador:", playerId);
        const wsUrl = `ws://${SERVER_URL}/ws?room=${params.gameId}&player=${playerId}`;
        const ws = new WebSocket(wsUrl);
        wsRef.current = ws;

        ws.onopen = () => {
            console.log("✅ Conectado a la sala:", params.gameId);
            setConnectionStatus('Conectado');
        };

        ws.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                console.log("📩 Mensaje del servidor:", data);
                
                if (data.type === 'GAME_STATE_UPDATE') {
                    setGameState(data.payload);
                }
                if (data.type === 'PLAYER_JOINED') {
                    console.log("👤 Nuevo jugador se unió:", data.payload);
                    setGameState(prevState => {
                        if (!prevState) return prevState;
                        return {
                            ...prevState,
                            players: [...prevState.players, {id: data.payload, name: data.payload, score: 0, color: '', hand: []} as Player]
                        }
                    });
                    console.log("Game state:", JSON.stringify(gameState, null, 2));
                }
            } catch (error) {
                console.error("Error parseando mensaje:", error);
            }
        };

        ws.onclose = () => {
            console.log("🔌 Desconectado");
            setConnectionStatus('Desconectado');
        };

        return () => {
            ws.close();
        };
    }, [params.gameId]);

    const handleTestMessage = () => {
        if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
            console.log("Enviando mensaje de prueba a Go...");
            wsRef.current.send(JSON.stringify({
                type: "PLAY_WORD",
                payload: { word: "FEDE", x: 7, y: 7 }
            }));
        }
    };



    return (
        <div className="flex flex-col items-center h-screen pt-8 bg-amber-50">
            <h1 className="text-3xl font-bold text-amber-900 mb-2">Mesa de Scrabble</h1>
            <p className="text-amber-700/80 mb-4">Sala ID: <span className="font-mono bg-white px-2 py-1 rounded border">{params.gameId}</span></p>
            
            <div className={`px-4 py-2 rounded-full text-sm font-bold mb-8 ${
                connectionStatus === 'Conectado' ? 'bg-emerald-100 text-emerald-700' : 
                connectionStatus === 'Desconectado' ? 'bg-red-100 text-red-700' : 
                'bg-amber-200 text-amber-800'
            }`}>
                Status: {connectionStatus}
            </div>

            <button 
                onClick={handleTestMessage}
                disabled={connectionStatus !== 'Conectado'}
                className="bg-blue-500 hover:bg-blue-600 disabled:bg-slate-300 text-white px-6 py-2 rounded-xl shadow transition"
            >
                Enviar palabra de prueba a Go
            </button>

            <Lobby players={gameState ? gameState.players : []} />
            
            {gameState && (
                <div className="mt-8 w-full max-w-2xl p-4 bg-gray-900 text-green-400 font-mono text-xs rounded-xl overflow-auto shadow-inner">
                    <pre>{JSON.stringify(gameState, null, 2)}</pre>
                </div>
            )}

        </div>
    );
}