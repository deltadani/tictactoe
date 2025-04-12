import React, { useState } from 'react';
import ReactConfetti from 'react-confetti';
import './Connect4.css';

type Player = 'X' | 'O';
type Board = (Player | null)[][];

const Connect4: React.FC = () => {
  const [board, setBoard] = useState<Board>(Array(6).fill(null).map(() => Array(7).fill(null)));
  const [xIsNext, setXIsNext] = useState(true);
  const [winner, setWinner] = useState<Player | null>(null);
  const [windowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  const calculateWinner = (board: Board): Player | null => {
    // Check horizontal
    for (let row = 0; row < 6; row++) {
      for (let col = 0; col < 4; col++) {
        const player = board[row][col];
        if (player && 
            player === board[row][col + 1] && 
            player === board[row][col + 2] && 
            player === board[row][col + 3]) {
          return player;
        }
      }
    }

    // Check vertical
    for (let row = 0; row < 3; row++) {
      for (let col = 0; col < 7; col++) {
        const player = board[row][col];
        if (player && 
            player === board[row + 1][col] && 
            player === board[row + 2][col] && 
            player === board[row + 3][col]) {
          return player;
        }
      }
    }

    // Check diagonal (positive slope)
    for (let row = 0; row < 3; row++) {
      for (let col = 0; col < 4; col++) {
        const player = board[row][col];
        if (player && 
            player === board[row + 1][col + 1] && 
            player === board[row + 2][col + 2] && 
            player === board[row + 3][col + 3]) {
          return player;
        }
      }
    }

    // Check diagonal (negative slope)
    for (let row = 3; row < 6; row++) {
      for (let col = 0; col < 4; col++) {
        const player = board[row][col];
        if (player && 
            player === board[row - 1][col + 1] && 
            player === board[row - 2][col + 2] && 
            player === board[row - 3][col + 3]) {
          return player;
        }
      }
    }

    return null;
  };

  const handleClick = (col: number) => {
    if (winner) return;

    // Find the lowest empty cell in the clicked column
    for (let row = 5; row >= 0; row--) {
      if (!board[row][col]) {
        const newBoard = board.map(row => [...row]);
        newBoard[row][col] = xIsNext ? 'X' : 'O';
        setBoard(newBoard);
        setXIsNext(!xIsNext);

        // Check for winner after the move
        const newWinner = calculateWinner(newBoard);
        if (newWinner) {
          setWinner(newWinner);
          playVictorySound();
        }
        break;
      }
    }
  };

  const playVictorySound = () => {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(880, audioContext.currentTime);
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);

    const notes = [880, 1108.73, 1318.51, 1760];
    notes.forEach((freq, i) => {
      oscillator.frequency.setValueAtTime(freq, audioContext.currentTime + i * 0.1);
    });

    oscillator.start();
    oscillator.stop(audioContext.currentTime + notes.length * 0.1);
  };

  const resetGame = () => {
    setBoard(Array(6).fill(null).map(() => Array(7).fill(null)));
    setXIsNext(true);
    setWinner(null);
  };

  const status = winner
    ? (
      <div>
        Winner: <span className={`player-indicator player-${winner.toLowerCase()}`}></span>
      </div>
    )
    : (
      <div>
        Next player: <span className={`player-indicator player-${xIsNext ? 'x' : 'o'}`}></span>
      </div>
    );

  return (
    <div className="App">
      {winner && (
        <ReactConfetti
          width={windowSize.width}
          height={windowSize.height}
          recycle={false}
          numberOfPieces={200}
          gravity={0.3}
          colors={['#61dafb', '#ffffff', '#ffd700', '#ff69b4', '#98fb98']}
          confettiSource={{
            x: windowSize.width / 2,
            y: windowSize.height / 2,
            w: 0,
            h: 0
          }}
          initialVelocityX={15}
          initialVelocityY={15}
        />
      )}
      <h1>Connect 4</h1>
      <div className="game-info">
        <div className={winner ? 'winner' : ''}>{status}</div>
      </div>
      <div className="game-board-connect4">
        {board.map((row, rowIndex) => (
          <div key={rowIndex} className="board-row">
            {row.map((cell, colIndex) => (
              <button
                key={`${rowIndex}-${colIndex}`}
                className={`square ${cell ? `player-${cell.toLowerCase()}` : ''}`}
                onClick={() => handleClick(colIndex)}
                disabled={!!winner || !!cell}
              >
                {/* Remove the cell text content */}
              </button>
            ))}
          </div>
        ))}
      </div>
      <button className="reset-button" aria-label="Reset" onClick={resetGame}>Reset</button>
    </div>
  );
};

export default Connect4;