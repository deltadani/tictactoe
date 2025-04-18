import React, { useState } from 'react';
import TicTacToe from './components/TicTacToe';
import TicTacToe3D from './components/TicTacToe3D';
import Connect4 from './components/Connect4';
import Chess from './components/Chess';
import './App.css';

type GameType = '2d' | '3d' | 'connect4' | 'chess' | null;

function App() {
  const [selectedGame, setSelectedGame] = useState<GameType>(null);

  const renderGame = () => {
    switch (selectedGame) {
      case '2d':
        return <TicTacToe />;
      case '3d':
        return <TicTacToe3D />;
      case 'connect4':
        return <Connect4 />;
      case 'chess':
        return <Chess />;
      default:
        return (
          <div className="game-selector">
            <h1>Happy TicTacToe!</h1>
            <div className="game-buttons">
              <button onClick={() => setSelectedGame('2d')}>
                2D Tic Tac Toe
              </button>
              <button onClick={() => setSelectedGame('3d')}>
                3D Tic Tac Toe
              </button>
              <button onClick={() => setSelectedGame('connect4')}>
                Connect 4
              </button>
              <button onClick={() => setSelectedGame('chess')}>
                Chess
              </button>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="App">
      {selectedGame && (
        <button className="back-button" onClick={() => setSelectedGame(null)}>
          Back to Menu
        </button>
      )}
      {renderGame()}
    </div>
  );
}

export default App;
