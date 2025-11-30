declare module '@mapbox/polyline' {
  export function decode(encoded: string, precision?: number): number[][];
  export function encode(coordinates: number[][], precision?: number): string;
  
  interface Polyline {
    decode(encoded: string, precision?: number): number[][];
    encode(coordinates: number[][], precision?: number): string;
  }
  
  const polyline: Polyline;
  export default polyline;
}

