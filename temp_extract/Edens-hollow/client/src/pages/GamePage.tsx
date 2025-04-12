import { useEffect } from "react";
import GameContainer from "../components/GameContainer";
import { useGameState } from "../hooks/useGameState";

export default function GamePage() {
  const { gameState, loadSavedGame } = useGameState();
  
  useEffect(() => {
    // Try to load saved game on component mount
    loadSavedGame();
  }, [loadSavedGame]);
  
  return (
    <GameContainer />
  );
}
