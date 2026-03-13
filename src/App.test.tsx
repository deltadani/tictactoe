import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';

jest.mock('./components/TicTacToe3D', () => {
  return function DummyTicTacToe3D() {
    return <div data-testid="tictactoe-3d-mock">3D Tic Tac Toe</div>;
  };
});

test('renders Happy TicTacToe text', () => {
  render(<App />);
  const linkElement = screen.getByText(/Happy TicTacToe!/i);
  expect(linkElement).toBeInTheDocument();
});
