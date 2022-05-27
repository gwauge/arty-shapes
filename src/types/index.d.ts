declare module 'monotone-chain-convex-hull' {
    export default function monotoneChainConvexHull(points: Array<[number, number]>): Array<[number, number]>
};

declare module 'simplify-js' {
    export default function simplify(points: Array<{ x: number, y: number }>, tolerance: number = 1, highQuality: boolean = false): Array<{ x: number, y: number }>
};
