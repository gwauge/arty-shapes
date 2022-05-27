/**
 * @file Union-find data structure. Implementation base on to {@link https://en.wikipedia.org/wiki/Disjoint-set_data_structure Wikipedia >> Disjoint-set data structure}.
 */

export type BoundingBox = {
    n: number;
    s: number;
    e: number;
    w: number;
}

export type Node = {
    rank: number;
    index: number;
    x: number;
    y: number;
    color: string;
    parent: Node;
    children?: Array<Node>;
    edgePoints?: Array<[number, number]>;
    isEdge: boolean;
} & BoundingBox;

export function makeSet(index: number, x: number, y: number, color: string) {
    const singleton = {
        rank: 0,
        index,
        x,
        y,
        color,
        n: y,
        s: y,
        e: x,
        w: x,
        isEdge: false,
    };

    // @ts-ignore
    singleton.parent = singleton;

    return singleton as Node;
};

export function find(node: Node) {
    while (node.parent !== node) {
        node.parent = node.parent.parent;
        node = node.parent;
    }

    return node;
};

export function union(node1: Node, node2: Node) {
    let x = find(node1);
    let y = find(node2);

    if (x === y) return; // already in the same set

    // ensure that x has rank at least as large as that of y
    if (x.rank < y.rank) {
        const temp = x;
        x = y;
        y = temp;
    }

    y.parent = x;
    if (x.rank === y.rank) {
        x.rank++;
    }
};