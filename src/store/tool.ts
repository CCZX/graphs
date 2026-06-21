import { create } from 'zustand';

export enum ToolType {
  Select = 'select',
  Pen = 'pen',
  Eraser = 'eraser',
  Rect = 'rect',
  Circle = 'circle',
  Line = 'line',
  Arrow = 'arrow',
  Text = 'text',
}

interface ToolState {
  activeTool: ToolType;
  setActiveTool: (tool: ToolType) => void;
}

export const toolStore = create<ToolState>((set) => ({
  activeTool: ToolType.Select,
  setActiveTool(tool) {
    set({ activeTool: tool });
  },
}));
