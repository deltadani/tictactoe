// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock requestAnimationFrame
global.requestAnimationFrame = (callback) => setTimeout(callback, 0);
global.cancelAnimationFrame = (id) => clearTimeout(id);

// Mock AudioContext
global.AudioContext = jest.fn().mockImplementation(() => ({
  createBuffer: jest.fn(),
  createBufferSource: jest.fn(),
  createGain: jest.fn(),
  createOscillator: jest.fn(),
  createAnalyser: jest.fn(),
  createMediaElementSource: jest.fn(),
  createMediaStreamSource: jest.fn(),
  createMediaStreamDestination: jest.fn(),
  createScriptProcessor: jest.fn(),
  createStereoPanner: jest.fn(),
  createPanner: jest.fn(),
  createConvolver: jest.fn(),
  createChannelSplitter: jest.fn(),
  createChannelMerger: jest.fn(),
  createDynamicsCompressor: jest.fn(),
  createWaveShaper: jest.fn(),
  createDelay: jest.fn(),
  createBiquadFilter: jest.fn(),
  createIIRFilter: jest.fn(),
  createPeriodicWave: jest.fn(),
  decodeAudioData: jest.fn(),
  resume: jest.fn(),
  suspend: jest.fn(),
  close: jest.fn(),
  state: 'running',
  sampleRate: 44100,
  baseLatency: 0,
  outputLatency: 0,
}));

// Mock webkitAudioContext
(global as any).webkitAudioContext = global.AudioContext;
