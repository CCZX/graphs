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

Code is organized into four top-level areas:

- `canvas/` — rendering (PixiJS stage, viewport, shapes, state machine)
- `domain/` — interaction logic (event dispatch, handler chain, action/undo system)
- `widget/` — React UI components (properties panel, toolbar)
- `store/` — Zustand state (viewport, selection, tool)

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

`EventManager` (`src/domain/events/EventManager.ts`) listens on `document` for `pointermove` (throttled ~60fps), `pointerdown` (throttled), and `pointerup`.

On each event:
1. Picks the first active `AbsEventMode` whose `enable()` returns true. `InteractionMode` activates when the active tool is `ToolType.Select`; `CreatorMode` activates otherwise.
2. Pre-computes an `EventPayload` (viewport coordinates, screen coordinates, zoom scale).
3. Iterates the mode's `Handler` list in order: **Resize → Rotate → Move → Select → Hover**. Each handler's `enable()` returns `true` to run it, and `execute()` returns `true` to continue the chain or `false` to stop (consuming the event).

Cross-handler mutable state lives in `InteractionState` (hovered shape, selected shape). Handlers also read from stores and the global `shapeManager` singleton.

The abstract `Handler` base class (`src/domain/events/Handler.ts`) defines the handler interface: `type`, `enable(state)`, and `execute(e, state, payload)`.

### Action system (undo/redo)

`ActionManager` (`src/domain/action/ActionManager.ts`) executes actions by matching incoming `AbsAction` instances to registered `AbsActionExecute` handlers by `ActionTypeEnum`. Each action carries a `data` payload; the corresponding execute handler applies it (e.g., `CreateShapeActionExecute` adds a new shape to the stage). `ActionLog` records executed actions for undo/redo support.

### Shape properties and decorators

- **Properties**: `BaseShape` holds `AbsProperty` instances keyed by `ShapePropertyEnum` (Base, Fill, Stroke). Each property has a `draw()` method called when values change. `BaseProperty.draw()` handles position/rotation/geometry re-rendering. Located in `src/canvas/shapes/property/`.
- **Decorators**: Visual overlays (HoverBorder, SelectedBorder) keyed by `ShapeDecorateTypeEnum`, shown/hidden by state `onActivate`/`onDeactivate` hooks. Located in `src/canvas/shapes/decorate/`.

### State management (Zustand)

- `viewportStore` — pan offset (x, y) and zoom scale
- `selectionStore` — currently selected shape ID, consumed by the properties panel
- `toolStore` — currently active tool (`ToolType` enum: Select, Pen, Eraser, Rect, Circle, Line, Arrow, Text), controls which event mode is active

### Coordinate systems

Screen coordinates (`e.pageX/Y` or `e.clientX/Y`) are converted to viewport coordinates via `transformCanvasCoordinateToViewport()` for hit-testing. Shape-local coordinates use `container.toLocal()` for rotation-aware hit detection.

### Key module paths (with `@/` alias → `src/`)

| Concern | Path |
|---|---|
| PixiJS setup | `@/canvas/core/Stage.ts`, `Viewport.ts` |
| Shapes | `@/canvas/shapes/BaseShape.ts`, `Circle.ts`, `Rectangle.ts`, `Text.ts` |
| Shape properties | `@/canvas/shapes/property/AbsProperty.ts`, `BaseProperty.ts`, `FillProperty.ts`, `StrokeProperty.ts` |
| Shape decorators | `@/canvas/shapes/decorate/AbsDecorate.ts`, `HoverBorder.ts`, `SelectedBorder.ts` |
| State machine | `@/canvas/shapes/state/` |
| Shape registry | `@/canvas/shapes/shapeManager.ts` (singleton) |
| Shape factory | `@/canvas/shapes/shapeCreator.ts` |
| React canvas UI | `@/canvas/components/editorCanvas/index.tsx` |
| Event dispatch | `@/domain/events/EventManager.ts` |
| Event types | `@/domain/events/types.ts` (enums, `InteractionState`, `EventPayload`) |
| Handler base | `@/domain/events/Handler.ts` |
| Handlers | `@/domain/events/modes/interaction/handlers/`, `modes/creator/handlers/` |
| Action system | `@/domain/action/ActionManager.ts`, `AbsAction.ts`, `ActionLog.ts` |
| React widgets | `@/widget/property/index.tsx`, `@/widget/toolbar/index.tsx` |
| Stores | `@/store/viewport.ts`, `selection.ts`, `tool.ts` |
| Types | `@/types/shape.ts`, `geometry.d.ts` |
| Utils | `@/utils/decorate.ts`, `geometry.ts`, `viewport.ts`, `log.ts` |

### Code style

- Prettier: 100 print width, 2-space indent with tabs, single quotes, trailing commas, no semicolons not enforced.
- Decorator pattern for throttling: `@throttle<T>(ms)` — defined in `src/utils/decorate.ts`, used on `EventManager` pointer handlers to cap event frequency.
