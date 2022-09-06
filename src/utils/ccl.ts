/**
 * @file Connected-component labeling
 */

import ImageData from '@canvas/image-data';
import { union, makeSet, Node } from './union-find';

import { i_to_xy, xy_to_i } from './';

const INDICES_PER_PIXEL = 4; // rgba

/**
 * Hoshen–Kopelman connected-component labeling algorithm. Loosely based on {@link https://en.wikipedia.org/wiki/Connected-component_labeling Connected-component labeling}.
 * @param img 
 */
export default function hk(img: ImageData) {
    console.time('ccl');
    const forest: Array<Node> = new Array(img.width * img.height);

    // first pass - connect the components
    for (let i = 0; i < img.data.length; i += INDICES_PER_PIXEL) {
        const r = img.data[i + 0];
        const g = img.data[i + 1];
        const b = img.data[i + 2];

        const [x, y] = i_to_xy(i, img.width);

        // generate an equivalence object
        const index = xy_to_i([x, y], img.width, 1);
        const tree = makeSet(index, x, y, r, g, b);
        forest[index] = tree;

        // avoid going back to last pixel on preivous row
        const neighbors = [];
        if (x > 0) neighbors.push(xy_to_i([x - 1, y], img.width, 1));
        if (y > 0) neighbors.push(xy_to_i([x, y - 1], img.width, 1));

        // check if neighbors are connected
        for (const neighbor_index of neighbors) {
            const neighbor = forest[neighbor_index];
            if (neighbor.color === tree.color) union(tree, neighbor);
        }
    }

    // second pass - find roots
    const roots: { [index: number]: Node } = {};
    forest.forEach(vertex => {
        const { parent, index } = vertex;
        if (parent === vertex) return roots[index] = vertex; // is root

        // find the highest parent
        let p = parent;
        while (p.parent !== p) {
            p = p.parent;
        }

        if (!p.children) p.children = [];
        p.children.push(vertex);

        // keep track of bounding box
        p.n = Math.min(vertex.y, p.n);
        p.s = Math.max(vertex.y, p.s);
        p.e = Math.max(vertex.x, p.e);
        p.w = Math.min(vertex.x, p.w);
    })

    console.timeEnd('ccl');

    return Object.values(roots);
}