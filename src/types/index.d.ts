type Vector = [number, number];

declare module 'monotone-chain-convex-hull' {
    export default function monotoneChainConvexHull(points: Array<Vector>): Array<Vector>
};

declare module 'simplify-js' {
    export default function simplify(points: Array<{ x: number, y: number }>, tolerance: number = 1, highQuality: boolean = false): Array<{ x: number, y: number }>
};

declare module 'pca-js' {
    export function getEigenVectors(initialData: Array<Vector>): Array<{ eigenvalue: number, vector: Vector }>;
};

declare module 'oklab' {
    type sRGB = {r: number, g: number, b: number};
    type Lab = {L: number, a: number, b: number};
    
    export function linearSrgbToOklab(linearSrgb: sRGB): Lab;
    export function oklabToLinearSrgb(oklab: Lab): sRGB;
}