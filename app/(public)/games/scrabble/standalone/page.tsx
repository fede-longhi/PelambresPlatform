'use client';

import { useState, useRef, useEffect } from "react";

import PlayerRack from "../components/rack";
import LetterTileComponent from "../components/letter-tile";
import Board from "../components/board";
import { getCell, calculateScore, validatePlayPosition, generateTileBag, shuffleBag, generatePlayers, getNewHand } from "../scrabble-utils";
import { CircleCheckIcon, CircleUserRoundIcon, CircleXIcon } from "lucide-react";
import { BAG_SLICE_SIZE, FULL_HAND_SCORE_BONUS, HAND_SIZE, PLAYERS_COUNT, TILE_DISTRIBUTION } from "../consts";
import { LetterTile, Player } from "../types";
import { Lobby } from "../components/lobby";
import { WildCardModal } from "../components/wildcard-modal";

export default function Page() {
    const [gameState, setGameState] = useState<'lobby' | 'playing' | 'gameover'>('lobby');

    const [bag, setBag] = useState<LetterTile[]>([]);
    const [players, setPlayers] = useState<Player[]>([]);
    const [playerTurn, setPlayerTurn] = useState(0);

    const [boardTiles, setBoardTiles] = useState<Record<string, LetterTile>>({
        '7-7': { id: 't0', letter: 'A', score: 1, isFixed: true },
        '7-8': { id: 't1', letter: 'L', score: 1, isFixed: true },
        '7-9': { id: 't2', letter: 'O', score: 1, isFixed: true },
    });
    
    const [playedTiles, setPlayedTiles] = useState<{row: number, col: number}[]>([]);

    const [hoveredSquare, setHoveredSquare] = useState<{row: number, col: number} | null>(null);
    const [draggedTile, setDraggedTile] = useState<LetterTile | null>(null);
    const [dragPos, setDragPos] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const [swappingTiles, setSwappingTiles] = useState(false);
    const [canSwapTiles, setCanSwapTiles] = useState(true);

    const [playScore, setPlayScore] = useState(0);
    const [isValidPlay, setIsValidPlay] = useState(false);
    const [isGameOver, setIsGameOver] = useState(false);
    const [wildCardModalOpen, setWildCardModalOpen] = useState(false);
    const [pendingWildcardPos, setPendingWildcardPos] = useState<{row: number, col: number} | null>(null);

    const boardRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (playedTiles.length === 0 || wildCardModalOpen) return;

        const hasPendingWildcard = playedTiles.some(pos => {
            const tile = boardTiles[`${pos.row}-${pos.col}`];
            return tile && tile.isWildcard && tile.letter === '';
        });

        if (hasPendingWildcard) return;

        const hand = players[playerTurn].hand;
        const baseScore = calculateScore(playedTiles, boardTiles) || 0;
        const isHandEmpty = hand.every(t => t === null) && draggedTile === null && playedTiles.length == HAND_SIZE;
        setPlayScore(isHandEmpty ? baseScore + FULL_HAND_SCORE_BONUS : baseScore);
        setIsValidPlay(validatePlayPosition(playedTiles, boardTiles));
        console.log('Valid: ' + validatePlayPosition(playedTiles, boardTiles));
    }, [playedTiles, boardTiles, players, playerTurn, draggedTile, wildCardModalOpen]);

    useEffect(() => {
        if (bag.length < 7) {
            setCanSwapTiles(false);
        }
        if (playedTiles.length > 0) {
            setCanSwapTiles(false);
        }

        if (bag.length >= 7 && playedTiles.length === 0) {
            setCanSwapTiles(true);
        }
    },[bag, playedTiles]);

    const handlePointerMove = (e: React.PointerEvent) => {
        if (!isDragging || !boardRef.current) return;

        const x = e.clientX;
        const y = e.clientY;
        setDragPos({ x, y });

        const boardRect = boardRef.current.getBoundingClientRect();

        
        if (x >= boardRect.left && x <= boardRect.right && y >= boardRect.top && y <= boardRect.bottom) {
            const { row, col } = getCell({x, y, boardRect});
            setHoveredSquare({row, col});
        } else {
            setHoveredSquare(null);
        }

    };

    const handlePointerUp = (e: React.PointerEvent) => {
        console.log('Pointer up: ', {isDragging, draggedTile, boardRect: boardRef.current?.getBoundingClientRect()});
        if (!boardRef.current) return;

        const boardRect = boardRef.current.getBoundingClientRect();
        
        if (
            e.clientX >= boardRect.left && e.clientX <= boardRect.right &&
            e.clientY >= boardRect.top && e.clientY <= boardRect.bottom
        ) {
            const { row, col } = getCell({x: e.clientX, y: e.clientY, boardRect});
            const tileClicked = boardTiles[`${row}-${col}`];
            const cellId = `${row}-${col}`;
            console.log('Tile in cell on drop: ', tileClicked);
            if (tileClicked) {
                if (tileClicked.isFixed) {
                    return;
                }

                if (draggedTile) {
                    if (draggedTile.isWildcard) {
                        setPendingWildcardPos({ row, col });
                        setWildCardModalOpen(true);
                    }
                    setBoardTiles(prev => ({ ...prev, [cellId]: draggedTile }));
                    setPlayedTiles(prev => ([...prev, { row, col }]));
                } else {
                    setBoardTiles(prev => {
                        const newTiles = { ...prev };
                        delete newTiles[cellId];
                        return newTiles;
                    });
                    setPlayedTiles(prev => {
                        const newPlayed = prev.filter(t => t.row !== row || t.col !== col);
                        return newPlayed;
                    });
                }

                setDraggedTile(tileClicked);
                setIsDragging(true);
                setDragPos({ x: e.clientX, y: e.clientY });
            } else {
                if (isDragging && draggedTile) {
                    if (draggedTile.isWildcard) {
                        setPendingWildcardPos({ row, col });
                        setWildCardModalOpen(true);
                    }
                    setBoardTiles(prev => ({ ...prev, [cellId]: draggedTile }));
                    setPlayedTiles(prev => ([...prev, { row, col }]));

                    let player = players[playerTurn];
                    player.hand = player.hand.map(t => t?.id === draggedTile.id ? null : t);
                    setPlayers([...players]);
                }
                setIsDragging(false);
                setDraggedTile(null);
                setHoveredSquare(null);
            }
        }
        console.log('Played tiles after drop: ', JSON.stringify(playedTiles));
    };

    const onRackClick = (e: React.PointerEvent, tile: LetterTile | null, index: number) => {
        if (swappingTiles) {
            if (!tile) return;
            tile.selected = true;
            let player = players[playerTurn];
            player.hand = player.hand.map((t, i) => i === index ? tile : t);
            setPlayers([...players]);
            return;
        }
        
        let tileToReplace = isDragging ? draggedTile : null;
        let player = players[playerTurn];

        if (tileToReplace && tileToReplace.isWildcard) {
            tileToReplace.letter = '';
        }
        player.hand = player.hand.map((t, i) => i === index ? tileToReplace : t);
        setPlayers([...players]);

        setDraggedTile(tile);
        setIsDragging(tile !== null);
        
        if (tile) {
            setDragPos({ x: e.clientX, y: e.clientY });
        }
    };

    const handleResetPlay = () => {
        const newBoardTiles = Object.fromEntries(Object.entries(boardTiles).filter(([_, tile]) => tile.isFixed))
        let hand = players[playerTurn].hand;
        let newHand = [...hand];
        playedTiles.forEach(({row, col}) => {
            const tile = boardTiles[`${row}-${col}`];
            if (tile && !tile.isFixed) {
                if (tile.isWildcard) {
                    tile.letter = '';
                }
                for (let i = 0; i < newHand.length; i++) {
                    if (newHand[i] === null) {
                        newHand[i] = tile;
                        break;
                    }
                }
            }
        });
        players[playerTurn].hand = newHand;
        setBoardTiles(newBoardTiles);
        setPlayedTiles([]);
        setPlayers([...players]);
        setPlayScore(0);
        setIsValidPlay(false);
    }

    const handlePlayWord = () => {
        if (!isValidPlay) return;
        const currentPlayer = players[playerTurn];
        currentPlayer.score += playScore;
        setPlayScore(0);
        
        if (currentPlayer.hand.every(t => t === null) && bag.length === 0) {
            handleEndGame(currentPlayer.id);
            return;
        }

        const {newHand, newBag} = getNewHand(currentPlayer.hand, bag, HAND_SIZE);
        currentPlayer.hand = newHand;
        setBag(newBag);
        setPlayers([...players]);
        for (const {row, col} of playedTiles) {
            const tile = boardTiles[`${row}-${col}`];
            if (tile) {
                tile.isFixed = true;
            }
        }
        setPlayedTiles([]);
        setIsValidPlay(false);

        const nextPlayerTurn = (playerTurn + 1) % players.length;
        setPlayerTurn(nextPlayerTurn);
    }

    const startGame = () => {
        let newBag = shuffleBag(generateTileBag(TILE_DISTRIBUTION));
        if (BAG_SLICE_SIZE) {
            newBag = newBag.slice(0, BAG_SLICE_SIZE);
            console.log('Initial bag: ', newBag);
        }
            
        const players = generatePlayers(PLAYERS_COUNT, newBag);
        setBag(newBag);
        setPlayers(players);
    }

    const handleEndGame = (finishingPlayerId: string) => {
        const finishingPlayer = players.find(p => p.id === finishingPlayerId);
        if (!finishingPlayer) return;
        const updatedPlayers = [...players];
        updatedPlayers.map(player => {
            if (player.id !== finishingPlayerId) {
                const handScore = player.hand.reduce((sum, tile) => sum + (tile ? tile.score : 0), 0);
                player.score -= handScore;
            }
        });

        const nonWinnersRemainingTilesScore = updatedPlayers.reduce((sum, player) => {
            if (player.id !== finishingPlayerId) {
                return sum + player.hand.reduce((s, tile) => s + (tile ? tile.score : 0), 0);
            }
            return sum;
        }, 0);

        const winner = updatedPlayers.reduce((max, player) => player.score > max.score ? player : max, updatedPlayers[0]);
        winner.score += finishingPlayer.hand.reduce((sum, tile) => sum + (tile ? tile.score : 0), 0) + nonWinnersRemainingTilesScore;
        console.log('Winner: ', winner);

        setPlayers([...updatedPlayers]);
        setIsGameOver(true);
    }

    const handleSwapTiles = () => {
        if (bag.length < 7) return; //swapping tiles only allowed if there are at least 7 tiles in the bag
        setSwappingTiles(true);
    }

    const handleConfirmSwap = () => {
        const player = players[playerTurn];
        const tilesToSwap = player.hand.filter(t => t && t.selected) as LetterTile[];
        const tilesToExchange = bag.slice(0, tilesToSwap.length);
        const newBag = [...bag.slice(tilesToSwap.length), ...tilesToSwap];
        player.hand = player.hand.map(t => t && t.selected ? tilesToExchange.pop() || null : t);
        setPlayers([...players]);
        setBag(newBag);
        setSwappingTiles(false);
        setPlayerTurn((playerTurn + 1) % players.length);
    }

    const handleCancelSwap = () => {
        let player = players[playerTurn];
        player.hand = player.hand.map(t => {
            if (t && t.selected) {
                t.selected = false;
                return t;
            }
            return t;
        });
        setPlayers([...players]);
        setSwappingTiles(false);
    }

    const handleWildcardSelect = (selectedLetter: string) => {
        if (!pendingWildcardPos) return;

        const cellId = `${pendingWildcardPos.row}-${pendingWildcardPos.col}`;

        setBoardTiles(prev => {
            const newBoard = { ...prev };
            if (newBoard[cellId]) {
                // Actualizamos la letra del comodín, pero el score sigue siendo 0
                newBoard[cellId] = { ...newBoard[cellId], letter: selectedLetter };
            }
            return newBoard;
        });

        // Cerramos el modal y limpiamos la posición pendiente
        setWildCardModalOpen(false);
        setPendingWildcardPos(null);

    };

    return (
        <div className="flex flex-col items-center">
            <h1 className="my-2 text-2xl font-bold">Scrabble</h1>
            <div
                className="min-h-screen select-none"
                onPointerMove={handlePointerMove}
            >
                {
                    gameState === 'lobby' && 
                    <Lobby startGame={() => {
                        startGame();
                        setGameState('playing');
                    }} />
                }
                {
                    gameState === 'playing' && (
                        <div className="flex flex-col items-center mb-4">
                            <div className="flex items-center justify-between mb-2 py-2 px-4 rounded border-2 bg-gray-500/10 border-gray-500 w-full">
                                {
                                    players.map(player => (
                                        <div key={player.id} className={`flex items-center py-2 px-4 rounded ${playerTurn + 1 === Number(player.id) ? 'border-2 border-violet-500' : 'border border-gray-500'}`}>
                                            <CircleUserRoundIcon
                                                className={`w-4 h-4 ${player.color === 'red' ? 'text-red-500' : player.color === 'blue' ? 'text-blue-500' : 'text-green-500'} mr-2`}
                                            />
                                            <span className="mr-4">{player.name}</span>
                                            <span className="font-semibold">{player.score}</span>
                                        </div>
                                    ))
                                }
                            </div>
                            <div className="flex flex-row">
                                <div ref={boardRef} onPointerUp={handlePointerUp}>
                                    <Board
                                        tiles={boardTiles}
                                        hoveredSquare={hoveredSquare}
                                    />
                                </div>
                                <div className="flex flex-col justify-start items-start ml-6 mt-4 gap-4 ">
                                    <div className="flex flex-row items-center gap-2 mb-2">
                                        <span className={`text-sm ${isValidPlay ? 'text-green-600' : 'text-red-600'}`}>
                                            {isValidPlay ? 
                                                <CircleCheckIcon className="inline w-5 h-5" /> :
                                                <CircleXIcon className="inline w-5 h-5" />
                                            }
                                        </span>
                                        <span>Score: <span className="font-bold">{playScore}</span></span>
                                    </div>
                                    {
                                        !swappingTiles &&
                                        <>
                                            <button className="w-full px-4 py-2 bg-green-500 text-white rounded-md shadow hover:bg-green-600 transition-colors"
                                            onClick={handlePlayWord}>
                                                Play word
                                            </button>
                                            <button className="w-full px-4 py-2 bg-blue-500 text-white rounded-md shadow hover:bg-blue-600 transition-colors"
                                            onClick={handleResetPlay}>
                                                Reset play
                                            </button>
                                        </>
                                    }
                                    {
                                        swappingTiles ? 
                                        <div className="flex flex-row gap-2">
                                            <button
                                            className="w-full px-4 py-2 bg-yellow-500 text-white rounded-md shadow hover:bg-yellow-600 transition-colors"
                                            onClick={handleConfirmSwap}>
                                                Confirm swap
                                            </button>
                                            <button className="w-full px-4 py-2 bg-red-500 text-white rounded-md shadow hover:bg-red-600 transition-colors"
                                            onClick={handleCancelSwap}>
                                                Cancel
                                            </button>
                                        </div>
                                        :
                                        <button
                                        className={`w-full px-4 py-2 bg-yellow-500 text-white rounded-md shadow hover:bg-yellow-600 transition-colors ${canSwapTiles ? '' : 'opacity-50 cursor-not-allowed'}`}
                                        disabled={!canSwapTiles}
                                        onClick={handleSwapTiles}>
                                            Swap tiles
                                        </button>
                                    }
                                </div>
                                </div>
                            
                            <PlayerRack
                                className="mt-0"
                                tiles={players[playerTurn]?.hand}
                                onTileClick={(e, tile, index) => onRackClick(e, tile, index)}
                            />
                        </div>
                    )
                }
                {isDragging && draggedTile && (
                    <div 
                        className="fixed pointer-events-none z-50 transition-transform duration-75"
                        style={{ 
                            left: dragPos.x, 
                            top: dragPos.y,
                            transform: 'translate(-50%, -50%) scale(1.1)',
                        }}
                    >
                        <LetterTileComponent {...draggedTile} />
                    </div>
                )}
                {
                    isGameOver && (
                        <div className="fixed inset-0 bg-black/50 flex flex-col items-center justify-center z-50">
                            <div className="bg-white rounded-lg p-8 shadow-lg text-center">
                                <h2 className="text-2xl font-bold mb-4">Game Over</h2>
                                <p className="text-lg mb-6">Congratulations, {players[playerTurn].name} wins with {players[playerTurn].score} points!</p>
                                <button className="px-4 py-2 bg-green-500 text-white rounded-md shadow hover:bg-green-600 transition-colors"
                                    onClick={() => {
                                        setIsGameOver(false);
                                        setPlayers([]);
                                        setBag([]);
                                        setBoardTiles({});
                                        setPlayedTiles([]);
                                        setPlayerTurn(0);
                                        setGameState('lobby');
                                    }}
                                >
                                    Play Again
                                </button>
                            </div>
                        </div>
                    )
                }
                <WildCardModal isOpen={wildCardModalOpen} onClose={() => setWildCardModalOpen(false)} onSelect={handleWildcardSelect} />
            </div>
        </div>
    );
}