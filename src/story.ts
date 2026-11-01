// Shared state contract for the independent About film. Home uses FilmState.
export type StoryState = { target:number; stage:number; mix:number; from:number; to:number; x:number; slosh:number; mobile:boolean; reduced:boolean; paused:boolean; pointerX:number; pointerY:number; scroll?:number };
