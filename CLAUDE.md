# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
pnpm install          # install dependencies
pnpm dev              # start Vite dev server
pnpm build            # typecheck (tsc) then bundle (vite build)
pnpm preview          # preview production build locally
pnpm test             # placeholder — no test runner configured yet
```

## Naming conventions

- Directories: **lowerCamelCase**
- React components & classes: **UpperCamelCase**
- Other files: **lowerCamelCase**

## Architecture

**Bear Draw** — a 2D vector drawing editor built on React 18 + PixiJS 7 + Zustand + TypeScript.

### Rendering: Canvas → Viewport → Shapes

- `Stage` (`src/canvas/core/Stage.ts`) owns the PixiJS `Application` and a `Viewport` container. Shapes are added to the viewport via `stage.appendShape(container)`.
- `Viewport` (`src/canvas/core/Viewport.ts`) is a PixiJS `Container` that handles **pan** (wheel) and **zoom** (Ctrl+wheel), syncing state to `viewportStore`.
- `BaseShape` (`src/canvas/shapes/BaseShape.ts`) is the abstract base for all drawable shapes. Each shape wraps a PixiJS `Graphics` inside a `Container`. Concrete shapes: `Circle`, `Rectangle`, `Text`.
- Shapes use **pivot-centered positioning**: container pivot and position are both set to the geometric center, so `angle` rotates around the shape center natively.

### State machine for shapes

Each shape has a `StateMachine` (`src/canvas/shapes/state/StateMachine.ts`) that enforces allowed state transitions:

```
Normal → Hover ↔ Selected → Moving | Resizing | Rotating → Selected → Normal
```

Each `AbsState` defines `allowNextStateTypes` listing valid transitions. `StateFactory` creates state instances lazily and caches them per shape in a `Map`.

### Event system: chain of responsibility

`EventManager` (`src/events/EventManager.ts`) listens on `document` for `pointermove` (throttled ~60fps), `pointerdown` (throttled), and `pointerup`.

On each event:
1. Picks the first active `AbsEventMode` whose `enable()` returns true (currently `InteractionMode` is always enabled; `CreatorMode` exists but is disabled).
2. Converts screen coordinates to viewport coordinates via `viewportStore`.
3. Iterates the mode's `Handler` list in order: **Resize → Rotate → Move → Select → Hover**. Each handler's `execute()` returns `true` to continue the chain or `false` to stop (consuming the event).

Cross-handler mutable state lives in `InteractionState` (hovered shape, selected shape). Handlers also read from stores and the global `shapeManager` singleton.

### Shape properties and decorators

- **Properties**: `BaseShape` holds `AbsProperty` instances keyed by `ShapePropertyEnum` (Base, Fill, Stroke). Each property has a `draw()` method called when values change. `BaseProperty.draw()` handles position/rotation/geometry re-rendering.
- **Decorators**: Visual overlays (HoverBorder, SelectedBorder) keyed by `ShapeDecorateTypeEnum`, shown/hidden by state `onActivate`/`onDeactivate` hooks.

### State management (Zustand)

- `viewportStore` — pan offset (x, y) and zoom scale
- `selectionStore` — currently selected shape ID, consumed by the properties panel
- `shapeStore` — empty placeholder file

### Coordinate systems

Screen coordinates (`e.pageX/Y` or `e.clientX/Y`) are converted to viewport coordinates via `transformCanvasCoordinateToViewport()` for hit-testing. Shape-local coordinates use `container.toLocal()` for rotation-aware hit detection.

### Key module paths (with `@/` alias → `src/`)

| Concern | Path |
|---|---|
| PixiJS setup | `@/canvas/core/Stage.ts`, `Viewport.ts` |
| Shapes | `@/canvas/shapes/BaseShape.ts`, `Circle.ts`, `Rectangle.ts`, `Text.ts` |
| State machine | `@/canvas/shapes/state/` |
| Shape registry | `@/canvas/shapes/shapeManager.ts` (singleton) |
| Event dispatch | `@/events/EventManager.ts` |
| Handlers | `@/events/modes/interaction/handlers/` |
| React UI | `@/editorCanvas/index.tsx`, `@/components/propertiesPanel/index.tsx` |
| Stores | `@/store/viewport.ts`, `selection.ts` |
| Types | `@/types/shape.ts`, `geometry.ts` |

### Code style

- Prettier: 100 print width, 2-space indent with tabs, single quotes, trailing commas, no semicolons not enforced.
- Decorator pattern for throttling: `@throttle<T>(ms)` — defined in `src/utils/decorate.ts`, used on `EventManager` pointer handlers to cap event frequency.
