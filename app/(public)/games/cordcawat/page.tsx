"use client";

import React, { useState, useRef, useEffect, useMemo } from 'react';
import { 
  Play, RotateCcw, Zap, Timer, Settings2, Pause, 
  Edit3, Plus, Trash2, Save, Music, LayoutGrid, X, 
  Download,
  Upload
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import Image from 'next/image';

// --- TIPOS ---
type GameState = 'IDLE' | 'COUNTDOWN' | 'PLAYING' | 'PAUSED' | 'FINISHED';
interface WordEntry { id: string; name: string; image: string; }

// --- CONFIGURACIÓN INICIAL (FALLBACK) ---
const INITIAL_WORDS: WordEntry[] = [
    { id: '1', name: "Cord", image: "/images/cord.png" },
    { id: '2', name: "Cawat", image: "/images/cawat.png" },
    { id: '3', name: "Teo", image: "/images/teo.png" },
    { id: '4', name: "Sord", image: "/images/sword.png" },
    { id: '5', name: "Ramelow", image: "/images/ramelow.png" },
    { id: '6', name: "Marcelo", image: "/images/marcelo.png" },
    { id: '7', name: "Brenda", image: "/images/brenda.png" },
];

const INITIAL_LEVELS = [
    ['cord', 'cord', 'cord', 'cord', 'cord', 'cord', 'cord', 'cord'],
    ['cord', 'sord', 'cord', 'sord', 'cord', 'teo', 'cord', 'sord'],
    ['cord', 'sord', 'cawat', 'sord', 'cord', 'cawat', 'sord', 'cawat'],
    ['cord', 'cawat', 'teo', 'sord', 'ramelow', 'marcelo', 'cord', 'sord'],
    ['cawat', 'cord', 'teo', 'sord', 'cord', 'sord', 'marcelo', 'brenda'],
];

const SPEED_OPTIONS = [0.5, 0.75, 1, 1.25, 1.5, 1.75, 2];

const LEVEL_LENGTH = 8;
const RANDOM_TOTAL_ROUNDS = 5;
const RANDOM_WORDS_PER_LEVEL = [2, 3, 4, 5, 6];

export default function BeatScannerPro() {
    // --- ESTADOS DE DATOS ---
    const [view, setView] = useState<'PLAY' | 'EDIT'>('PLAY');
    const [words, setWords] = useState<WordEntry[]>(INITIAL_WORDS);
    const [levels, setLevels] = useState<string[][]>(INITIAL_LEVELS);
    
    // --- ESTADOS DE JUEGO ---
    const [bpm, setBpm] = useState(186);
    const [initialWait, setInitialWait] = useState(5);
    const [waitBetween, setWaitBetween] = useState(2.62);
    const [gameState, setGameState] = useState<GameState>('IDLE');
    const [currentRound, setCurrentRound] = useState(1);
    const [activeBuffer, setActiveBuffer] = useState<number | null>(null);
    const [countdown, setCountdown] = useState(0);
    const [isWaitPhase, setIsWaitPhase] = useState(false);
    const [speed, setSpeed] = useState(1);
    const [isRandomMode, setIsRandomMode] = useState(false);
    const [activeLevels, setActiveLevels] = useState<string[][]>(INITIAL_LEVELS);
    const [showSettings, setShowSettings] = useState(false);
    const [editingSlot, setEditingSlot] = useState<{ rIdx: number, sIdx: number } | null>(null);

    const [isMetronomeActive, setIsMetronomeActive] = useState(false);
    const lastBeatRef = useRef<number | null>(null);
    
    const clickRef = useRef<HTMLAudioElement>(null);
    const audioRef = useRef<HTMLAudioElement>(null);

    const fileInputRef = useRef<HTMLInputElement>(null);

    // --- PERSISTENCIA ---
    useEffect(() => {
        const savedWords = localStorage.getItem('bs_words');
        const savedLevels = localStorage.getItem('bs_levels');
        const savedBpm = localStorage.getItem('bs_bpm');
        if (savedWords) setWords(JSON.parse(savedWords));
        if (savedLevels) {
            const parsed = JSON.parse(savedLevels);
            setLevels(parsed);
            setActiveLevels(parsed);
        }
        if (savedBpm) setBpm(Number(savedBpm));
    }, []);

    

    const saveSettings = () => {
        localStorage.setItem('bs_words', JSON.stringify(words));
        localStorage.setItem('bs_levels', JSON.stringify(levels));

        const config = { bpm, initialWait, waitBetween };
        localStorage.setItem('bs_config', JSON.stringify(config));

        setActiveLevels(levels);
        
        alert("Configuración guardada en este navegador.");
    };

    // --- LÓGICA DE SINCRONIZACIÓN ---
    useEffect(() => {
        let animationFrame: number;
        const updateStep = () => {
            if (gameState === 'PLAYING' && audioRef.current) {
                const time = audioRef.current.currentTime;
                const stepDuration = 60 / bpm;
                const roundDuration = stepDuration * 8;
                let accumulatedTime = initialWait;
                let foundRound = false;

                for (let r = 0; r < activeLevels.length; r++) {
                    const roundStartTime = accumulatedTime;
                    const roundEndTime = roundStartTime + roundDuration;

                    if (time >= roundStartTime && time < roundEndTime) {
                        const index = Math.floor((time - roundStartTime) / stepDuration);

                        if (index !== lastBeatRef.current) {
                            playClick();
                            lastBeatRef.current = index;
                        }
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
    }, [gameState, bpm, initialWait, waitBetween, activeLevels]);

    useEffect(() => {
        if (audioRef.current) audioRef.current.playbackRate = speed;
    }, [speed, gameState]);

    useEffect(() => {
        if (editingSlot) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
    }, [editingSlot]);

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

    // --- ACCIONES DEL JUEGO ---
    const startCountdown = () => {
        if (isRandomMode) setActiveLevels(generateRandomLevels());
        else setActiveLevels(levels);

        setShowSettings(false);
        setGameState('COUNTDOWN');
        
        let count = 3;
        setCountdown(count);

        // Intervalo visual del 3, 2, 1
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

    const updateLevelSlot = (roundIdx: number, slotIdx: number, wordName: string) => {
        const newLevels = [...levels];
        newLevels[roundIdx] = [...newLevels[roundIdx]];
        newLevels[roundIdx][slotIdx] = wordName.toLowerCase();
        setLevels(newLevels);
        
        if (gameState === 'IDLE') {
            setActiveLevels(newLevels);
        }
    };

    const playClick = () => {
        if (isMetronomeActive && clickRef.current) {
            clickRef.current.currentTime = 0;
            clickRef.current.play().catch(() => {});
        }
    };

    // --- LÓGICA DE NIVELES ALEATORIOS ---
    const generateLevel = (wordsCount: number, lastWords: string[]) => {
        try {
            const level: string[] = [];
            const wordsToUse: string[] = [...lastWords];
            const wordCountMap: Record<string, number> = {};
    
            console.log("Generating level with", wordsCount, "words. Last words:", lastWords);
            while (wordsToUse.length < wordsCount) {
                const randomIndex = Math.floor(Math.random() * words.length);
                let newWord = words[randomIndex].name.toLowerCase();
                if (wordsToUse.includes(newWord)) continue;
                wordsToUse.push(newWord);
            }
    
            const wordAppearances = LEVEL_LENGTH / wordsCount;
            while (level.length < LEVEL_LENGTH) {
                const randomWord = wordsToUse[Math.floor(Math.random() * wordsToUse.length)];
                if ((wordCountMap[randomWord] || 0) >= wordAppearances) continue;
                wordCountMap[randomWord] = (wordCountMap[randomWord] || 0) + 1;
                level.push(randomWord);
            }
            return level;
        } catch (error) {
            console.error("Error generating level:", error);
            return INITIAL_LEVELS[0];
        }
    };

    const generateRandomLevels = () => {
        try {
            const levels: string[][] = [];
            let lastWords: string[] = [];
            for (let i = 0; i < RANDOM_TOTAL_ROUNDS; i++) {
                console.log("Generating level", i);
                const newLevel = generateLevel(RANDOM_WORDS_PER_LEVEL[i], lastWords);
                levels.push(newLevel);
                lastWords = Array.from(new Set(newLevel));
            }
            return levels;
        } catch (error) {
            console.error("Error generating random levels:", error);
            return INITIAL_LEVELS;
        }
    };

    // Exportar configuración a un archivo JSON
    const exportData = () => {
        const data = { 
            words, 
            levels, 
            config: { bpm, initialWait, waitBetween } 
        };
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `beat-scanner-pack.json`;
        link.click();
    };

    // Importar configuración desde un archivo JSON
    const importData = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const data = JSON.parse(event.target?.result as string);
                if (data.words) setWords(data.words);
                if (data.levels) {
                    setLevels(data.levels);
                    setActiveLevels(data.levels);
                }
                if (data.config) {
                    setBpm(data.config.bpm);
                    setInitialWait(data.config.initialWait);
                    setWaitBetween(data.config.waitBetween);
                }
                alert("Pack cargado correctamente.");
            } catch (err) {
                alert("Error al leer el archivo JSON.");
            }
        };
        reader.readAsText(file);
    };

    return (
        <div className="flex flex-col items-center min-h-screen bg-zinc-950 p-4 md:p-8 text-white font-sans transition-colors duration-500">
            
            {/* SWITCHER DE VISTA */}
            <div className="flex bg-zinc-900/50 p-1.5 rounded-2xl mb-8 border border-zinc-800 shadow-xl">
                <button 
                    onClick={() => { resetGame(); setView('PLAY'); }}
                    className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold transition-all ${view === 'PLAY' ? 'bg-primary text-black shadow-lg shadow-primary/20' : 'text-zinc-500 hover:text-zinc-300'}`}
                >
                    <Music size={18}/> JUGAR
                </button>
                <button 
                    onClick={() => { resetGame(); setView('EDIT'); }}
                    className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold transition-all ${view === 'EDIT' ? 'bg-zinc-100 text-black shadow-lg shadow-white/10' : 'text-zinc-500 hover:text-zinc-300'}`}
                >
                    <Edit3 size={18} /> EDITOR
                </button>
            </div>

            {view === 'PLAY' ? (
                /* --- INTERFAZ DE JUEGO --- */
                <div className="w-full max-w-5xl flex flex-col items-center animate-in fade-in duration-700">
                    
                    {/* HUD */}
                    <div className="mb-6 w-full flex justify-between items-end border-b border-zinc-800/50 pb-4">
                        <div className="flex flex-col">
                            <div className="flex flex-row gap-2 items-center">
                                <Zap size={24} />
                                <h1 className="text-xl md:text-2xl font-black tracking-tighter text-primary italic uppercase">CORD CAWAT BEAT</h1>
                            </div>

                            <p className="text-zinc-600 text-[10px] font-bold uppercase tracking-widest">Mastering Rhythms</p>
                        </div>
                        <div className="text-right">
                            <span className="text-zinc-500 text-[10px] font-bold block uppercase tracking-tighter">Round</span>
                            <span className="text-3xl md:text-5xl font-black font-mono leading-none">
                                {currentRound}<span className="text-zinc-800">/</span>{activeLevels.length}
                            </span>
                        </div>
                    </div>

                    {/* GRILLA + SIDEBAR */}
                    <div className="flex flex-col lg:flex-row gap-6 w-full items-stretch">
                        
                        {/* GRILLA */}
                        <div className="relative flex-grow aspect-[2/1] md:aspect-[16/8] overflow-hidden rounded-2xl group">
                            <div className={`grid grid-cols-4 grid-rows-2 gap-2 md:gap-4 h-full transition-all duration-1000 ${gameState === 'IDLE' ? 'blur-3xl scale-110 opacity-30 grayscale' : 'blur-0 scale-100 opacity-100'}`}>
                                {activeLevels[currentRound - 1]?.map((wordKey, i) => {
                                    const wordData = words.find(w => w.name.toLowerCase() === wordKey.toLowerCase());
                                    const isFirstMatch = firstAppearanceMap[wordKey.toLowerCase()] === `${currentRound - 1}-${i}`;

                                    return (
                                        <div key={i} className={`relative rounded-xl overflow-hidden transition-all duration-150 border-[3px] md:border-[8px] ${
                                            activeBuffer === i 
                                            ? 'border-primary scale-[1.03] z-10 shadow-[0_0_50px_rgba(var(--primary),0.5)]' 
                                            : (gameState === 'PLAYING' && !isWaitPhase ? 'border-zinc-900 scale-95' : 'border-zinc-800')
                                        }`}>
                                            <Image src={wordData?.image || '/placeholder.png'} className="w-full h-full object-cover" alt="" width={400} height={400} />
                                            {isFirstMatch && gameState !== 'IDLE' && (
                                                <div className="absolute inset-0 flex items-end justify-center pointer-events-none md:mb-2 px-2">
                                                    <div className="bg-yellow-400 px-1 py-1 md:px-5 md:py-2 rounded-lg shadow-2xl border-2 border-white/50">
                                                        <span className="text-[12px] sm:text-xl md:text-3xl font-black uppercase text-zinc-950 italic leading-none"
                                                            style={{ WebkitTextStroke: '1.5px white', paintOrder: 'stroke fill' }}>
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
                                <div className="absolute inset-0 flex items-center justify-center z-20">
                                    <div className="text-center p-8 bg-zinc-900/40 backdrop-blur-md rounded-3xl border border-white/5 shadow-2xl">
                                        <Music className="mx-auto text-primary mb-4 animate-bounce" size={48} />
                                        <p className="text-sm font-black uppercase tracking-[0.5em] text-zinc-400">Ready to beat</p>
                                    </div>
                                </div>
                            )}

                            {gameState === 'COUNTDOWN' && (
                                <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/40 backdrop-blur-sm rounded-xl">
                                    <span className="text-8xl md:text-[12rem] font-black animate-ping text-primary italic">{countdown}</span>
                                </div>
                            )}

                            {gameState === 'PAUSED' && (
                                <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/60 backdrop-blur-md rounded-xl">
                                    <div className="flex flex-col items-center gap-4">
                                        <Pause size={80} className="text-white animate-pulse" />
                                        <span className="text-2xl font-black uppercase tracking-widest italic">Game Paused</span>
                                    </div>
                                </div>
                            )}

                            {gameState === 'FINISHED' && (
                                <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-primary/20 backdrop-blur-2xl rounded-xl border-4 border-primary animate-in fade-in zoom-in duration-500">
                                    <Zap size={100} fill="currentColor" className="text-primary mb-4" />
                                    <h2 className="text-5xl md:text-8xl font-black mb-8 italic tracking-tighter">SUCCESS!</h2>
                                    <Button onClick={resetGame} size="lg" className="rounded-full px-12 py-8 text-2xl font-bold shadow-2xl hover:scale-110 transition-transform">PLAY AGAIN</Button>
                                </div>
                            )}
                        </div>

                        {/* SIDEBAR MODOS */}
                        <div className="flex flex-row lg:flex-col gap-3 w-full lg:w-40 order-2">
                            <button 
                                onClick={() => setShowSettings(!showSettings)} 
                                disabled={gameState !== 'IDLE'}
                                className={`h-12 w-12 md:h-16 md:w-16 rounded-full flex items-center justify-center transition-all ${gameState !== 'IDLE' ? 'hidden' : 'flex'} ${showSettings ? 'bg-zinc-700 text-white rotate-90' : 'text-zinc-500 hover:text-white hover:bg-zinc-800'}`}
                            >
                                <Settings2 size={28} />
                            </button>

                            <button
                                onClick={() => setIsRandomMode(!isRandomMode)}
                                disabled={gameState !== 'IDLE'}
                                className={`flex-1 lg:flex-none flex flex-row lg:flex-col items-center justify-center gap-3 p-4 md:p-6 rounded-3xl border-2 transition-all duration-300 ${
                                    isRandomMode ? 'bg-purple-600/20 border-purple-500 text-purple-400 shadow-[0_0_30px_rgba(168,85,247,0.2)]' : 'bg-zinc-900 border-zinc-800 text-zinc-500 hover:bg-zinc-800'
                                } ${gameState !== 'IDLE' && 'opacity-20'}`}
                            >
                                <Zap size={28} fill={isRandomMode ? "currentColor" : "none"} />
                                <span className="text-[10px] font-black uppercase tracking-widest text-center leading-tight">Random Mode</span>
                            </button>

                            <button
                                onClick={() => setIsMetronomeActive(!isMetronomeActive)}
                                className={`flex-1 lg:flex-none flex flex-row lg:flex-col items-center justify-center gap-3 p-4 md:p-6 rounded-3xl border-2 transition-all ${
                                    isMetronomeActive 
                                    ? 'bg-amber-500/20 border-amber-500 text-amber-500 shadow-[0_0_20px_rgba(245,158,11,0.2)]' 
                                    : 'bg-zinc-900 border-zinc-800 text-zinc-500'
                                }`}
                            >
                                <Music size={18} className={isMetronomeActive ? "animate-bounce" : ""} />
                                <span className="text-[10px] font-black uppercase tracking-widest">
                                    {isMetronomeActive ? "METRONOME ON" : "METRONOME OFF"}
                                </span>
                            </button>
                        </div>
                    </div>

                    {/* CONTROLES FLOTANTES */}
                    <div className="mt-12 flex flex-col items-center gap-6 relative">
                        <div className="bg-zinc-900/90 backdrop-blur-xl p-4 rounded-full border border-zinc-800 flex items-center gap-4 shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
                            {gameState === 'IDLE' ? (
                                <button 
                                    onClick={startCountdown} 
                                    className="h-16 w-16 md:h-20 md:w-20 rounded-full bg-primary flex items-center justify-center hover:scale-110 active:scale-95 transition-all shadow-lg shadow-primary/20"
                                >
                                    <Play fill="black" size={32} className="ml-1" />
                                </button>
                            ) : (
                                <div className="flex gap-3">
                                    {(gameState === 'PLAYING' || gameState === 'PAUSED') && (
                                        <button 
                                            onClick={togglePause} 
                                            className={`h-16 w-16 md:h-20 md:w-20 rounded-full flex items-center justify-center transition-all ${gameState === 'PAUSED' ? 'bg-green-500 shadow-lg shadow-green-500/20' : 'bg-zinc-800 text-white'}`}
                                        >
                                            {gameState === 'PAUSED' ? <Play fill="white" size={32} className="ml-1" /> : <Pause size={32} />}
                                        </button>
                                    )}
                                    <button onClick={resetGame} className="h-16 w-16 md:h-20 md:w-20 rounded-full bg-zinc-800 flex items-center justify-center hover:bg-zinc-700 active:scale-95 transition-all">
                                        <RotateCcw size={32} className="text-zinc-400" />
                                    </button>
                                </div>
                            )}
                        </div>

                        <div className="flex flex-col flex-1 lg:flex-none gap-2 bg-zinc-900/50 p-4 rounded-3xl border border-zinc-800">
                            <span className="text-[10px] text-zinc-500 font-black uppercase text-center mb-2">Speed</span>
                            <div className="grid grid-cols-4 lg:grid-cols-8 gap-1.5">
                                {SPEED_OPTIONS.map(v => (
                                    <button 
                                        key={v} 
                                        onClick={() => setSpeed(v)} 
                                        className={`text-[10px] p-2 rounded-lg font-bold transition-colors ${speed === v ? 'bg-primary text-black' : 'bg-zinc-800 text-zinc-400 hover:text-white'}`}
                                    >
                                        {v}x
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* PANEL DE CONFIGURACIÓN RÁPIDA */}
                        {showSettings && (
                            <div className="absolute bottom-32 left-1/2 -translate-x-1/2 w-[90vw] max-w-[440px] bg-zinc-900 border border-zinc-800 p-8 rounded-[2.5rem] shadow-2xl z-50 animate-in fade-in slide-in-from-bottom-8 duration-300">
                                <button className="absolute top-4 right-4 text-zinc-500" onClick={() => setShowSettings(false)}><X /></button>
                                <div className="grid grid-cols-2 gap-8">
                                    <div className="flex flex-col gap-2">
                                        <span className="text-[10px] text-zinc-500 font-black uppercase tracking-widest">Master BPM</span>
                                        <input type="number" value={bpm} onChange={(e) => setBpm(Number(e.target.value))} className="bg-zinc-950 p-4 rounded-2xl text-2xl font-black text-primary outline-none border border-zinc-800 focus:border-primary/50 transition-colors" />
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        <span className="text-[10px] text-zinc-500 font-black uppercase tracking-widest">Start Offset (s)</span>
                                        <input type="number" step="0.1" value={initialWait} onChange={(e) => setInitialWait(Number(e.target.value))} className="bg-zinc-950 p-4 rounded-2xl text-2xl font-black text-white outline-none border border-zinc-800 focus:border-white/20 transition-colors" />
                                    </div>
                                    <div className="flex flex-col gap-2 col-span-2">
                                        <span className="text-[10px] text-zinc-500 font-black uppercase tracking-widest">Wait Between Rounds (s)</span>
                                        <input type="number" step="0.1" value={waitBetween} onChange={(e) => setWaitBetween(Number(e.target.value))} className="bg-zinc-950 p-4 rounded-2xl text-2xl font-black text-white outline-none border border-zinc-800 focus:border-white/20 transition-colors" />
                                    </div>
                                </div>
                                <p className="text-center mt-6 text-[9px] font-bold text-zinc-600 uppercase tracking-[0.3em]">Hardware Audio Sync Engine</p>
                            </div>
                        )}
                    </div>
                </div>
            ) : (
                /* --- VISTA DE EDITOR PRO --- */
                <div className="w-full max-w-7xl grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in slide-in-from-right-8 duration-500">
                    
                    {/* DICCIONARIO */}
                    <div className="bg-zinc-900/30 p-8 rounded-[2.5rem] border border-zinc-800/50 backdrop-blur-md">
                        <div className="flex justify-between items-center mb-8">
                            <div>
                                <h2 className="text-2xl font-black uppercase tracking-tighter">Assets</h2>
                                <p className="text-[10px] text-zinc-500 font-bold uppercase">Manage words & images</p>
                            </div>
                            <Button onClick={() => setWords([...words, { id: Date.now().toString(), name: "Nuevo", image: "" }])} className="rounded-full h-12 w-12 bg-primary text-black hover:scale-110 transition-transform">
                                <Plus size={24} />
                            </Button>
                        </div>
                        <div className="space-y-4 max-h-[65vh] overflow-y-auto pr-3 custom-scrollbar">
                            {words.map((w, idx) => (
                                <div key={w.id} className="flex flex-col gap-3 bg-zinc-950/50 p-5 rounded-2xl border border-zinc-800 group hover:border-zinc-700 transition-colors">
                                    <div className="flex justify-between items-center">
                                        <input 
                                            value={w.name} 
                                            onChange={(e) => {
                                                const n = [...words]; n[idx].name = e.target.value; setWords(n);
                                            }}
                                            className="bg-transparent text-lg font-black text-primary outline-none uppercase w-full"
                                        />
                                        <button onClick={() => setWords(words.filter(item => item.id !== w.id))} className="text-zinc-700 hover:text-red-500 transition-colors"><Trash2 size={18}/></button>
                                    </div>
                                    <input 
                                        placeholder="URL de la imagen" 
                                        value={w.image} 
                                        onChange={(e) => {
                                            const n = [...words]; n[idx].image = e.target.value; setWords(n);
                                        }}
                                        className="bg-zinc-900/50 p-2 rounded-lg text-[10px] text-zinc-500 outline-none border border-zinc-800 italic"
                                    />
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* CONSTRUCTOR DE NIVELES */}
                    <div className="lg:col-span-2 space-y-8">
                        <div className="flex flex-col justify-between items-center bg-zinc-900/30 p-6 rounded-[2rem] border border-zinc-800/50 lg:flex-row">
                            <div>
                                <h2 className="text-2xl font-black uppercase tracking-tighter">Timeline Grid</h2>
                                <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Sequence design</p>
                            </div>
                            <div className="flex flex-col mt-2 lg:mt-0 lg:flex-row gap-3">
                                <Button onClick={exportData} className="w-full lg:w-auto bg-primary text-primary-foreground rounded-xl font-black shadow-lg shadow-primary/10 px-8 hover:scale-105 transition-transform">
                                    <Download size={18} className="mr-2" /> EXPORT
                                </Button>
                                <Button 
                                    onClick={() => fileInputRef.current?.click()}
                                    className="w-full lg:w-auto bg-primary text-primary-foreground rounded-xl font-black shadow-lg shadow-primary/10 px-8 hover:scale-105 transition-transform"
                                >
                                    <Upload size={18} className="mr-2" /> 
                                    IMPORT
                                </Button>

                                {/* INPUT OCULTO */}
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    onChange={importData}
                                    className="hidden"
                                    accept=".json"
                                />
                                <Button onClick={saveSettings} className="w-full lg:w-auto bg-primary text-primary-foreground rounded-xl font-black shadow-lg shadow-primary/10 px-8 hover:scale-105 transition-transform">
                                    <Save size={18} className="mr-2"/>
                                    SAVE CHANGES
                                </Button>
                            </div>
                        </div>

                        <div className="space-y-6 max-h-[70vh] overflow-y-auto pr-4 custom-scrollbar">
                            {levels.map((round, rIdx) => (
                                <div key={rIdx} className="bg-zinc-900/20 p-6 rounded-[2rem] border border-zinc-800 hover:bg-zinc-900/40 transition-colors relative group">
                                    <div className="flex justify-between items-center mb-4">
                                        <span className="text-xs font-black text-zinc-600 uppercase tracking-[0.4em]">Round 0{rIdx + 1}</span>
                                        <button onClick={() => setLevels(levels.filter((_, i) => i !== rIdx))} className="opacity-0 group-hover:opacity-100 text-zinc-700 hover:text-red-500 transition-all"><X size={20}/></button>
                                    </div>
                                    <div className="grid grid-cols-4 md:grid-cols-8 gap-3">
                                        {round.map((slot, sIdx) => {
                                            const currentWord = words.find(w => w.name.toLowerCase() === slot.toLowerCase());
                                            
                                            return (
                                                <div key={sIdx} className="flex flex-col gap-1.5">
                                                    <span className="text-[8px] text-center text-zinc-700 font-bold uppercase italic">{sIdx + 1}</span>
                                                    <button 
                                                        onClick={() => setEditingSlot({ rIdx, sIdx })}
                                                        className="relative aspect-square bg-zinc-950 border border-zinc-800 rounded-xl overflow-hidden hover:border-primary hover:scale-105 transition-all group"
                                                    >
                                                        {currentWord?.image ? (
                                                            <Image src={currentWord.image} className="w-full h-full object-cover" alt="" width={400} height={400} />
                                                        ) : (
                                                            <div className="flex items-center justify-center h-full"><Plus size={12} className="text-zinc-800" /></div>
                                                        )}
                                                        <div className="absolute inset-0 flex items-center justify-center">
                                                            <Edit3 size={32} className="text-primary rounded-full opacity-0 group-hover:opacity-100 bg-zinc-800 transition-opacity p-1" />
                                                        </div>
                                                    </button>
                                                    <span className="text-[9px] text-center text-zinc-500 font-bold uppercase truncate px-1">{slot}</span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* MODAL SELECTOR VISUAL */}
            {editingSlot && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-in fade-in duration-300">
                    <div className="bg-zinc-900 border border-zinc-800 w-full max-w-2xl rounded-[2.5rem] p-8 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                        <div className="flex justify-between items-center mb-6">
                            <div>
                                <h2 className="text-2xl font-black uppercase tracking-tighter">Select Word</h2>
                                <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Round {editingSlot.rIdx + 1} — Beat {editingSlot.sIdx + 1}</p>
                            </div>
                            <button onClick={() => setEditingSlot(null)} className="h-12 w-12 rounded-full bg-zinc-800 flex items-center justify-center hover:bg-zinc-700 transition-colors">
                                <X size={24} />
                            </button>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 overflow-y-auto pr-2 custom-scrollbar">
                            {words.map((w) => (
                                <button
                                    key={w.id}
                                    onClick={() => {
                                        updateLevelSlot(editingSlot.rIdx, editingSlot.sIdx, w.name);
                                        setEditingSlot(null);
                                    }}
                                    className="group relative aspect-square rounded-2xl overflow-hidden border-2 border-zinc-800 hover:border-primary transition-all bg-zinc-950"
                                >
                                    <Image src={w.image} className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity" alt={w.name} width={400} height={400} />
                                    <div className="absolute inset-x-0 bottom-0 bg-black/80 py-2 text-center">
                                        <span className="text-[10px] font-black uppercase tracking-tighter">{w.name}</span>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}
            
            <audio ref={audioRef} src="/audio/stwbg_single.mp3" />
            <audio ref={clickRef} src="/audio/metronomo.mp3" preload="auto" />

            <style jsx global>{`
                .custom-scrollbar::-webkit-scrollbar { width: 6px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #27272a; border-radius: 10px; }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #3f3f46; }
            `}</style>
        </div>
    );
}