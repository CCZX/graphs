import { useState, useCallback } from 'react';
import { ToolType, IToolService } from '@/domain/contract';
import { useInject } from '@/common/context';
import './index.less';

export function Toolbar() {
	const toolService = useInject<IToolService>(IToolService);
	const activeTool = toolService.store((s) => s.activeTool);
	const setActiveTool = toolService.store((s) => s.setActiveTool);
	const [zoom, setZoom] = useState(100);

	const handleToolClick = useCallback(
		(tool: ToolType) => {
			setActiveTool(tool);
		},
		[setActiveTool],
	);

	const handleZoomIn = useCallback(() => {
		setZoom((z) => Math.round(Math.min(1000, z * 1.25)));
	}, []);

	const handleZoomOut = useCallback(() => {
		setZoom((z) => Math.round(Math.max(1, z / 1.25)));
	}, []);

	const handleZoomReset = useCallback(() => {
		setZoom(100);
	}, []);

	return (
		<div id='toolbar'>
			{/* Undo / Redo */}
			<div className='tb-group'>
				<button className='tb-btn' title='撤销 (Ctrl+Z)'>
					<svg viewBox='0 0 24 24'>
						<path d='M3 7v6h6' />
						<path d='M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13' />
					</svg>
				</button>
				<button className='tb-btn' title='重做 (Ctrl+Shift+Z)'>
					<svg viewBox='0 0 24 24'>
						<path d='M21 7v6h-6' />
						<path d='M3 17a9 9 0 0 1 9-9 9 9 0 0 1 6 2.3L21 13' />
					</svg>
				</button>
			</div>

			<div className='tb-sep' />

			{/* Tools */}
			<div className='tb-group'>
				{(
					[
						[ToolType.Select, '选择 (V)', 'M4 4l6 16 2-6 6-2z', 'M13 13l7 7'],
						[
							ToolType.Pen,
							'画笔 (P)',
							'M12 20h9',
							'M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z',
						],
						[ToolType.Rect, '矩形 (R)', '', ''],
						[ToolType.Circle, '圆形 (C)', '', ''],
						[ToolType.Line, '直线 (L)', '', ''],
						[ToolType.Arrow, '箭头 (A)', '', ''],
						[ToolType.Text, '文字 (T)', 'M4 7V4h16v3', 'M9 20h6', 'M12 4v16'],
						[
							ToolType.Eraser,
							'橡皮擦 (E)',
							'M20 20H7L3 16c-.8-.8-.8-2 0-2.8L14 2.2c.8-.8 2-.8 2.8 0l4.8 4.8c.8.8.8 2 0 2.8L12 20',
							'M18 12l-6 6',
						],
					] as [ToolType, string, ...string[]][]
				).map(([tool, title, ...paths]) => (
					<button
						key={tool}
						className={`tb-btn${activeTool === tool ? ' active' : ''}`}
						data-tool={tool}
						title={title}
						onClick={() => handleToolClick(tool)}
					>
						<svg viewBox='0 0 24 24'>
							{tool === ToolType.Rect && <rect x='3' y='3' width='18' height='18' rx='2' />}
							{tool === ToolType.Circle && <circle cx='12' cy='12' r='9' />}
							{tool === ToolType.Line && <line x1='5' y1='5' x2='19' y2='19' />}
							{tool === ToolType.Arrow && (
								<>
									<line x1='5' y1='19' x2='19' y2='5' />
									<polyline points='13 5 19 5 19 11' />
								</>
							)}
							{paths.map((d) => (
								<path key={d} d={d} />
							))}
						</svg>
					</button>
				))}
			</div>

			<div className='tb-sep' />

			{/* Zoom */}
			<div className='zoom-wrap'>
				<button className='tb-btn' title='缩小' onClick={handleZoomOut}>
					<svg viewBox='0 0 24 24'>
						<circle cx='11' cy='11' r='7' />
						<line x1='21' y1='21' x2='16.65' y2='16.65' />
						<line x1='8' y1='11' x2='14' y2='11' />
					</svg>
				</button>
				<span className='zoom-label' title='重置缩放' onClick={handleZoomReset}>
					{zoom}%
				</span>
				<button className='tb-btn' title='放大' onClick={handleZoomIn}>
					<svg viewBox='0 0 24 24'>
						<circle cx='11' cy='11' r='7' />
						<line x1='21' y1='21' x2='16.65' y2='16.65' />
						<line x1='11' y1='8' x2='11' y2='14' />
						<line x1='8' y1='11' x2='14' y2='11' />
					</svg>
				</button>
			</div>

			<div className='tb-sep' />

			{/* Clear */}
			<button className='tb-btn' title='清空画布'>
				<svg viewBox='0 0 24 24'>
					<polyline points='3 6 5 6 21 6' />
					<path d='M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6' />
					<line x1='10' y1='11' x2='10' y2='17' />
					<line x1='14' y1='11' x2='14' y2='17' />
				</svg>
			</button>
		</div>
	);
}
