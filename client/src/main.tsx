import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Add custom CSS for the Tetris game
const style = document.createElement('style');
style.textContent = `
  @import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&family=Roboto:wght@400;700&display=swap');
  
  :root {
    --tetris-bg: #1a2a3a;
    --tetris-grid: #223344;
    --tetris-border: #334455;
    --tetris-i: #00FFFF;
    --tetris-j: #0000FF;
    --tetris-l: #FF8800;
    --tetris-o: #FFFF00;
    --tetris-s: #00FF00;
    --tetris-t: #9900FF;
    --tetris-z: #FF0000;
  }
  
  body {
    background: linear-gradient(to bottom, #1a2a3a, #0a1a2a);
    min-height: 100vh;
    overscroll-behavior: none;
  }
  
  .tetris-block {
    box-shadow: inset 3px 3px 6px rgba(255, 255, 255, 0.4), 
                inset -3px -3px 6px rgba(0, 0, 0, 0.4);
    transition: all 0.1s ease;
  }
  
  .next-block {
    width: 20px;
    height: 20px;
    margin: 1px;
  }
  
  .game-grid-cell {
    width: 100%;
    height: 0;
    padding-bottom: 100%;
    position: relative;
    border: 1px solid rgba(255, 255, 255, 0.05);
    background-color: rgba(0, 0, 0, 0.2);
  }
  
  @keyframes clearLine {
    0% { transform: scale(1); opacity: 1; }
    50% { transform: scale(1.1); opacity: 0.8; background-color: white; }
    100% { transform: scale(0); opacity: 0; }
  }
  
  .clear-animation {
    animation: clearLine 0.3s forwards;
  }
  
  .game-btn {
    text-shadow: 0 0 5px cyan;
    transition: all 0.2s ease;
  }
  
  .game-btn:hover {
    text-shadow: 0 0 10px cyan, 0 0 20px cyan;
    transform: scale(1.05);
  }
  
  .control-btn {
    user-select: none;
    transition: all 0.1s ease;
  }
  
  .control-btn:active {
    transform: scale(0.9);
    opacity: 0.8;
  }
  
  .font-game {
    font-family: 'Press Start 2P', cursive;
  }
  
  .font-main {
    font-family: 'Roboto', sans-serif;
  }
`;
document.head.appendChild(style);

createRoot(document.getElementById("root")!).render(<App />);
