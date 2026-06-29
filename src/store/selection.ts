import { create } from 'zustand';

interface SelectionState {
	selectedShapeIds: string[];
	setSelectedShapeIds: (ids: string[]) => void;
	addSelectedShapeId: (id: string) => void;
	removeSelectedShapeId: (id: string) => void;
	clearSelectedShapeIds: () => void;
}

export const selectionStore = create<SelectionState>((set) => ({
	selectedShapeIds: [],
	setSelectedShapeIds(ids) {
		set({ selectedShapeIds: ids });
	},
	addSelectedShapeId(id) {
		set((s) => ({
			selectedShapeIds: s.selectedShapeIds.includes(id)
				? s.selectedShapeIds
				: [...s.selectedShapeIds, id],
		}));
	},
	removeSelectedShapeId(id) {
		set((s) => ({
			selectedShapeIds: s.selectedShapeIds.filter((i) => i !== id),
		}));
	},
	clearSelectedShapeIds() {
		set({ selectedShapeIds: [] });
	},
}));
