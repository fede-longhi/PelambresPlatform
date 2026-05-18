import { getModifier } from "./components/board";
import { Player, Modifier, LetterTile } from "./types";

export type CheckedTile = {
    letter: string;
    score: number;
    wordMultiplier: Modifier | null;
    horizontalChecked?: boolean;
    verticalChecked?: boolean;
}

export type WordFormed = {
    word: string;
    score: number;
}

export const getCell = ({x, y, boardRect}: {x: number, y: number, boardRect: DOMRect}) => {
    const totalColumns = 15;
    const totalRows = 15;
    const numberRowHeight = 16;
    const numberColumnWidth = 40;
    
    const cellWidth = (boardRect.width - numberColumnWidth) / totalColumns;
    const cellHeight = (boardRect.height - numberRowHeight) / totalRows;

    const col = Math.floor((x - boardRect.left - numberColumnWidth) / cellWidth);
    const row = Math.floor((y - boardRect.top - numberRowHeight) / cellHeight);
    return {row, col};
}

export const validatePlayPosition = (playedTiles: { row: number, col: number }[], board: Record<string, LetterTile>): boolean => {
    if (playedTiles.length === 0) return false;

    // FIRST TURN RULE
    const isFirstTurn = !Object.values(board).some(tile => tile.isFixed);
    if (isFirstTurn) {
        const coversCenter = playedTiles.some(t => t.row === 7 && t.col === 7);
        if (!coversCenter) {
            console.log("Error: La primera jugada debe pasar por el centro (7-7)");
            return false;
        }
    }

    // ALIGNMENT RULE: Tiles must share the same row or the same column
    const isHorizontal = playedTiles.every(t => t.row === playedTiles[0].row);
    const isVertical = playedTiles.every(t => t.col === playedTiles[0].col);

    if (!isHorizontal && !isVertical) {
        console.log("Error: Las fichas no están alineadas en línea recta");
        return false;
    }

    const sortedTiles = [...playedTiles].sort((a, b) => isHorizontal ? a.col - b.col : a.row - b.row);
    const first = sortedTiles[0];
    const last = sortedTiles[sortedTiles.length - 1];

    // CONTINUITY RULE: No empty spaces allowed in the formed line
    if (isHorizontal) {
        for (let c = first.col; c <= last.col; c++) {
            const isPlayedNow = playedTiles.some(t => t.col === c);
            const isFixedOnBoard = board[`${first.row}-${c}`]?.isFixed;
            
            if (!isPlayedNow && !isFixedOnBoard) {
                console.log("Error: Hay un hueco vacío en la palabra");
                return false;
            }
        }
    } else {
        for (let r = first.row; r <= last.row; r++) {
            const isPlayedNow = playedTiles.some(t => t.row === r);
            const isFixedOnBoard = board[`${r}-${first.col}`]?.isFixed;
            
            if (!isPlayedNow && !isFixedOnBoard) {
                console.log("Error: Hay un hueco vacío en la palabra");
                return false;
            }
        }
    }

    // CONECTIVITY RULE: Except for the first turn, at least one tile must be adjacent to an existing fixed tile
    if (!isFirstTurn) {
        let touchesFixedTile = false;

        for (const pt of playedTiles) {
            const neighbors = [
                `${pt.row - 1}-${pt.col}`,
                `${pt.row + 1}-${pt.col}`,
                `${pt.row}-${pt.col - 1}`,
                `${pt.row}-${pt.col + 1}`
            ];

            if (neighbors.some(key => board[key]?.isFixed)) {
                touchesFixedTile = true;
                break;
            }
        }

        if (!touchesFixedTile) {
            console.log("Error: La palabra debe conectarse con las fichas existentes");
            return false;
        }
    }

    return true;
};

export const calculateLetterScore = (position : {row: number, col: number}, board: Record<string, LetterTile>): CheckedTile => {
    const letterToCheck = board[`${position.row}-${position.col}`];
    const modifier = !letterToCheck.isFixed ? getModifier(position.row, position.col) : null;
    let letterScore = letterToCheck.score || 0;
    if (modifier === 'DL') {
        letterScore = letterScore * 2;
    } else if (modifier === 'TL') {
        letterScore = letterScore * 3;
    }
    return { 
        letter: letterToCheck.letter,
        score: letterScore,
        wordMultiplier: modifier && (modifier === 'DW' || modifier === 'TW') ? modifier : null
    };
}

export const calculateScore = (playedTiles: { row: number; col: number; }[], board: Record<string, LetterTile>) => {
    console.log('Validating play with tiles: ', playedTiles);
    if (playedTiles.length === 0) return;
    let wordsPlayed: WordFormed[] = [];
    let tilesChecked: Record<string, CheckedTile> = {};
    let totalScore = 0;
        
    for (const playedPosition of playedTiles) {

        const pivotKey = `${playedPosition.row}-${playedPosition.col}`;

        //check vertical
        let positionToCheck = playedPosition;
        let wordModifiers: Modifier[] = [];
        let wordScore = 0;
        let wordFormed = '';

        const pivotCheckedTile = tilesChecked[pivotKey];
        if ((pivotCheckedTile && !pivotCheckedTile.verticalChecked) || !pivotCheckedTile) {
            //up
            while (board[`${positionToCheck.row}-${positionToCheck.col}`]) {
                const checkedTile = tilesChecked[`${positionToCheck.row}-${positionToCheck.col}`];
                const letterScored = checkedTile ? checkedTile : calculateLetterScore(positionToCheck, board);
                if (!checkedTile || !checkedTile.verticalChecked) {
                    tilesChecked[`${positionToCheck.row}-${positionToCheck.col}`] = { ...letterScored, verticalChecked: true };
                }
                wordScore += letterScored.score;
                wordFormed = letterScored.letter + wordFormed;
                if (letterScored.wordMultiplier) {
                    wordModifiers.push(letterScored.wordMultiplier);
                }
                positionToCheck = { row: positionToCheck.row - 1, col: positionToCheck.col };
            }
            //down
            positionToCheck = { row: playedPosition.row + 1, col: playedPosition.col };
            while (board[`${positionToCheck.row}-${positionToCheck.col}`]) {
                const checkedTile = tilesChecked[`${positionToCheck.row}-${positionToCheck.col}`];
                const letterScored = checkedTile ? checkedTile : calculateLetterScore(positionToCheck, board);
                if (!checkedTile || !checkedTile.verticalChecked) {
                    tilesChecked[`${positionToCheck.row}-${positionToCheck.col}`] = { ...letterScored, verticalChecked: true };
                }
                wordScore += letterScored.score;
                wordFormed = wordFormed + letterScored.letter;
                if (letterScored.wordMultiplier) {
                    wordModifiers.push(letterScored.wordMultiplier);
                }
                positionToCheck = { row: positionToCheck.row + 1, col: positionToCheck.col };
            }

            // Formed word score calculation
            wordScore = wordModifiers.reduce((score, modifier) => {
                if (modifier == 'DW') return score * 2;
                if (modifier == 'TW') return score * 3;
                return score;
            }, wordScore);
            if (wordFormed.length > 1) {
                wordsPlayed.push({ word: wordFormed, score: wordScore });
            }
        }

        if ((pivotCheckedTile && !pivotCheckedTile.horizontalChecked) || !pivotCheckedTile) {
        
            //check horizontal
            positionToCheck = playedPosition;
            wordScore = 0;
            wordFormed = '';
            wordModifiers = [];

            //back
            while (board[`${positionToCheck.row}-${positionToCheck.col}`]) {
                const checkedTile = tilesChecked[`${positionToCheck.row}-${positionToCheck.col}`];
                const letterScored = checkedTile ? checkedTile : calculateLetterScore(positionToCheck, board);
                if (!checkedTile || !checkedTile.horizontalChecked) {
                    tilesChecked[`${positionToCheck.row}-${positionToCheck.col}`] = { ...letterScored, horizontalChecked: true };
                }
                wordScore += letterScored.score;
                wordFormed = letterScored.letter + wordFormed;
                if (letterScored.wordMultiplier) {
                    wordModifiers.push(letterScored.wordMultiplier);
                }

                positionToCheck = { row: positionToCheck.row, col: positionToCheck.col - 1 };
            }

            //forward
            positionToCheck = { row: playedPosition.row, col: playedPosition.col + 1 };
            while (board[`${positionToCheck.row}-${positionToCheck.col}`]) {
                const checkedTile = tilesChecked[`${positionToCheck.row}-${positionToCheck.col}`];
                const letterScored = checkedTile ? checkedTile : calculateLetterScore(positionToCheck, board);
                if (!checkedTile || !checkedTile.horizontalChecked) {
                    tilesChecked[`${positionToCheck.row}-${positionToCheck.col}`] = { ...letterScored, horizontalChecked: true };
                }
                wordScore += letterScored.score;
                wordFormed = wordFormed + letterScored.letter;
                if (letterScored.wordMultiplier) {
                    wordModifiers.push(letterScored.wordMultiplier);
                }

                positionToCheck = { row: positionToCheck.row, col: positionToCheck.col + 1 };
            }

            wordScore = wordModifiers.reduce((score, modifier) => {
                if (modifier == 'DW') return score * 2;
                if (modifier == 'TW') return score * 3;
                return score;
            }, wordScore);
            if (wordFormed.length > 1) {
                wordsPlayed.push({ word: wordFormed, score: wordScore });
            }
        }
    }
    
    totalScore = wordsPlayed.reduce((sum, w) => sum + w.score, totalScore);
    console.log('Words played this turn: ', wordsPlayed);
    console.log('Total score this turn: ', totalScore);
    return totalScore;
}

export const generateTileBag = (distribution: { letter: string, count: number, score: number }[]): LetterTile[] => {
    const bag: LetterTile[] = [];
    distribution.forEach(({ letter, count, score }) => {
        for (let i = 0; i < count; i++) {
            bag.push({ id: `${letter ? letter : '*'}-${i}`, letter, score, isFixed: false, selected: false, isWildcard: letter === '' });
        }
    });
    return bag;
};

export const shuffleBag = (bag: LetterTile[]): LetterTile[] => {
    const shuffled = [...bag];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
};

export const getNewHand = (oldHand: (LetterTile|null)[], bag: LetterTile[], handSize = 7): { newHand: (LetterTile|null)[], newBag: LetterTile[] } => {
    const newHand = [...oldHand];
    const newBag = [...bag];
    for (let i = 0; i < handSize; i++) {
        if (!newHand[i] && newBag.length > 0) {
            newHand[i] = newBag.pop()!;
        }
    }
    return { newHand, newBag };
};

export const generatePlayers = (playerCount: number, bag: LetterTile[]): Player[] => {
    const players: Player[] = [];
    for (let i = 1; i <= playerCount; i++) {
        players.push({
            id: `${i}`,
            name: `Player ${i}`,
            score: 0,
            color: `blue`,
            hand: bag.splice(0, 7),
        });
    }
    return players;
}
