export type BottleAsset = { mode: 'photo' | 'layers' | 'glb'; capon: string; capoff?: string; cap?: string; model?: string };
declare const __MORROW_BOTTLES__: BottleAsset[];

// One-line override if art direction needs to pin the original photographs.
export const BOTTLE_SOURCE: 'auto' | 'photo' = 'auto';
export const bottleAssets = __MORROW_BOTTLES__;

// Registered cut lines in the existing photographs. Hidden nozzle geometry is
// approximated only for this fallback; proper cap-off photographs replace it.
export const bottleRegistration = [
  { capBottom: .309, capTop: .035, capLeft: .19, capRight: .81, nozzle: [.5, .315], baseWidth: .65 },
  { capBottom: .345, capTop: .044, capLeft: .25, capRight: .75, nozzle: [.5, .35], baseWidth: .77 },
  { capBottom: .270, capTop: .035, capLeft: .25, capRight: .75, nozzle: [.5, .278], baseWidth: .64 },
] as const;
