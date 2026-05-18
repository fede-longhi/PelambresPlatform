import { Player } from "../../types";

export default function Lobby({ players }: { players: Player[] }) {
    return (
        <div className="flex flex-col items-center justify-center mt-8">
            <ul className="space-y-2">
                {players.map(player => (
                    <li key={player.id} className="bg-gray-100 p-4 rounded shadow">
                        {player.name}
                    </li>
                ))}
            </ul>
            <p className="text-gray-600 my-8">Waiting for players to join...</p>
        </div>
    );
}