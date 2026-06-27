import { useState, useEffect, useCallback, useRef } from 'react';
import { selectionStore } from '@/store/selection';
import { ShapePropertyEnum } from '@/shapes/contract';
import type { FillPropertyValue, StrokePropertyValue } from '@/shapes/contract';
import { STROKE_COLOR_PRESETS, FILL_COLOR_PRESETS } from './const';
import type { PresetColor } from './const';
import './index.less';
import { useInject } from '@/common/context';
import { IShapeManager } from '@/domain/contract';

function numberToHex(num: number): string {
	return '#' + num.toString(16).padStart(6, '0');
}

const STROKE_WIDTH_OPTIONS = [
	{ label: '无 (0)', value: 0 },
	{ label: '小 (1)', value: 1 },
	{ label: '中 (3)', value: 3 },
	{ label: '大 (5)', value: 5 },
];

const STROKE_RADIUS_MAP: Record<number, number> = { 0: 1, 1: 2, 3: 5, 5: 7 };

export function Property() {
	const shapeManager = useInject<IShapeManager>(IShapeManager);
	const selectedShapeId = selectionStore((s) => s.selectedShapeId);

	const [strokeColor, setStrokeColor] = useState('#1e1e1e');
	const [strokeWidth, setStrokeWidth] = useState(1);
	const [fillColor, setFillColor] = useState('#ffffff');
	const [fillAlpha, setFillAlpha] = useState(100);
	const [isTransparent, setIsTransparent] = useState(false);
	const [visible, setVisible] = useState(false);
	const visibleRef = useRef(false);

	const syncFromShape = useCallback(() => {
		const id = selectionStore.getState().selectedShapeId;
		if (!id) {
			return;
		}
		const shape = shapeManager.getShapeById(id);
		if (!shape) {
			return;
		}

		const stroke = shape.getProperty<any>(ShapePropertyEnum.Stroke)?.get() as StrokePropertyValue;
		if (stroke) {
			setStrokeColor(numberToHex(stroke.color));
			setStrokeWidth(stroke.width);
		}

		const fill = shape.getProperty<any>(ShapePropertyEnum.Fill)?.get() as FillPropertyValue;
		if (fill) {
			if (fill.alpha === 0) {
				setIsTransparent(true);
				setFillColor('#ffffff');
				setFillAlpha(0);
			} else {
				setIsTransparent(false);
				setFillColor(numberToHex(fill.color));
				setFillAlpha(Math.round(fill.alpha * 100));
			}
		}
	}, []);

	useEffect(() => {
		if (selectedShapeId) {
			syncFromShape();
			setVisible(true);
			visibleRef.current = true;
		} else {
			setVisible(false);
			visibleRef.current = false;
		}
	}, [selectedShapeId, syncFromShape]);

	useEffect(() => {
		const onPointerUp = () => {
			if (!visibleRef.current) {
				return;
			}
			syncFromShape();
		};
		document.addEventListener('pointerup', onPointerUp);
		return () => document.removeEventListener('pointerup', onPointerUp);
	}, [syncFromShape]);

	const shape = selectedShapeId ? shapeManager.getShapeById(selectedShapeId) : null;

	const handleStrokeColor = (preset: PresetColor) => {
		setStrokeColor(preset.hex);
		shape?.updateProperty(ShapePropertyEnum.Stroke, { color: preset.number });
	};

	const handleStrokeWidth = (w: number) => {
		setStrokeWidth(w);
		shape?.updateProperty(ShapePropertyEnum.Stroke, { width: w });
	};

	const handleFillColor = (preset: PresetColor & { transparent?: boolean }) => {
		if (preset.transparent) {
			setIsTransparent(true);
			setFillAlpha(0);
			shape?.updateProperty(ShapePropertyEnum.Fill, { alpha: 0 });
		} else {
			setIsTransparent(false);
			setFillColor(preset.hex);
			shape?.updateProperty(ShapePropertyEnum.Fill, {
				color: preset.number,
				alpha: fillAlpha / 100,
			});
		}
	};

	const handleFillAlpha = (alpha: number) => {
		setFillAlpha(alpha);
		setIsTransparent(alpha === 0);
		shape?.updateProperty(ShapePropertyEnum.Fill, { alpha: alpha / 100 });
	};

	const previewR = STROKE_RADIUS_MAP[strokeWidth] ?? 2;

	return (
		<div className={`ctx-panel ${visible ? 'ctx-panel--visible' : ''}`}>
			<div className='ctx-inner'>
				{/* 描边颜色 */}
				<div className='ctx-section'>
					<span className='ctx-label'>描边</span>
					<div className='ctx-colors'>
						{STROKE_COLOR_PRESETS.map((preset) => (
							<button
								key={preset.hex}
								className={`ctx-dot${
									strokeColor === preset.hex && !isTransparent ? ' ctx-dot--active' : ''
								}`}
								data-color={preset.hex}
								style={{ backgroundColor: preset.hex }}
								onClick={() => handleStrokeColor(preset)}
							/>
						))}
					</div>
				</div>

				<div className='ctx-sep' />

				{/* 描边宽度 */}
				<div className='ctx-section'>
					<span className='ctx-label'>描边宽度</span>
					<div className='ctx-stroke'>
						<svg width='22' height='22' viewBox='0 0 22 22'>
							<circle
								cx='11'
								cy='11'
								r={previewR}
								fill={strokeWidth === 0 ? '#999' : strokeColor}
							/>
						</svg>
						<select
							className='ctx-select'
							value={strokeWidth}
							onChange={(e) => handleStrokeWidth(parseInt(e.target.value))}
						>
							{STROKE_WIDTH_OPTIONS.map((opt) => (
								<option key={opt.value} value={opt.value}>
									{opt.label}
								</option>
							))}
						</select>
					</div>
				</div>

				<div className='ctx-sep' />

				{/* 背景色 */}
				<div className='ctx-section'>
					<span className='ctx-label'>背景色</span>
					<div className='ctx-colors'>
						{FILL_COLOR_PRESETS.map((preset) => {
							const isActive = preset.transparent
								? isTransparent
								: fillColor === preset.hex && !isTransparent;
							return (
								<button
									key={preset.hex}
									className={`ctx-dot${isActive ? ' ctx-dot--active' : ''}${
										preset.transparent ? ' ctx-dot--transparent' : ''
									}`}
									data-color={preset.hex}
									style={preset.transparent ? undefined : { backgroundColor: preset.hex }}
									onClick={() => handleFillColor(preset)}
								/>
							);
						})}
					</div>
				</div>

				<div className='ctx-sep' />

				{/* 背景透明度 */}
				<div className='ctx-section'>
					<span className='ctx-label'>背景透明度</span>
					<div className='ctx-stroke'>
						<input
							type='range'
							min={0}
							max={100}
							value={fillAlpha}
							onChange={(e) => handleFillAlpha(parseInt(e.target.value))}
						/>
						<span className='ctx-alpha-value'>{fillAlpha}%</span>
					</div>
				</div>
			</div>
		</div>
	);
}
