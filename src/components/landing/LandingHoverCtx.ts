import { createContext, useContext } from "react";

export interface LandingHoverState {
  hoveredNodeId: string | null;
  connectedNodeIds: Set<string>;
  connectedEdgeIds: Set<string>;
  onHoverEnter: (id: string) => void;
  onHoverLeave: () => void;
}

/**
 * Context that delivers hover state directly to ClyptNode / ClyptEdge components
 * inside LandingGraphDemo without touching the ReactFlow `nodes` / `edges` props.
 *
 * Passing hover state through `nodes` data causes React Flow to remount its node
 * wrapper divs on every update (54+ rapid enter/leave events observed per hover).
 * By keeping the `nodes` prop static and reading hover state here, we break that
 * remount cascade entirely.
 */
export const LandingHoverCtx = createContext<LandingHoverState | null>(null);

export function useLandingHover(): LandingHoverState | null {
  return useContext(LandingHoverCtx);
}
