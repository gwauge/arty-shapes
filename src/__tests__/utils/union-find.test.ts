import { makeSet, find, union, Node } from '../../utils/union-find';

let node0: Node
let node1: Node
let node2: Node

beforeEach(() => {
    node0 = makeSet('0-0', 0, 0, '#000000');
    node1 = makeSet('1-1', 1, 1, '#111111');
    node2 = makeSet('2-2', 2, 2, '#222222');
})

test("should make set", () => {
    expect(node0.parent).toBe(node0);
    expect(node0.rank).toBe(0);
    expect(node0.index).toBe('0-0');
})

test("should union", () => {
    union(node0, node1);
    expect(node1.parent).toBe(node0);

    // union with self does nothing
    union(node1, node1);
    expect(node1.parent).toBe(node0);

    union(node2, node1);
    expect(node2.parent).toBe(node0);
})

test("should find", () => {
    expect(find(node1)).toBe(node1);

    union(node0, node1);

    expect(find(node1)).toBe(node0);
})