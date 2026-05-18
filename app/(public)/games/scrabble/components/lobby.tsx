export const Lobby = ({ startGame }: { startGame: () => void }) => {
    return (
        <button 
            className="px-4 py-2 bg-green-500 text-white rounded-md shadow hover:bg-green-600 transition-colors"
            onClick={startGame}
        >
            Start Game
        </button>
    );
}