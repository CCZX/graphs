import { useState, useEffect, useCallback } from 'react';
import { selectionStore } from '@/store/selection';
import { shapeManager } from '@/canvas/shapes/shapeManager';
import { BaseShape } from '@/canvas/shapes/BaseShape';
import { ShapePropertyEnum } from '@/types/shape';
import type { BasePropertyValue, FillPropertyValue, StrokePropertyValue } from '@/types/shape';
import './index.less';

function numberToHex(num: number): string {
  return '#' + num.toString(16).padStart(6, '0');
}

function hexToNumber(hex: string): number {
  return parseInt(hex.replace('#', ''), 16);
}

export function PropertiesPanel() {
  const selectedShapeId = selectionStore((s) => s.selectedShapeId);

  const [fillColor, setFillColor] = useState('#000000');
  const [fillAlpha, setFillAlpha] = useState(1);
  const [width, setWidth] = useState(0);
  const [height, setHeight] = useState(0);
  const [strokeColor, setStrokeColor] = useState('#000000');
  const [strokeWidth, setStrokeWidth] = useState(0);
  const [rotation, setRotation] = useState(0);

  const syncFromShape = useCallback((shape: BaseShape) => {
    const base = shape.getProperty<any>(ShapePropertyEnum.Base)?.get() as BasePropertyValue;
    const fill = shape.getProperty<any>(ShapePropertyEnum.Fill)?.get() as FillPropertyValue;
    const stroke = shape.getProperty<any>(ShapePropertyEnum.Stroke)?.get() as StrokePropertyValue;

    if (base) {
      setWidth(base.width);
      setHeight(base.height);
      setRotation(base.rotation || 0);
    }
    if (fill) {
      setFillColor(numberToHex(fill.color));
      setFillAlpha(fill.alpha);
    }
    if (stroke) {
      setStrokeColor(numberToHex(stroke.color));
      setStrokeWidth(stroke.width);
    }
  }, []);

  useEffect(() => {
    if (!selectedShapeId) return;
    const shape = shapeManager.getShapeById(selectedShapeId);
    if (shape) syncFromShape(shape);
  }, [selectedShapeId, syncFromShape]);

  // 在 pointerup 后同步属性（覆盖 move / resize 造成的变更）
  useEffect(() => {
    const onPointerUp = () => {
      const id = selectionStore.getState().selectedShapeId;
      if (!id) return;
      const shape = shapeManager.getShapeById(id);
      if (shape) syncFromShape(shape);
    };
    document.addEventListener('pointerup', onPointerUp);
    return () => document.removeEventListener('pointerup', onPointerUp);
  }, [syncFromShape]);

  if (!selectedShapeId) return null;

  const shape = shapeManager.getShapeById(selectedShapeId);
  if (!shape) return null;

  const handleFillColorChange = (hex: string) => {
    setFillColor(hex);
    shape.updateProperty(ShapePropertyEnum.Fill, {
      color: hexToNumber(hex),
    });
  };

  const handleFillAlphaChange = (alpha: number) => {
    setFillAlpha(alpha);
    shape.updateProperty(ShapePropertyEnum.Fill, { alpha });
  };

  const handleWidthChange = (w: number) => {
    setWidth(w);
    shape.updateProperty(ShapePropertyEnum.Base, { width: w });
  };

  const handleHeightChange = (h: number) => {
    setHeight(h);
    shape.updateProperty(ShapePropertyEnum.Base, { height: h });
  };

  const handleStrokeColorChange = (hex: string) => {
    setStrokeColor(hex);
    shape.updateProperty(ShapePropertyEnum.Stroke, {
      color: hexToNumber(hex),
    });
  };

  const handleStrokeWidthChange = (w: number) => {
    setStrokeWidth(w);
    shape.updateProperty(ShapePropertyEnum.Stroke, { width: w });
  };

  const handleRotationChange = (r: number) => {
    const normalized = ((r % 360) + 360) % 360;
    setRotation(normalized);
    shape.updateProperty(ShapePropertyEnum.Base, { rotation: normalized });
  };

  const strokeWidthPresets = [
    { label: '无', value: 0 },
    { label: '小', value: 1 },
    { label: '中', value: 3 },
    { label: '大', value: 5 },
  ];

  return (
    <div className="properties-panel">
      <h3 className="properties-panel__title">属性</h3>

      <div className="properties-panel__section">
        <label className="properties-panel__label">填充颜色</label>
        <div className="properties-panel__row">
          <input
            type="color"
            className="properties-panel__color-input"
            value={fillColor}
            onChange={(e) => handleFillColorChange(e.target.value)}
          />
          <span className="properties-panel__hex">{fillColor}</span>
        </div>
        <label className="properties-panel__label">透明度</label>
        <input
          type="range"
          className="properties-panel__range"
          min={0}
          max={1}
          step={0.01}
          value={fillAlpha}
          onChange={(e) => handleFillAlphaChange(parseFloat(e.target.value))}
        />
        <span className="properties-panel__value">{fillAlpha.toFixed(2)}</span>
      </div>

      <div className="properties-panel__section">
        <label className="properties-panel__label">尺寸</label>
        <div className="properties-panel__row">
          <div className="properties-panel__dimension">
            <span>W</span>
            <input
              type="number"
              className="properties-panel__number-input"
              min={1}
              value={width}
              onChange={(e) => handleWidthChange(parseInt(e.target.value) || 1)}
            />
          </div>
          <div className="properties-panel__dimension">
            <span>H</span>
            <input
              type="number"
              className="properties-panel__number-input"
              min={1}
              value={height}
              onChange={(e) => handleHeightChange(parseInt(e.target.value) || 1)}
            />
          </div>
        </div>
      </div>

      <div className="properties-panel__section">
        <label className="properties-panel__label">旋转</label>
        <div className="properties-panel__row">
          <input
            type="number"
            className="properties-panel__number-input"
            value={Math.round(rotation)}
            onChange={(e) => handleRotationChange(parseInt(e.target.value) || 0)}
          />
          <span className="properties-panel__value">°</span>
        </div>
      </div>

      <div className="properties-panel__section">
        <label className="properties-panel__label">边框</label>
        <div className="properties-panel__row">
          <input
            type="color"
            className="properties-panel__color-input"
            value={strokeColor}
            onChange={(e) => handleStrokeColorChange(e.target.value)}
          />
          <span className="properties-panel__hex">{strokeColor}</span>
        </div>
        <label className="properties-panel__label">边框宽度</label>
        <select
          className="properties-panel__select"
          value={strokeWidth}
          onChange={(e) => handleStrokeWidthChange(parseInt(e.target.value))}
        >
          {strokeWidthPresets.map((p) => (
            <option key={p.value} value={p.value}>
              {p.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
