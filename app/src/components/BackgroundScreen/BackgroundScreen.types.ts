export type LinearGradientBackgroundScreenType = {
  colors: [string, string, ...string[]];
  locations: [number, number, ...number[]];
  start: { x: number; y: number };
  end: { x: number; y: number };
};
