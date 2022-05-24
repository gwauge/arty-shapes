/**
 * @file Connected-component labeling
 */

import ImageData from '@canvas/image-data';
import { union, makeSet, Node } from './union-find';

import { i_to_xy, rgbToHex } from './';

function get_neighbors(img: ImageData, i: number, connectivity: 4 | 8 = 8): [number, number][] {
    const [x, y] = i_to_xy(i, img.width);
    const neighbors = [];

    if (connectivity === 8) neighbors.push([x - 1, y - 1] as [number, number]);
    neighbors.push([x, y - 1] as [number, number]);
    if (connectivity === 8) neighbors.push([x + 1, y - 1] as [number, number]);
    neighbors.push([x - 1, y] as [number, number]);

    return neighbors;
}

function indexString([x, y]: [number, number]) {
    return `${x}-${y}`;
}

/**
 * Hoshen–Kopelman connected-component labeling algorithm. Based on {@link https://en.wikipedia.org/wiki/Connected-component_labeling Connected-component labeling}.
 * @param img 
 */
export function hk(img: ImageData) {
    // const labels = new Uint8ClampedArray(img.data.length / 4);
    const forest: { [key: string]: Node } = {};
    const background = { r: 0, g: 0, b: 0, a: 255 };

    // first pass
    for (let i = 0; i < img.data.length; i += 4) {
        const r = img.data[i + 0];
        const g = img.data[i + 1];
        const b = img.data[i + 2];
        // const a = img.data[i + 3];

        // skip if background
        if (r === background.r
            && g === background.g
            && b === background.b
        ) continue;

        const [x, y] = i_to_xy(i, img.width);

        const index = indexString([x, y]);
        const tree = makeSet(index, x, y, rgbToHex(r, g, b));
        forest[index] = tree;

        const neighbors = get_neighbors(img, i, 4).map(indexString);
        for (const neighbor_index of neighbors) {
            const neighbor = forest[neighbor_index];
            if (neighbor?.color === tree.color) union(tree, neighbor);
        }
    }


    return forest;
}