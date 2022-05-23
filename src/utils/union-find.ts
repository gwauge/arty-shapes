/**
 * @file Union-find data structure. Implementation credits to {@link https://github.com/manubb/union-find | Manuel Baclet}.
 */

export type Node = {
    rank: number;
    index: string;
    x: number;
    y: number;
    color: string;
    parent: Node;
    children?: Node[];
}

export function makeSet(index: string, x: number, y: number, color: string) {
    const singleton = {
        rank: 0,
        index,
        x,
        y,
        color
    };

    // @ts-ignore
    singleton.parent = singleton;

    return singleton as Node;
};

export function find(node: Node) {
    if (node.parent !== node) {
        node.parent = find(node.parent);
    }

    return node.parent;
};

export function union(node1: Node, node2: Node) {
    const root1 = find(node1);
    const root2 = find(node2);
    if (root1 !== root2) {
        if (root1.rank < root2.rank) {
            root1.parent = root2;
        } else {
            root2.parent = root1;
            if (root1.rank === root2.rank) root1.rank += 1;
        }
    }
};