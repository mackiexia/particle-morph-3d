import { ThemeName, Theme, ShapeType } from './types';

export const SHAPES = Object.values(ShapeType);

export const THEMES: Record<ThemeName, Theme> = {
  [ThemeName.DUNHUANG]: {
    name: ThemeName.DUNHUANG,
    bg: '#2c1e18',
    colors: ['#e45e32', '#2486b9', '#f2cf5b', '#e8b2a7'],
    ui: 'text-orange-100',
  },
  [ThemeName.KLEIN_BLUE]: {
    name: ThemeName.KLEIN_BLUE,
    bg: '#000000',
    colors: ['#002fa7', '#0044cc', '#ffffff', '#002fa7'],
    ui: 'text-blue-100',
  },
  [ThemeName.MORANDI]: {
    name: ThemeName.MORANDI,
    bg: '#3e3e3e',
    colors: ['#aebab3', '#d6c8c4', '#c9c0d3', '#e0d6c8'],
    ui: 'text-gray-200',
  },
  [ThemeName.MONDRIAN]: {
    name: ThemeName.MONDRIAN,
    bg: '#f0f0f0',
    colors: ['#dd0000', '#0000cc', '#ffe600', '#000000'],
    ui: 'text-gray-900',
  },
  [ThemeName.ROCOCO]: {
    name: ThemeName.ROCOCO,
    bg: '#2b2126',
    colors: ['#f4c2c2', '#b0e0e6', '#fffdd0', '#d8bfd8'],
    ui: 'text-pink-100',
  },
  [ThemeName.MATISSE]: {
    name: ThemeName.MATISSE,
    bg: '#1a1a2e',
    colors: ['#d93025', '#1e90ff', '#32cd32', '#ffd700'],
    ui: 'text-white',
  },
  [ThemeName.MEMPHIS]: {
    name: ThemeName.MEMPHIS,
    bg: '#222222',
    colors: ['#ff0099', '#33ccff', '#ffff00', '#66ff66'],
    ui: 'text-white',
  },
};

export const DEFAULT_SYMBOLS: [string, string, string, string] = ['I', 'I', 'I', 'I'];
