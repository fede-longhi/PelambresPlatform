"use client";

import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Play, RotateCcw, Zap, Timer, Settings2, Pause } from 'lucide-react';
import { Button } from '@/components/ui/button';

type GameState = 'IDLE' | 'COUNTDOWN' | 'PLAYING' | 'PAUSED' | 'FINISHED';

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
    // --- ESTADOS ---
    const [bpm, setBpm] = useState(186);
    const [initialWait, setInitialWait] = useState(6.6);
    const [waitBetween, setWaitBetween] = useState(2.62);
    const [totalRounds] = useState(5);
    
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

    // --- LÓGICA DE NIVELES ALEATORIOS ---
    const generateLevel = (wordsCount: number, lastWords: string[]) => {
        const level: string[] = [];
        const words: string[] = [...lastWords];
        const wordCountMap: Record<string, number> = {};

        while (words.length < wordsCount) {
            const randomIndex = Math.floor(Math.random() * WORDS_WITH_IMAGES.length);
            let newWord = WORDS_WITH_IMAGES[randomIndex].name.toLowerCase();
            if (words.includes(newWord)) continue;
            words.push(newWord);
        }

        const wordAppearances = LEVEL_LENGTH / wordsCount;
        while (level.length < LEVEL_LENGTH) {
            const randomWord = words[Math.floor(Math.random() * words.length)];
            if ((wordCountMap[randomWord] || 0) >= wordAppearances) continue;
            wordCountMap[randomWord] = (wordCountMap[randomWord] || 0) + 1;
            level.push(randomWord);
        }
        return level;
    };

    const generateRandomLevels = () => {
        const levels: string[][] = [];
        let lastWords: string[] = [];
        for (let i = 0; i < totalRounds; i++) {
            const newLevel = generateLevel(WORDS_PER_LEVEL[i], lastWords);
            levels.push(newLevel);
            lastWords = Array.from(new Set(newLevel));
        }
        return levels;
    };

    // --- SINCRONIZACIÓN ---
    useEffect(() => {
        let animationFrame: number;
        const updateStep = () => {
            if (gameState === 'PLAYING' && audioRef.current) {
                const time = audioRef.current.currentTime;
                const stepDuration = 60 / bpm;
                const roundDuration = stepDuration * 8;
                let accumulatedTime = initialWait;
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
                    accumulatedTime = roundEndTime + waitBetween;
                }

                if (!foundRound) {
                    setGameState('FINISHED');
                    setActiveBuffer(null);
                    audioRef.current.pause();
                }
            }
            animationFrame = requestAnimationFrame(updateStep);
        };

        if (gameState === 'PLAYING') animationFrame = requestAnimationFrame(updateStep);
        return () => cancelAnimationFrame(animationFrame);
    }, [gameState, bpm, initialWait, waitBetween, totalRounds]);

    useEffect(() => {
        if (audioRef.current) audioRef.current.playbackRate = speed;
    }, [speed, gameState]);

    // --- MANEJO DE PRIMERA APARICIÓN ---
    const firstAppearanceMap = useMemo(() => {
        const map: Record<string, string> = {};
        activeLevels.forEach((round, rIdx) => {
            round.forEach((word, sIdx) => {
                const wordLower = word.toLowerCase();
                if (!map[wordLower]) map[wordLower] = `${rIdx}-${sIdx}`;
            });
        });
        return map;
    }, [activeLevels]);

    // --- ACCIONES ---
    const startCountdown = () => {
        if (isRandomMode) setActiveLevels(generateRandomLevels());
        else setActiveLevels(LEVELS);

        setGameState('COUNTDOWN');
        setShowSettings(false);
        let count = 3;
        setCountdown(count);
        const timer = setInterval(() => {
            count--;
            if (count <= 0) {
                clearInterval(timer);
                setGameState('PLAYING');
                if (audioRef.current) {
                    audioRef.current.currentTime = 0;
                    audioRef.current.play();
                }
            } else setCountdown(count);
        }, 1000);
    };

    const togglePause = () => {
        if (gameState === 'PLAYING') {
            setGameState('PAUSED');
            audioRef.current?.pause();
        } else if (gameState === 'PAUSED') {
            setGameState('PLAYING');
            audioRef.current?.play();
        }
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

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-zinc-950 p-4 md:p-6 text-white font-sans overflow-x-hidden">
            
            {/* HUD RESPONSIVE */}
            <div className="mb-6 w-full max-w-4xl flex justify-between items-center border-b border-zinc-800 pb-4">
                <div className="flex flex-col">
                    <h1 className="text-sm md:text-xl font-black tracking-tighter flex items-center gap-2 text-white">
                        <Zap size={16} className="text-primary fill-primary w-5 h-5" /> CORD CAWAT BEAT
                    </h1>
                    <p className="text-zinc-500 text-[8px] md:text-[10px] font-bold uppercase">stwbg.mp3</p>
                </div>
                <div className="text-right flex flex-col items-end">
                    <span className="text-zinc-500 text-[8px] md:text-[10px] font-bold uppercase tracking-widest">Ronda</span>
                    <span className="text-2xl md:text-4xl font-black font-mono leading-none">
                        {currentRound}<span className="text-zinc-800">/</span>{totalRounds}
                    </span>
                </div>
            </div>

            {/* CONTENEDOR DE JUEGO */}
            <div className="flex flex-col lg:flex-row gap-4 md:gap-6 items-stretch w-full max-w-5xl">
                
                {/* GRILLA */}
                <div className="relative flex-grow aspect-[2/1] md:aspect-[16/8] order-1 lg:order-1">
                    <div className={`grid grid-cols-4 grid-rows-2 gap-2 md:gap-4 h-full transition-all duration-700 ${
                        gameState === 'IDLE' ? 'blur-2xl scale-105 opacity-40' : 'blur-0 scale-100 opacity-100'
                    }`}>
                        {activeLevels[currentRound - 1].map((wordKey, i) => {
                            const wordData = WORDS_WITH_IMAGES.find(w => w.name.toLowerCase() === wordKey.toLowerCase());
                            const isFirstMatch = firstAppearanceMap[wordKey.toLowerCase()] === `${currentRound - 1}-${i}`;

                            return (
                                <div key={i} className={`relative rounded-lg md:rounded-xl overflow-hidden transition-all border-[3px] md:border-[8px] ${
                                    activeBuffer === i 
                                    ? 'border-primary scale-[1.03] shadow-[0_0_30px_rgba(var(--primary),0.4)] z-10' 
                                    : (gameState === 'PLAYING' && !isWaitPhase ? 'border-zinc-900 opacity-20' : 'border-zinc-800 opacity-100')
                                }`}>
                                    <img src={wordData?.image || ''} className="w-full h-full object-cover" alt="" />
                                    {isFirstMatch && gameState !== 'IDLE' && (
                                         <div className="absolute inset-0 flex items-end justify-center pointer-events-none mb-1 md:mb-4 px-1">
                                            <div className="bg-yellow-400 px-2 py-0.5 md:px-4 md:py-1.5 rounded md:rounded-lg shadow-xl border border-white/50">
                                                <span className="text-[10px] sm:text-lg md:text-2xl font-black uppercase text-zinc-950 italic"
                                                    style={{ WebkitTextStroke: '0.5px white', paintOrder: 'stroke fill' }}>
                                                    {wordKey}
                                                </span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>

                    {/* OVERLAYS */}
                    {gameState === 'IDLE' && (
                        <div className="absolute inset-0 z-20 flex items-center justify-center">
                            <div className="bg-zinc-900/80 backdrop-blur-md p-6 rounded-3xl border border-white/10 text-center shadow-2xl">
                                <p className="text-zinc-400 text-[10px] font-black uppercase tracking-[0.3em] animate-pulse">¿Listos para el Cord Cawat?</p>
                            </div>
                        </div>
                    )}

                    {gameState === 'COUNTDOWN' && (
                        <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/40 backdrop-blur-sm rounded-xl">
                            <span className="text-7xl md:text-9xl font-black animate-ping text-primary">{countdown}</span>
                        </div>
                    )}

                    {gameState === 'PAUSED' && (
                        <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/40 backdrop-blur-[2px] rounded-xl">
                            <div className="bg-zinc-900 px-6 py-3 rounded-2xl flex items-center gap-3 border border-zinc-800">
                                <span className="text-lg md:text-xl font-black uppercase text-white">Pausa</span>
                            </div>
                        </div>
                    )}

                    {gameState === 'FINISHED' && (
                        <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-primary/20 backdrop-blur-xl rounded-xl border-4 border-primary">
                            <h2 className="text-4xl md:text-6xl font-black mb-6 italic italic">¡LOGRADO!</h2>
                            <Button onClick={resetGame} size="lg" className="rounded-full px-8 py-6 md:px-12 md:py-8 font-bold">REINTENTAR</Button>
                        </div>
                    )}
                </div>

                {/* SIDEBAR RESPONSIVE */}
                <div className="flex flex-row lg:flex-col gap-2 w-full lg:w-32 order-2">
                    <button
                        onClick={() => setIsRandomMode(!isRandomMode)}
                        disabled={gameState !== 'IDLE'}
                        className={`flex-1 lg:flex-none flex flex-row lg:flex-col items-center justify-center gap-2 p-3 md:p-4 rounded-xl md:rounded-2xl border-2 transition-all ${
                            isRandomMode ? 'bg-purple-600/20 border-purple-500 text-purple-400 shadow-lg' : 'bg-zinc-900 border-zinc-800 text-zinc-500'
                        } ${gameState !== 'IDLE' && 'opacity-30'}`}
                    >
                        <Zap size={20} fill={isRandomMode ? "currentColor" : "none"} />
                        <span className="text-[10px] font-black uppercase tracking-widest">{isRandomMode ? "Random" : "Normal"}</span>
                    </button>
                    
                    <div className="flex flex-col flex-1 lg:flex-none gap-1 bg-zinc-900/50 p-2 rounded-xl border border-zinc-800">
                        <span className="text-[8px] text-zinc-500 font-bold uppercase text-center">Velocidad</span>
                        <div className="grid grid-cols-4 lg:grid-cols-2 gap-1">
                            {SPEED_OPTIONS.map(v => (
                                <button key={v} onClick={() => setSpeed(v)} className={`text-[10px] py-1 rounded font-bold ${speed === v ? 'bg-primary text-black' : 'bg-zinc-800 text-zinc-500'}`}>{v}x</button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* CONTROLES FLOTANTES */}
            <div className="mt-8 flex items-center gap-4 relative">
                <div className="bg-zinc-900/80 backdrop-blur-md p-3 rounded-full border border-zinc-800 flex items-center gap-3 shadow-2xl">
                    {gameState === 'IDLE' ? (
                        <button onClick={startCountdown} className="h-12 w-12 md:h-14 md:w-14 rounded-full bg-primary flex items-center justify-center hover:scale-105 transition-transform"><Play fill="black" size={24} className="ml-1" /></button>
                    ) : (
                        <div className="flex gap-2">
                            {(gameState === 'PLAYING' || gameState === 'PAUSED') && (
                                <button onClick={togglePause} className={`h-12 w-12 md:h-14 md:w-14 rounded-full flex items-center justify-center transition-all ${gameState === 'PAUSED' ? 'bg-green-500 text-white' : 'bg-zinc-800 text-white'}`}>
                                    {gameState === 'PAUSED' ? <Play fill="white" size={24} /> : <Pause size={24} />}
                                </button>
                            )}
                            <button onClick={resetGame} className="h-12 w-12 md:h-14 md:w-14 rounded-full bg-zinc-800 flex items-center justify-center"><RotateCcw size={20} /></button>
                        </div>
                    )}
                    <button onClick={() => setShowSettings(!showSettings)} disabled={gameState !== 'IDLE'} className={`h-10 w-10 md:h-12 md:w-12 rounded-full flex items-center justify-center transition-all ${gameState !== 'IDLE' ? 'hidden' : 'flex'} ${showSettings ? 'bg-zinc-700 text-white rotate-90' : 'text-zinc-500 hover:text-white'}`}><Settings2 size={24} /></button>
                </div>

                {/* MODAL CONFIGURACIÓN MOBILE-FRIENDLY */}
                {showSettings && (
                    <div className="absolute bottom-24 left-1/2 -translate-x-1/2 w-[90vw] max-w-[400px] bg-zinc-900 border border-zinc-800 p-6 rounded-3xl shadow-2xl z-50 animate-in fade-in slide-in-from-bottom-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="flex flex-col gap-1">
                                <span className="text-[10px] text-zinc-500 font-black uppercase">BPM</span>
                                <input type="number" value={bpm} onChange={(e) => setBpm(Number(e.target.value))} className="bg-zinc-950 p-2 rounded-lg text-lg font-bold text-primary outline-none border border-zinc-800" />
                            </div>
                            <div className="flex flex-col gap-1">
                                <span className="text-[10px] text-zinc-500 font-black uppercase">Inicio (s)</span>
                                <input type="number" step="0.1" value={initialWait} onChange={(e) => setInitialWait(Number(e.target.value))} className="bg-zinc-950 p-2 rounded-lg text-lg font-bold text-white outline-none border border-zinc-800" />
                            </div>
                            <div className="flex flex-col gap-1 col-span-2">
                                <span className="text-[10px] text-zinc-500 font-black uppercase">Espera entre rondas (s)</span>
                                <input type="number" step="0.1" value={waitBetween} onChange={(e) => setWaitBetween(Number(e.target.value))} className="bg-zinc-950 p-2 rounded-lg text-lg font-bold text-white outline-none border border-zinc-800 w-full" />
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <audio ref={audioRef} src="/audio/stwbg.mp3" />
        </div>
    );
}