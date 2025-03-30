import React from 'react';
import { render, fireEvent, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import TicTacToe3D from './TicTacToe3D';

// Mock Three.js
jest.mock('three', () => ({
  Scene: jest.fn(() => ({
    add: jest.fn(),
    background: null,
    children: []
  })),
  PerspectiveCamera: jest.fn(() => ({
    position: { set: jest.fn() },
    lookAt: jest.fn(),
    aspect: 1,
    updateProjectionMatrix: jest.fn()
  })),
  WebGLRenderer: jest.fn(() => ({
    setSize: jest.fn(),
    domElement: { className: 'game-board-3d' },
    render: jest.fn(),
    shadowMap: { enabled: false }
  })),
  BoxGeometry: jest.fn(),
  Mesh: jest.fn(() => ({
    position: { set: jest.fn() },
    castShadow: false,
    receiveShadow: false,
    userData: {},
    material: null,
    scale: { set: jest.fn() }
  })),
  MeshPhongMaterial: jest.fn(() => ({
    clone: jest.fn().mockReturnThis(),
    transparent: false,
    opacity: 1,
    shininess: 0,
    flatShading: true,
    emissive: 0x000000,
    emissiveIntensity: 0
  })),
  Color: jest.fn(),
  AmbientLight: jest.fn(() => ({
    position: { set: jest.fn() }
  })),
  DirectionalLight: jest.fn(() => ({
    position: { set: jest.fn() },
    castShadow: false
  })),
  Raycaster: jest.fn(() => ({
    setFromCamera: jest.fn(),
    intersectObjects: jest.fn().mockReturnValue([])
  })),
  Vector2: jest.fn(() => ({
    x: 0,
    y: 0
  }))
}));

// Mock OrbitControls
jest.mock('three/examples/jsm/controls/OrbitControls', () => ({
  __esModule: true,
  default: jest.fn(() => ({
    enabled: true,
    enableDamping: jest.fn(),
    dampingFactor: 0.05,
    minDistance: 3,
    maxDistance: 10,
    update: jest.fn()
  }))
}));

// Mock ReactConfetti
jest.mock('react-confetti', () => ({
  __esModule: true,
  default: jest.fn(() => null)
}));

describe('TicTacToe3D', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders without crashing', () => {
    const { getByText } = render(<TicTacToe3D />);
    expect(getByText('3D Tic Tac Toe')).toBeInTheDocument();
  });

  test('initializes with correct game state', () => {
    const { getByText } = render(<TicTacToe3D />);
    expect(getByText('Next player: X')).toBeInTheDocument();
  });

  test('updates game state on click', async () => {
    const { getByText, container } = render(<TicTacToe3D />);
    
    // Mock the raycaster intersection
    const { Raycaster } = require('three');
    const raycaster = new Raycaster();
    (raycaster.intersectObjects as jest.Mock).mockReturnValueOnce([{
      object: {
        userData: { x: 0, y: 0, z: 0 },
        material: null
      }
    }]);

    // Simulate a click
    const gameBoard = container.querySelector('.game-board-3d');
    if (gameBoard) {
      await act(async () => {
        fireEvent.click(gameBoard);
      });
    }

    // Check if the game state was updated
    expect(getByText('Next player: O')).toBeInTheDocument();
  });

  test('resets game state', async () => {
    const { getByText, getByRole } = render(<TicTacToe3D />);
    
    // Click reset button
    const resetButton = getByRole('button', { name: /reset game/i });
    await act(async () => {
      fireEvent.click(resetButton);
    });

    // Check if game state is reset
    expect(getByText('Next player: X')).toBeInTheDocument();
  });

  test('detects winner', async () => {
    const { getByText, container } = render(<TicTacToe3D />);
    
    // Mock the raycaster intersection for three clicks in a row
    const { Raycaster } = require('three');
    const raycaster = new Raycaster();
    (raycaster.intersectObjects as jest.Mock)
      .mockReturnValueOnce([{ object: { userData: { x: 0, y: 0, z: 0 }, material: null } }])
      .mockReturnValueOnce([{ object: { userData: { x: 1, y: 0, z: 0 }, material: null } }])
      .mockReturnValueOnce([{ object: { userData: { x: 2, y: 0, z: 0 }, material: null } }]);

    // Simulate three clicks in a row
    const gameBoard = container.querySelector('.game-board-3d');
    if (gameBoard) {
      await act(async () => {
        fireEvent.click(gameBoard);
        fireEvent.click(gameBoard);
        fireEvent.click(gameBoard);
      });
    }

    // Check if winner is detected
    expect(getByText('Winner: X')).toBeInTheDocument();
  });
}); 