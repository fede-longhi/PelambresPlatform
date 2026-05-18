export type Player = {
    id: string;
    name: string;
    score: number;
    color: string;
    hand: (LetterTile | null)[];
}

export type LetterTile = {
    id: string;
    letter: string;
    score: number;
    isFixed?: boolean;
    selected?: boolean;
    isWildcard?: boolean;
};

export type Modifier = 'DL' | 'TL' | 'DW' | 'TW';

export type GameState = {
    players: Player[];
    board: (LetterTile | null)[][];
    bag: LetterTile[];
}