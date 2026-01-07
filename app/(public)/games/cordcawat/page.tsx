"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Play, RotateCcw, Zap, Timer, Settings2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

type GameState = 'IDLE' | 'COUNTDOWN' | 'PLAYING' | 'FINISHED';

const SPEED_OPTIONS = [0.5, 0.75, 1, 1.25, 1.5, 1.75, 2];

const WORDS_WITH_IMAGES = [
    { name: "Cord", image: "/images/cord.png" },
    { name: "Cawat", image: "/images/cawat.png" },
    { name: "Teo", image: "/images/teo.png"},
    { name: "Pea", image: "/images/pea.png"},
    { name: "Powow", image: "/images/powow.png"},
    { name: "Brenda", image: "/images/brenda.png"},
    { name: "Sword", image: "/images/sword.png"},
    { name: "Lord", image: "/images/lord.png"},
    { name: "Ramelow", image: "/images/ramelow.png"},
    { name: "Marcelo", image: "/images/marcelo.png"},
    { name: "Ragord", image: "/images/ragord.png"}
];

const LEVELS = [
    ['cord', 'cord', 'cord', 'cord', 'cord', 'cord', 'cord', 'cord'],
    ['cord', 'sword', 'cord', 'sword', 'cord', 'teo', 'cord', 'sword'],
    ['cord', 'sword', 'cawat', 'sword', 'cord', 'cawat', 'sword', 'cawat'],
    ['cord', 'cawat', 'teo', 'sword', 'ramelow', 'marcelo', 'cord', 'sword'],
    ['cawat', 'cord', 'teo', 'sword', 'cord', 'sword', 'marcelo', 'brenda'],
];

const WORDS_PER_LEVEL = [2, 3, 3, 5, 6];
const LEVEL_LENGTH = 8;

export default function BeatSequencePro() {
    // --- CONFIGURACIÓN EDITABLE ---
    const [bpm, setBpm] = useState(186);
    const [initialWait, setInitialWait] = useState(6.6); // Espera antes de Nivel 1
    const [waitBetween, setWaitBetween] = useState(2.62); // Espera entre niveles
    const [totalRounds] = useState(5);
    
    // --- ESTADOS DE JUEGO ---
    const [gameState, setGameState] = useState<GameState>('IDLE');
    const [currentRound, setCurrentRound] = useState(1);
    const [activeBuffer, setActiveBuffer] = useState<number | null>(null);
    const [countdown, setCountdown] = useState(0);
    const [isWaitPhase, setIsWaitPhase] = useState(false);
    const [speed, setSpeed] = useState(1);
    const [isRandomMode, setIsRandomMode] = useState(false);
    const [activeLevels, setActiveLevels] = useState(LEVELS);

    const [showSettings, setShowSettings] = useState(false);
    
    const audioRef = useRef<HTMLAudioElement>(null);

    // --- LÓGICA DE SINCRONIZACIÓN ---
    useEffect(() => {
        let animationFrame: number;

        const updateStep = () => {
            if (gameState === 'PLAYING' && audioRef.current) {
                const time = audioRef.current.currentTime;
                const stepDuration = 60 / bpm; // <-- QUITAR / speed
                const roundDuration = stepDuration * 8;
                
                // Usamos los valores originales. El audio.currentTime ya corre más rápido/lento por el playbackRate.
                let accumulatedTime = initialWait; // <-- QUITAR / speed
                let foundRound = false;

                for (let r = 0; r < totalRounds; r++) {
                    const roundStartTime = accumulatedTime;
                    const roundEndTime = roundStartTime + roundDuration;

                    if (time >= roundStartTime && time < roundEndTime) {
                        const relativeTime = time - roundStartTime;
                        const index = Math.floor(relativeTime / stepDuration);
                        
                        setActiveBuffer(index);
                        setCurrentRound(r + 1);
                        setIsWaitPhase(false);
                        foundRound = true;
                        break;
                    } else if (time < roundStartTime) {
                        setActiveBuffer(null);
                        setCurrentRound(r + 1);
                        setIsWaitPhase(true);
                        foundRound = true;
                        break;
                    }
                    // Sumamos duración sin dividir por speed
                    accumulatedTime = roundEndTime + waitBetween; // <-- QUITAR / speed
                }

                if (!foundRound) {
                    setGameState('FINISHED');
                    setActiveBuffer(null);
                    audioRef.current.pause();
                }
            }
            animationFrame = requestAnimationFrame(updateStep);
        };

        if (gameState === 'PLAYING') {
            animationFrame = requestAnimationFrame(updateStep);
        }

        return () => cancelAnimationFrame(animationFrame);
    }, [gameState, bpm, initialWait, waitBetween, totalRounds]); // speed ya no es necesario aquí como dependencia

    useEffect(() => {
        if (audioRef.current) {
            audioRef.current.playbackRate = speed;
        }
    }, [speed, gameState]);

    // --- CONTROLES ---
    const startCountdown = () => {
        if (isRandomMode) {
            setActiveLevels(generateRandomLevels());
        } else {
            setActiveLevels(LEVELS); // Volver a los niveles originales si no es random
        }

        setGameState('COUNTDOWN');
        let count = 3;
        setCountdown(count);
        setShowSettings(false);
        
        const timer = setInterval(() => {
            count--;
            if (count <= 0) {
                clearInterval(timer);
                setGameState('PLAYING');
                if (audioRef.current) {
                    audioRef.current.currentTime = 0;
                    audioRef.current.play();
                }
            } else {
                setCountdown(count);
            }
        }, 1000);
    };

    const resetGame = () => {
        setGameState('IDLE');
        setCurrentRound(1);
        setActiveBuffer(null);
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.currentTime = 0;
        }
    };

    const generateRandomLevels = () => {
        const levels: string[][] = [];
        let lastWords: string[] = [];
        for (let i = 0; i < totalRounds; i++) {
            console.log('Generating level', i + 1);
            const wordsCount = WORDS_PER_LEVEL[i];
            const newLevel = generateLevel(wordsCount, lastWords);
            console.log('Generated level: ', JSON.stringify(newLevel));
            levels.push(newLevel);
            lastWords = Array.from(new Set(newLevel));
        }
        return levels;
    }
    
    const generateLevel = (wordsCount: number, lastWords: string[]) => {
        const level: string[] = [];
        const words: string[] = [...lastWords];
        const wordCountMap: Record<string, number> = {};

        while (words.length < wordsCount) {
            const randomIndex = Math.floor(Math.random() * WORDS_WITH_IMAGES.length);
            let newWord = WORDS_WITH_IMAGES[randomIndex].name.toLowerCase();
            console.log('Trying to add word:', newWord);
            if (words.includes(newWord)) continue;
            words.push(newWord);
        }

        const wordAppearences = LEVEL_LENGTH / wordsCount;
        console.log('Words for this level:', words);

        while (level.length < LEVEL_LENGTH) {
            const randomWord = words[Math.floor(Math.random() * words.length)];
            if ((wordCountMap[randomWord] || 0) >= wordAppearences) continue;
            wordCountMap[randomWord] = (wordCountMap[randomWord] || 0) + 1;
            level.push(randomWord);
        }

        return level;
    }


    const firstAppearanceMap = React.useMemo(() => {
        const map: Record<string, string> = {};
        activeLevels.forEach((round, rIdx) => {
            round.forEach((word, sIdx) => {
                const wordLower = word.toLowerCase();
                if (!map[wordLower]) {
                    map[wordLower] = `${rIdx}-${sIdx}`;
                }
            });
        });
        return map;
    }, [activeLevels]);

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-zinc-950 p-6 text-white font-sans">
            
            {/* HUD */}
            <div className="mb-6 w-full max-w-4xl flex justify-between items-end border-b border-zinc-800 pb-4">
                <div>
                    <h1 className="text-xl font-black tracking-tighter flex items-center gap-2">
                        <Zap className="text-primary fill-primary w-5 h-5" /> CORD CAWAT BEAT
                    </h1>
                    <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-[0.2em]">Audio: stwbg.mp3</p>
                </div>
                
                <div className="text-center">
                    <span className="text-zinc-500 text-[10px] font-bold block uppercase tracking-widest">Ronda</span>
                    <span className="text-4xl font-black font-mono text-primary">
                        {currentRound}<span className="text-zinc-700">/</span>{totalRounds}
                    </span>
                </div>

                <div className="flex flex-col items-center gap-2">
                    <span className="text-[9px] text-zinc-500 font-black uppercase tracking-tighter">Velocidad</span>
                    <div className="flex bg-zinc-800/50 p-1 rounded-lg border border-zinc-700">
                        {SPEED_OPTIONS.map((v) => (
                            <button
                                key={v}
                                onClick={() => setSpeed(v)}
                                className={`px-2 py-1 text-xs font-bold rounded transition-all ${
                                    speed === v 
                                    ? 'bg-primary text-black' 
                                    : 'text-zinc-400 hover:text-white'
                                }`}
                            >
                                {v}x
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* CONTENEDOR PRINCIPAL DE JUEGO (Grilla + Sidebar) */}
            <div className="flex flex-col lg:flex-row gap-6 items-stretch w-full max-w-5xl">
    
                {/* GRILLA (Lado izquierdo) */}
                <div className="relative flex-grow aspect-[16/8]">
                    {
                        gameState != 'IDLE' &&
                        <div className="grid grid-cols-4 grid-rows-2 gap-4 h-full">
                            {activeLevels[currentRound - 1].map((wordKey, i) => {
                                const wordData = WORDS_WITH_IMAGES.find(w => w.name.toLowerCase() === wordKey.toLowerCase());
                                const isFirstMatch = firstAppearanceMap[wordKey.toLowerCase()] === `${currentRound - 1}-${i}`;

                                return (
                                    <div 
                                        key={i} 
                                        className={`relative rounded-xl overflow-hidden transition-all duration-75 border-[8px] ${
                                            activeBuffer === i 
                                            ? 'border-primary scale-[1.04] shadow-[0_0_40px_rgba(var(--primary),0.4)] z-10 opacity-100' 
                                            : (gameState === 'PLAYING' && !isWaitPhase ? 'border-zinc-900 opacity-20' : 'border-zinc-800 opacity-100')
                                        }`}
                                    >
                                        <img src={wordData?.image || ''} className="w-full h-full object-cover" alt={wordKey} />
                                        
                                        {isFirstMatch && (
                                            <div className="absolute inset-0 flex items-end justify-center pointer-events-none mb-4 px-2">
                                                <div className="bg-yellow-400 px-4 py-1.5 rounded-lg shadow-[0_6px_0_0_#ca8a04] border-2 border-white/50">
                                                    <span
                                                        className="text-2xl md:text-3xl font-black uppercase text-zinc-950 italic"
                                                        style={{ 
                                                            WebkitTextStroke: '1.5px white',
                                                            paintOrder: 'stroke fill',
                                                            letterSpacing: '-0.05em'
                                                        }}
                                                    >
                                                        {wordKey}
                                                    </span>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    }

                    {/* OVERLAYS (Countdown / Finished / Wait) se mantienen igual dentro de este div */}
                    {gameState === 'COUNTDOWN' && (
                        <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/60 backdrop-blur-md rounded-xl">
                            <span className="text-9xl font-black animate-ping text-primary">{countdown}</span>
                        </div>
                    )}

                    {gameState === 'FINISHED' && (
                        <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-primary/20 backdrop-blur-xl rounded-xl border-4 border-primary">
                            <h2 className="text-6xl font-black mb-8 italic tracking-tighter">¡LOGRADO!</h2>
                            <Button onClick={resetGame} size="lg" className="rounded-full px-12 py-8 text-2xl font-bold shadow-2xl">
                                <RotateCcw className="mr-3 w-8 h-8" /> REPETIR
                            </Button>
                        </div>
                    )}
                </div>

                {/* SIDEBAR DE MODOS (Lado derecho) */}
                <div className="flex flex-row lg:flex-col gap-4 w-full lg:w-32">
                    <button
                        onClick={() => setIsRandomMode(!isRandomMode)}
                        disabled={gameState !== 'IDLE'}
                        className={`flex flex-col items-center justify-center gap-3 p-4 rounded-2xl border-2 transition-all duration-300 ${
                            isRandomMode 
                            ? 'bg-purple-600/20 border-purple-500 text-purple-400 shadow-[0_0_20px_rgba(168,85,247,0.2)]' 
                            : 'bg-zinc-900 border-zinc-800 text-zinc-500 hover:border-zinc-700'
                        } ${gameState !== 'IDLE' && 'opacity-50 cursor-not-allowed'}`}
                    >
                        <div className={`p-3 rounded-full ${isRandomMode ? 'bg-purple-500 text-white' : 'bg-zinc-800 text-zinc-600'}`}>
                            <Zap size={24} fill={isRandomMode ? "currentColor" : "none"} />
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-center leading-tight">
                            {isRandomMode ? "Random ON" : "Normal Mode"}
                        </span>
                    </button>

                    {/* Espacio para futuros botones laterales (ej. Modo Hard, Mute, etc.) */}
                    {/* <div className="hidden lg:flex flex-1 items-center justify-center border-2 border-dashed border-zinc-900 rounded-2xl">
                        <span className="text-zinc-800 rotate-90 text-[10px] font-bold tracking-[0.5em]">SIDEBAR</span>
                    </div> */}
                </div>
            </div>

            {/* PANEL DE CONTROL DINÁMICO */}
            {/* CONTROLES PRINCIPALES Y AJUSTES */}
            <div className="mt-12 flex items-center gap-6 relative">                
                <div className="bg-zinc-900/80 backdrop-blur-md p-3 rounded-full border border-zinc-800 shadow-2xl flex items-center gap-4">
                    {gameState === 'IDLE' ? (
                        <button 
                            onClick={startCountdown} 
                            className="h-14 w-14 rounded-full bg-primary flex items-center justify-center hover:scale-105 transition-transform shadow-lg shadow-primary/20"
                        >
                            <Play fill="black" size={24} className="ml-1" />
                        </button>
                    ) : (
                        <button 
                            onClick={resetGame} 
                            className="h-14 w-14 rounded-full bg-zinc-800 flex items-center justify-center hover:bg-zinc-700 transition-colors"
                        >
                            <RotateCcw className="text-zinc-400" size={24} />
                        </button>
                    )}

                    <button 
                        onClick={() => setShowSettings(!showSettings)}
                        disabled={gameState != 'IDLE'}
                        className={`h-12 w-12 rounded-full flex items-center justify-center transition-all ${
                            showSettings ? 'bg-zinc-700 text-white rotate-90' : 'text-zinc-500 hover:text-white'
                        }`}
                    >
                        <Settings2 size={24} />
                    </button>
                </div>

                {/* PANEL DE CONFIGURACIÓN FLOTANTE */}
                {showSettings && (
                    <div className="absolute bottom-24 left-1/2 -translate-x-1/2 w-[400px] bg-zinc-900 border border-zinc-800 p-6 rounded-3xl shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-200 z-50">
                        <div className="grid grid-cols-2 gap-6">
                            
                            {/* BPM y Velocidad en una columna */}
                            <div className="space-y-4">
                                <div className="flex flex-col gap-1">
                                    <span className="text-[10px] text-zinc-500 font-black uppercase tracking-widest">BPM</span>
                                    <input type="number" value={bpm} onChange={(e) => setBpm(Number(e.target.value))} className="bg-zinc-950 p-2 rounded-lg text-lg font-bold text-primary outline-none border border-zinc-800" />
                                </div>
                                
                                <div className="flex flex-col gap-1">
                                    <span className="text-[10px] text-zinc-500 font-black uppercase tracking-widest">Velocidad Audio</span>
                                    <div className="flex flex-wrap gap-1">
                                        {SPEED_OPTIONS.map((v) => (
                                            <button
                                                key={v}
                                                onClick={() => setSpeed(v)}
                                                className={`px-2 py-1 text-[10px] font-bold rounded ${
                                                    speed === v ? 'bg-primary text-black' : 'bg-zinc-800 text-zinc-400'
                                                }`}
                                            >
                                                {v}x
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Tiempos de espera en otra columna */}
                            <div className="space-y-4">
                                <div className="flex flex-col gap-1">
                                    <span className="text-[10px] text-zinc-500 font-black uppercase tracking-widest">Inicio (s)</span>
                                    <input type="number" step="0.1" value={initialWait} onChange={(e) => setInitialWait(Number(e.target.value))} className="bg-zinc-950 p-2 rounded-lg text-lg font-bold text-white outline-none border border-zinc-800" />
                                </div>
                                <div className="flex flex-col gap-1">
                                    <span className="text-[10px] text-zinc-500 font-black uppercase tracking-widest">Espera Entre Rondas (s)</span>
                                    <input type="number" step="0.1" value={waitBetween} onChange={(e) => setWaitBetween(Number(e.target.value))} className="bg-zinc-950 p-2 rounded-lg text-lg font-bold text-white outline-none border border-zinc-800" />
                                </div>
                            </div>
                        </div>
                        
                        <div className="mt-4 pt-4 border-t border-zinc-800 text-center">
                            <p className="text-[9px] text-zinc-600 font-bold uppercase tracking-widest">Ajustes Técnicos - Cord Cawat Beat</p>
                        </div>
                    </div>
                )}
            </div>

            <audio ref={audioRef} src="/audio/stwbg.mp3" />
        </div>
    );
}