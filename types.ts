export enum ShapeType {
  MOBIUS = '莫比乌斯环',
  STAR = '五角星',
  KLEIN = '克莱因瓶',
  INCENSE = '中式香炉',
  CROWN = '中式凤冠',
  DNA = 'DNA双螺旋',
  RELIEF = '浮雕',
}

export enum ThemeName {
  DUNHUANG = '敦煌',
  KLEIN_BLUE = '克莱因蓝',
  MORANDI = '莫兰迪',
  MONDRIAN = '蒙德里安',
  ROCOCO = '洛可可',
  MATISSE = '马蒂斯',
  MEMPHIS = '孟菲斯',
}

export interface Theme {
  name: ThemeName;
  bg: string;
  colors: string[];
  ui: string; // Tailwind class for UI text color
}

export interface AppState {
  shape: ShapeType;
  density: number; // 500 - 2000
  symbols: [string, string, string, string];
  theme: ThemeName;
  customBg: string;
  customColors: string[];
  isCustomTheme: boolean;
}