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
const mockUseGLTF = jest.fn(() => ({
  scene: {
    clone: jest.fn(() => ({
      traverse: jest.fn(),
    })),
    traverse: jest.fn(),
  },
  nodes: {},
  materials: {},
}));
mockUseGLTF.preload = jest.fn();

jest.mock('@react-three/drei', () => ({
  OrbitControls: () => null,
  PerspectiveCamera: () => null,
  Grid: () => null,
  Line: () => null,
  DragControls: require('react').forwardRef(({ children }, ref) => require('react').createElement('div', { ref }, children)),
  useGLTF: mockUseGLTF,
}));

global.requestAnimationFrame = global.requestAnimationFrame || ((cb) => setTimeout(() => cb(Date.now()), 16));
global.cancelAnimationFrame = global.cancelAnimationFrame || ((id) => clearTimeout(id));
