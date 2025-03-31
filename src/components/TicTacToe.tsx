import React, { useState, useEffect, useRef } from 'react';
import ReactConfetti from 'react-confetti';
import './TicTacToe2D.css';

type SquareValue = 'X' | 'O' | null;

const calculateWinner = (squares: SquareValue[]): { winner: SquareValue; line: number[] | null } => {
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];

  for (let i = 0; i < lines.length; i++) {
    const [a, b, c] = lines[i];
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return { winner: squares[a], line: lines[i] };
    }
  }
  return { winner: null, line: null };
};

const Square: React.FC<{
  value: SquareValue;
  onClick: () => void;
  disabled: boolean;
  isWinningSquare?: boolean;
  isLastWinningSquare?: boolean;
}> = ({ value, onClick, disabled, isWinningSquare, isLastWinningSquare }) => (
  <button 
    className={`square ${isWinningSquare ? 'winning-square' : ''} ${isLastWinningSquare ? 'last-winning-square' : ''}`} 
    onClick={onClick} 
    disabled={disabled}
  >
    {value}
  </button>
);

const TicTacToe: React.FC = () => {
  const [squares, setSquares] = useState<SquareValue[]>(Array(9).fill(null));
  const [xIsNext, setXIsNext] = useState(true);
  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });
  const [previousWinner, setPreviousWinner] = useState<SquareValue>(null);
  const [previousIsDraw, setPreviousIsDraw] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const [confettiSource, setConfettiSource] = useState({ x: 0, y: 0, w: 0, h: 0 });

  const { winner, line } = calculateWinner(squares);
  const isDraw = !winner && squares.every(square => square !== null);

  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    // Initialize AudioContext on user interaction
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }

    // Play victory sound when someone wins
    if (winner && winner !== previousWinner) {
      playVictorySound();
      setPreviousWinner(winner);
    }

    // Play draw sound when game is a draw
    if (isDraw && !previousIsDraw) {
      playDrawSound();
      setPreviousIsDraw(true);
    }

    // Reset previous states when game is reset
    if (!winner && !isDraw) {
      setPreviousWinner(null);
      setPreviousIsDraw(false);
    }
  }, [winner, isDraw, previousWinner, previousIsDraw]);

  useEffect(() => {
    if (winner && line) {
      // Wait for the next render cycle to ensure DOM is updated
      const updateConfettiSource = () => {
        const gameBoard = document.querySelector('.game-board');
        if (!gameBoard) return;

        const lastSquare = gameBoard.children[line[2]];
        if (!lastSquare) return;

        const rect = lastSquare.getBoundingClientRect();
        const x = rect.left + (rect.width / 2);
        const y = rect.top + (rect.height / 2);

        setConfettiSource({
          x: x,
          y: y,
          w: 0,
          h: 0
        });
      };

      // Try immediately
      updateConfettiSource();

      // If that didn't work, try after a short delay
      setTimeout(updateConfettiSource, 100);
    }
  }, [winner, line]);

  const playVictorySound = () => {
    if (!audioContextRef.current) return;

    const oscillator = audioContextRef.current.createOscillator();
    const gainNode = audioContextRef.current.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContextRef.current.destination);

    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(880, audioContextRef.current.currentTime); // A5 note
    gainNode.gain.setValueAtTime(0.3, audioContextRef.current.currentTime);

    // Create a sequence of notes for victory
    const notes = [880, 1108.73, 1318.51, 1760]; // A5, C#6, E6, A6
    notes.forEach((freq, i) => {
      oscillator.frequency.setValueAtTime(freq, audioContextRef.current!.currentTime + i * 0.1);
    });

    oscillator.start();
    oscillator.stop(audioContextRef.current.currentTime + notes.length * 0.1);
  };

  const playDrawSound = () => {
    if (!audioContextRef.current) return;

    const oscillator = audioContextRef.current.createOscillator();
    const gainNode = audioContextRef.current.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContextRef.current.destination);

    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(440, audioContextRef.current.currentTime); // A4 note
    gainNode.gain.setValueAtTime(0.2, audioContextRef.current.currentTime);

    // Create a sequence of notes for draw
    const notes = [440, 392, 349.23, 330]; // A4, G4, F4, E4
    notes.forEach((freq, i) => {
      oscillator.frequency.setValueAtTime(freq, audioContextRef.current!.currentTime + i * 0.15);
    });

    oscillator.start();
    oscillator.stop(audioContextRef.current.currentTime + notes.length * 0.15);
  };

  const handleClick = (i: number) => {
    if (squares[i] || winner) return;

    const newSquares = squares.slice();
    newSquares[i] = xIsNext ? 'X' : 'O';
    setSquares(newSquares);
    setXIsNext(!xIsNext);
  };

  const status = winner
    ? `Winner: ${winner}`
    : isDraw
    ? 'Game is a draw!'
    : `Next player: ${xIsNext ? 'X' : 'O'}`;

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
          confettiSource={confettiSource}
          initialVelocityX={15}
          initialVelocityY={15}
          style={{ position: 'fixed', top: 0, left: 0, pointerEvents: 'none' }}
        />
      )}
      <h1>Classic Tic Tac Toe</h1>
      <div className="game-info">
        <div className={winner ? 'winner' : ''}>{status}</div>
      </div>
      <div className="game-container">
        <div className="game-board">
          {squares.map((square, i) => (
            <Square
              key={i}
              value={square}
              onClick={() => handleClick(i)}
              disabled={!!square || !!winner}
              isWinningSquare={line?.includes(i)}
              isLastWinningSquare={line ? i === line[2] : false}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default TicTacToe; 