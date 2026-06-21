import { create } from 'zustand';

interface SelectionState {
	selectedShapeId: string | null;
	setSelectedShapeId: (id: string | null) => void;
}

export const selectionStore = create<SelectionState>((set) => ({
	selectedShapeId: null,
	setSelectedShapeId(id) {
		set({ selectedShapeId: id });
	},
}));
