require('@testing-library/jest-dom');

// Mock React Three Fiber for tests
jest.mock('@react-three/fiber', () => ({
  Canvas: ({ children }) => {
    const React = require('react');
    return React.createElement('div', { 'data-testid': 'r3f-canvas' }, children);
  },
  useFrame: jest.fn(),
  useThree: jest.fn(() => ({
    camera: {},
    gl: {},
    scene: {},
    size: { width: 1024, height: 768 },
  })),
}));

// Mock drei components
jest.mock('@react-three/drei', () => ({
  OrbitControls: () => null,
  PerspectiveCamera: () => null,
  Grid: () => null,
  Line: () => null,
  DragControls: require('react').forwardRef(({ children }, ref) => require('react').createElement('div', { ref }, children)),
}));

global.requestAnimationFrame = global.requestAnimationFrame || ((cb) => setTimeout(() => cb(Date.now()), 16));
global.cancelAnimationFrame = global.cancelAnimationFrame || ((id) => clearTimeout(id));
