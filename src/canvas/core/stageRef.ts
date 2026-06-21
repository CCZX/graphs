import { Stage } from './Stage';

let _stage: Stage | null = null;

export const stageRef = {
	get current(): Stage | null {
		return _stage;
	},
	set current(s: Stage | null) {
		_stage = s;
	},
};
