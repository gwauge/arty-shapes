/**
 * @file Connected-component labeling
 */

import ImageData from '@canvas/image-data';
import { union, makeSet, Node } from './union-find';

import { i_to_xy, rgbToHex, xy_to_i } from './';

const INDICES_PER_PIXEL = 4; // rgba

/**
 * Hoshen–Kopelman connected-component labeling algorithm. Loosely based on {@link https://en.wikipedia.org/wiki/Connected-component_labeling Connected-component labeling}.
 * @param img 
 */
export default function hk(img: ImageData) {
    const forest: Array<Node> = new Array(img.width * img.height);

    // first pass - connect the components
    for (let i = 0; i < img.data.length; i += INDICES_PER_PIXEL) {
        const r = img.data[i + 0];
        const g = img.data[i + 1];
        const b = img.data[i + 2];

        const [x, y] = i_to_xy(i, img.width);

        // generate an equivalence object
        const index = xy_to_i([x, y], img.width, 1);
        const tree = makeSet(index, x, y, rgbToHex(r, g, b));
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

        if (!parent.children) parent.children = [];
        parent.children.push(vertex);
        if (!parent.edgePoints) parent.edgePoints = [];

        // check for edge pixels (i.e. pixel whose neighbor is of another color)

        function set_edge(node: Node) {
            if (!node.isEdge) {
                node.parent.edgePoints?.push([node.x, node.y]);
                node.isEdge = true;
            }
        }

        // check left
        if (vertex.x > 0 && vertex.x < img.width - 1) {
            const left = forest[index - 1];
            if (left.color !== vertex.color) {
                set_edge(vertex); // self is edge

                // left neighbor is edge point
                if (!left.parent.edgePoints) left.parent.edgePoints = [];
                set_edge(left);
            }
        } else set_edge(vertex); // pixels at the edge of the image are always "edge_pixels"

        // check top
        if (vertex.y > 0 && vertex.y < img.height - 1) {
            const top = forest[index - img.width];
            if (top.color !== vertex.color) {
                set_edge(vertex); // self is edge

                if (!top.parent.edgePoints) top.parent.edgePoints = [];
                set_edge(top);
            }
        } else set_edge(vertex);

        // keep track of bounding box
        parent.n = Math.min(vertex.y, parent.n);
        parent.s = Math.max(vertex.y, parent.s);
        parent.e = Math.max(vertex.x, parent.e);
        parent.w = Math.min(vertex.x, parent.w);
    })

    return Object.values(roots);
}