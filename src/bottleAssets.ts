export type BottleAsset = { mode: 'photo' | 'layers' | 'glb'; capon: string; capoff?: string; cap?: string; model?: string };
declare const __MORROW_BOTTLES__: BottleAsset[];

// One-line override if art direction needs to pin the original photographs.
export const BOTTLE_SOURCE: 'auto' | 'photo' = 'auto';
export const bottleAssets = __MORROW_BOTTLES__;

// Registered wood cut lines; layered photographs expose their own machined
// atomisers higher inside the cap envelope. Originals retain fallback coordinates.
export const bottleRegistration = [
  { capBottom: .309, capTop: .035, capLeft: .19, capRight: .81, nozzle: [.5, bottleAssets[0].mode==='layers'?.165:.315], baseWidth: .65 },
  { capBottom: .345, capTop: .044, capLeft: .25, capRight: .75, nozzle: [.5, bottleAssets[1].mode==='layers'?.165:.35], baseWidth: .77 },
  { capBottom: .270, capTop: .035, capLeft: .25, capRight: .75, nozzle: [.5, bottleAssets[2].mode==='layers'?.125:.278], baseWidth: .64 },
] as const;
