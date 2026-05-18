import { Modifier } from "../types";
import LetterTileComponent from "./letter-tile";

export const getModifier = (row: number, col: number): Modifier | null => {
    if (
        (row === 0 && (col === 0 || col === 7 || col === 14)) ||
        (row === 7 && (col === 0 || col === 14)) ||
        (row === 14 && (col === 0 || col === 7 || col === 14))
    ) return 'TW';

    if (
        (row === 1 && (col === 1 || col === 13)) ||
        (row === 13 && (col === 1 || col === 13)) ||
        (row === 2 && (col === 2 || col === 12)) ||
        (row === 12 && (col === 2 || col === 12)) ||
        (row === 3 && (col === 3 || col === 11)) ||
        (row === 11 && (col === 3 || col === 11)) ||
        (row === 4 && (col === 4 || col === 10)) ||
        (row === 10 && (col === 4 || col === 10)) ||
        (row === 7 && col === 7)
    ) return 'DW';

    if (
        (row === 0 && (col === 3 || col === 11)) ||
        (row === 2 && (col === 6 || col === 8)) ||
        (row === 3 && (col === 0 || col === 7 || col === 14)) ||
        (row === 6 && (col === 2 || col === 6 || col === 8 || col === 12)) ||
        (row === 7 && (col === 3 || col === 11)) ||
        (row === 8 && (col === 2 || col === 6 || col === 8 || col === 12)) ||
        (row === 11 && (col === 0 || col === 7 || col === 14)) ||
        (row === 12 && (col === 6 || col === 8)) ||
        (row === 14 && (col === 3 || col === 11))
    ) return 'DL';

    if (
        (row === 1 && (col === 5 || col === 9)) ||
        (row === 5 && (col === 1 || col === 5 || col === 9 || col === 13)) ||
        (row === 9 && (col === 1 || col === 5 || col === 9 || col === 13)) ||
        (row === 13 && (col === 5 || col === 9))
    ) return 'TL';

    return null;
};

export default function Board({tiles, hoveredSquare}: { tiles?: any, hoveredSquare?: {row: number, col: number} | null }) {
    const bgColors = {
        TW:   'bg-red-500',
        DW:   'bg-red-300',
        TL:   'bg-blue-500',
        DL:   'bg-blue-300',
        null: 'bg-orange-200'
    };

    return (
        <div>
            <div className="flex items-center">
                {Array.from({ length: 16 }).map((_, row) => (
                    <div key={row} className="flex items-center">
                        
                        <span className="text-center w-10 font-sans text-xs">{row > 0 && row}</span>
                    </div>
                ))}
            </div>
            {Array.from({ length: 15 }).map((_, row) => (
                <div key={row} className="flex items-center">
                    <span className="text-right w-10 pr-2 font-sans text-xs">{row+1}</span>
                    {Array.from({ length: 15 }).map((_, col) => {
                        const modifier = getModifier(row, col); 
                        const isStart = row === 7 && col === 7;
                        const cellId = `${row}-${col}`;
                        const letterTile = tiles && tiles[cellId];
                        const isHovered = hoveredSquare && hoveredSquare.row === row && hoveredSquare.col === col;
                        return (
                            <div
                                key={col}
                                className={`${bgColors[modifier || 'null']} border-slate-700 border w-10 h-10 flex items-center justify-center ${isHovered ? 'bg-yellow-400' : ''}`}
                            >
                                {modifier && !letterTile && <span className="text-center text-xs font-bold">{isStart ? '★' : modifier}</span>}
                                {letterTile && letterTile.letter !== undefined && (
                                    <LetterTileComponent {...letterTile} />
                                )}
                            </div>
                        )
                    })}
                </div>
            ))}
        </div>
    )
}
