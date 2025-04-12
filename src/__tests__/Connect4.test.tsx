import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import Connect4 from '../components/Connect4';

describe('Connect4 Component', () => {
  it('renders the Connect 4 game board', () => {
    render(<Connect4 />);
    expect(screen.getByText('Connect 4')).toBeInTheDocument();
  });

  it('handles a winning scenario', () => {
    render(<Connect4 />);
    // Simulate clicks to create a winning line
    // Verify the winner is displayed
  });

  it('resets the game when the reset button is clicked', () => {
    render(<Connect4 />);

    // Debug: Log all buttons to verify the reset button exists
    const buttons = screen.getAllByRole('button');
    console.log('Buttons found:', buttons.map((btn) => btn.textContent));

    // Use a more flexible matcher to find the reset button
    const resetButton = screen.getByRole('button', { name: /reset/i });
    fireEvent.click(resetButton);
    expect(screen.getByText('Next player:')).toBeInTheDocument();
  });
});
