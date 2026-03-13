import React from 'react';
import { render, screen } from '@testing-library/react';
import TicTacToe from '../components/TicTacToe';

test('renders Tic Tac Toe title', () => {
  render(<TicTacToe />);
  const titleElement = screen.getByText(/Classic Tic Tac Toe/i);
  expect(titleElement).toBeInTheDocument();
});
