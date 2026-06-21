export const HOVER_BORDER = 0xbacbfd;

export interface PresetColor {
	name: string;
	hex: string;
	number: number;
}

export const STROKE_COLOR_PRESETS: PresetColor[] = [
	{ name: '黑色', hex: '#1e1e1e', number: 0x1e1e1e },
	{ name: '红色', hex: '#e03131', number: 0xe03131 },
	{ name: '橙色', hex: '#f08c00', number: 0xf08c00 },
	{ name: '绿色', hex: '#2f9e44', number: 0x2f9e44 },
	{ name: '蓝色', hex: '#1971c2', number: 0x1971c2 },
	{ name: '紫色', hex: '#9c36b5', number: 0x9c36b5 },
	{ name: '白色', hex: '#ffffff', number: 0xffffff },
];

export const FILL_COLOR_PRESETS: (PresetColor & { transparent?: boolean })[] = [
	{ name: '透明', hex: 'transparent', number: 0xffffff, transparent: true },
	...STROKE_COLOR_PRESETS,
];
