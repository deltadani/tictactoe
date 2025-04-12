import React, { useState } from 'react';
import { Chess, Square } from 'chess.js';
import { Chessboard } from 'react-chessboard';
import './Chess.css';

const pieceIcons: Record<string, string> = {
  p: '♙', // Pawn
  r: '♖', // Rook
  n: '♘', // Knight
  b: '♗', // Bishop
  q: '♕', // Queen
  k: '♔', // King
};

const ChessGame: React.FC = () => {
  const [game, setGame] = useState(new Chess());
  const [isWhiteTurn, setIsWhiteTurn] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [whiteCaptured, setWhiteCaptured] = useState<string[]>([]); // Captured by White
  const [blackCaptured, setBlackCaptured] = useState<string[]>([]); // Captured by Black

  const onDrop = (sourceSquare: Square, targetSquare: Square): boolean => {
    const newGame = new Chess(game.fen());

    // Get the piece being moved
    const piece = game.get(sourceSquare);

    // Check if the move is valid for a pawn moving too many spaces
    if (piece?.type === 'p') {
      const dx = Math.abs(sourceSquare.charCodeAt(0) - targetSquare.charCodeAt(0));
      const dy = Math.abs(parseInt(sourceSquare[1]) - parseInt(targetSquare[1]));

      // Pawns can only move forward 1 or 2 spaces (on their first move) or diagonally when capturing
      const isFirstMove = (piece.color === 'w' && sourceSquare[1] === '2') || (piece.color === 'b' && sourceSquare[1] === '7');
      if (dx > 0 || (dy > 2 || (dy > 1 && !isFirstMove))) {
        setErrorMessage('Pawns can only move forward 1 or 2 spaces on their first move.');
        return false;
      }
    }

    // Check if the move is a diagonal move for a pawn
    if (piece?.type === 'p') {
      const isDiagonalMove = sourceSquare[0] !== targetSquare[0];
      const targetPiece = game.get(targetSquare);

      // Pawns can move diagonally only when capturing an opponent's piece
      if (isDiagonalMove && (!targetPiece || targetPiece.color === piece.color)) {
        setErrorMessage('Pawns can only move diagonally when capturing an opponent piece.');
        return false;
      }

      // Pawns cannot move forward into an occupied square
      if (!isDiagonalMove && targetPiece) {
        setErrorMessage('Pawns cannot move forward into an occupied square.');
        return false;
      }

      // Pawns can move forward only one square unless it's their first move
      const dy = parseInt(targetSquare[1]) - parseInt(sourceSquare[1]);
      const isForwardMove = piece.color === 'w' ? dy === 1 : dy === -1;
      const isFirstMove = piece.color === 'w' ? sourceSquare[1] === '2' : sourceSquare[1] === '7';
      if (!isDiagonalMove && !isForwardMove && !(isFirstMove && Math.abs(dy) === 2)) {
        setErrorMessage('Pawns can only move forward one square, or two squares on their first move.');
        return false;
      }
    }

    // Check if the move is valid for a knight (horse)
    if (piece?.type === 'n') {
      const dx = Math.abs(sourceSquare.charCodeAt(0) - targetSquare.charCodeAt(0));
      const dy = Math.abs(parseInt(sourceSquare[1]) - parseInt(targetSquare[1]));

      // Knights must move in an L-shape: 2 squares in one direction and 1 in the other
      if (!((dx === 2 && dy === 1) || (dx === 1 && dy === 2))) {
        setErrorMessage('Knights can only move in an L-shape.');
        return false;
      }
    }

    // Attempt the move using chess.js validation
    const move = newGame.move({
      from: sourceSquare,
      to: targetSquare,
      promotion: 'q', // Always promote to a queen for simplicity
    });

    // If the move is invalid, provide feedback and return false
    if (!move) {
      const piece = game.get(sourceSquare);
      if (!piece) {
        setErrorMessage(`No piece at ${sourceSquare}`);
      } else if ((isWhiteTurn && piece.color !== 'w') || (!isWhiteTurn && piece.color !== 'b')) {
        setErrorMessage(`It's ${isWhiteTurn ? 'White' : 'Black'}'s turn!`);
      } else {
        setErrorMessage(`Invalid move: ${sourceSquare} to ${targetSquare}`);
      }
      return false;
    }

    // Check if the move leaves the current player's king in check
    if (newGame.inCheck() && ((isWhiteTurn && newGame.turn() === 'w') || (!isWhiteTurn && newGame.turn() === 'b'))) {
      setErrorMessage('You cannot leave your king in check.');
      return false;
    }

    // If a piece was captured, update the captured pieces state
    const targetPiece = game.get(targetSquare);
    if (targetPiece) {
      const capturedIcon = pieceIcons[targetPiece.type] || '';
      if (isWhiteTurn) {
        setWhiteCaptured([...whiteCaptured, capturedIcon]);
      } else {
        setBlackCaptured([...blackCaptured, capturedIcon]);
      }
    }

    // If the move is valid, update the game state and switch turns
    setGame(newGame);
    setIsWhiteTurn(!isWhiteTurn);
    setErrorMessage(null); // Clear any previous error messages
    return true;
  };

  const resetGame = () => {
    setGame(new Chess());
    setIsWhiteTurn(true);
    setErrorMessage(null);
    setWhiteCaptured([]);
    setBlackCaptured([]);
  };

  return (
    <div className="chess-container">
      <h1>Chess Game</h1>
      <div className="turn-indicator">
        Next player: <span className={`player-indicator player-${isWhiteTurn ? 'x' : 'o'}`}>♙</span>
      </div>
      {errorMessage && <div className="error-message">{errorMessage}</div>}
      <div className="captured-pieces">
        <div>White captured: {whiteCaptured.join(' ')}</div>
        <div>Black captured: {blackCaptured.join(' ')}</div>
      </div>
      <Chessboard
        position={game.fen()}
        onPieceDrop={onDrop}
        boardWidth={400}
      />
      <button className="reset-button" onClick={resetGame}>
        Reset Game
      </button>
    </div>
  );
};

export default ChessGame;