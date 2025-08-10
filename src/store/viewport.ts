import { create } from 'zustand';

interface ViewportState {
  x: number;
  y: number;
  scale: number;

  setScale: (scale: number) => void;
  setX: (x: number) => void;
  setY: (y: number) => void;
}

export const viewportStore = create<ViewportState>((set) => ({
  x: 0,
  y: 0,
  scale: 1,

  setX(x) {
    set(() => ({ x }));
  },
  setY(y) {
    set(() => ({ y }));
  },
  setScale(scale) {
    set(() => ({ scale }));
  },
}));
