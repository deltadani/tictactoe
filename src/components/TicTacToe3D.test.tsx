import React from 'react';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import TicTacToe3D from './TicTacToe3D';

jest.mock('three');
jest.mock('react-confetti', () => () => null);

// Mock window.matchMedia
window.matchMedia = window.matchMedia || function() {
  return { matches: false, addListener: function() {}, removeListener: function() {} } as any;
};

describe('TicTacToe3D', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders without crashing', () => {
    const { getByText } = render(<TicTacToe3D />);
    expect(getByText('Qubic (4x4x4 Tic Tac Toe)')).toBeInTheDocument();
  });

  test('initializes with correct game state', () => {
    const { getByText, container } = render(<TicTacToe3D />);
    expect(getByText(/Next player:/)).toBeInTheDocument();
    expect(container.querySelector('.player-indicator.player-x')).toBeInTheDocument();
  });
});