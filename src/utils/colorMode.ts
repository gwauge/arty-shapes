import { Node } from "./union-find";
import { xy_to_i, rgbToHex } from ".";
import {linearSrgbToOklab, oklabToLinearSrgb} from 'oklab';
import { dbscan } from "./colorClustering";

/** Use the average color of all pixels for each segment. */
export function average_color_oklab(segments: Node[], original_img: ImageData) {
    segments.forEach((root, i) => {
        if (!root.children) return;

        let L = 0;
        let a = 0;
        let b = 0;

        root.children.forEach(child => {
            const { x, y } = child;
            const index = xy_to_i([x, y], original_img.width);
            const lab = linearSrgbToOklab({
                r: original_img.data[index + 0] / 255,
                g: original_img.data[index + 1] / 255,
                b: original_img.data[index + 2] / 255,
            })

            L += lab.L;
            a += lab.a;
            b += lab.b;
        });

        const sRGB = oklabToLinearSrgb({
            L: L / root.children.length, 
            a: a / root.children.length, 
            b: b / root.children.length
        })
        if (i === 0) console.log(sRGB);
        root.color = rgbToHex(Math.floor(sRGB.r * 255), Math.floor(sRGB.g * 255), Math.floor(sRGB.b * 255));
    })
}

/** Use the average color of all pixels for each segment. */
export function average_color(segments: Node[], original_img: ImageData) {
    segments.forEach((root, i) => {
        if (!root.children) return;

        let r = 0;
        let g = 0;
        let b = 0;

        root.children.forEach(child => {
            const { x, y } = child;
            const index = xy_to_i([x, y], original_img.width);

            r += original_img.data[index + 0];
            g += original_img.data[index + 1];
            b += original_img.data[index + 2];
        });

        root.color = rgbToHex(
            Math.round(r / root.children.length),
            Math.round(g / root.children.length),
            Math.round(b / root.children.length),
        );
    })
}

/** Use the color at the root node's location for each segment. */
export function root_color(segments: Node[], original_img: ImageData) {
    segments.forEach((root, i) => {
        if (!root.children) return;

        const { x, y } = root;
        const index = xy_to_i([x, y], original_img.width);

        const r = original_img.data[index + 0];
        const g = original_img.data[index + 1];
        const b = original_img.data[index + 2];

        root.color = rgbToHex(
            r,
            g,
            b,
        );
    })
}

/** Use the color at center of the segment's bounding box for each segment. */
export function center_color(segments: Node[], original_img: ImageData) {
    segments.forEach((root, i) => {
        if (!root.children) return;

        const { n, s, e, w } = root;
        const x = Math.floor(w + (e - w) / 2);
        const y = Math.floor(n + (s - n) / 2);

        const index = xy_to_i([x, y], original_img.width);

        const r = original_img.data[index + 0];
        const g = original_img.data[index + 1];
        const b = original_img.data[index + 2];

        root.color = rgbToHex(
            r,
            g,
            b,
        );
    })
}

/** Use a histogram to find the value for each channel that occurs most often in each segment. */
export function representative_color(segments: Node[], original_img: ImageData) {
    segments.forEach((root, i) => {
        if (!root.children) return;

        const histogram = {
            r: new Uint32Array(256),
            g: new Uint32Array(256),
            b: new Uint32Array(256),
        }

        let max_index_r = 0;
        let max_index_g = 0;
        let max_index_b = 0;

        // iterate over each pixel of the segment
        root.children.forEach(child => {
            // get value of each channel
            const r = original_img.data[xy_to_i([child.x, child.y], original_img.width) + 0];
            const g = original_img.data[xy_to_i([child.x, child.y], original_img.width) + 1];
            const b = original_img.data[xy_to_i([child.x, child.y], original_img.width) + 2];

            // update histogram
            histogram.r[r]++;
            histogram.g[g]++;
            histogram.b[b]++;

            // update the max index for each channel
            if (histogram.r[r] > histogram.r[max_index_r]) max_index_r = r;
            if (histogram.g[g] > histogram.g[max_index_g]) max_index_g = g;
            if (histogram.b[b] > histogram.b[max_index_b]) max_index_b = b;
        });

        root.color = rgbToHex(max_index_r, max_index_g, max_index_b);
    });
}

export function clustered_color(segments: Node[], original_img: ImageData) {
    segments.forEach((segment, i) => {
        if (!segment.children) return;

        let cluster = dbscan(segment, 100, 20, original_img);

        let max = Math.max(...cluster.map(i => i.length));

        let result = cluster.filter(i => i.length !== max);

        console.log(result[0]);

    });

}

/** Use a specific colour palette to create images similar to those of the artist Piet Mondrian. */
export function mondrian_colors(segments: Node[]) {
    const mondrian_color_palette = ["#fff001", "#ff0101", "#0101fd", "#f9f9f9", "#f9f9f9", "#f9f9f9", "#30303a"]
    segments.forEach((root, i) => {
        if (!root.children) return;

        root.color = mondrian_color_palette[Math.floor(Math.random()*mondrian_color_palette.length)]
    })
}