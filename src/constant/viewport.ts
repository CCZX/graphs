import { last } from 'lodash';

export const ZOOM_SCALE_LIST = [0.1, 0.3, 0.5, 1.0, 2.0, 3.0, 4.0];

export const MIN_ZOOM_SCALE = ZOOM_SCALE_LIST[0];
export const MAX_ZOOM_SCALE = last(ZOOM_SCALE_LIST)!;
