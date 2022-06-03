import monotoneChainConvexHull from 'monotone-chain-convex-hull';
import simplify from 'simplify-js';
import concaveman from 'concaveman';

import hk from './ccl';
import {
    nearest_neighbor,
    fillLines,
    getImageData,
    xy_to_i,
    rgbToHex,
    // hexToRgb,
    // fillCircle,
} from './';
import { Node } from './union-find';

export default function shapify(e: React.MouseEvent<HTMLButtonElement, MouseEvent>) {
    console.time('shapify');

    const canvas = document.getElementById('as-canvas') as HTMLCanvasElement;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // draw image to canvas
    const segmentation_image = document.getElementById('img-segmentation') as HTMLImageElement;
    canvas.height = segmentation_image.naturalHeight;
    canvas.width = segmentation_image.naturalWidth;

    ctx.drawImage(segmentation_image, 0, 0);

    const original_img = ctx.getImageData(0, 0, canvas.width, canvas.height);

    // clear the canvas for redrawing
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // ensure canvas has the same size as the rendered image
    canvas.height = segmentation_image.height;
    canvas.width = segmentation_image.width;

    // downscale image using nearest neighbor sampling
    const image_data = nearest_neighbor(original_img, segmentation_image.width, segmentation_image.height);
    console.log("height", image_data.height, "width", image_data.width);

    // render_image_v1(ctx, image_data);
    draw_segments(ctx, image_data);

    console.timeEnd('shapify');
}

export function draw_segments(
    ctx: CanvasRenderingContext2D,
    img: ImageData
) {

    console.time("ccl");
    const segments = hk(img);
    console.timeEnd("ccl");

    // calculate appropriate color
    const original_img = nearest_neighbor(getImageData("img-input"), img.width, img.height);

    const discard_threshold_slider = document.getElementById('input-discard') as HTMLInputElement;
    const discard_threshold = parseFloat(discard_threshold_slider.value);

    const tolerance_input = document.getElementById('input-tolerance') as HTMLInputElement;
    const tolerance = parseInt(tolerance_input.value);

    // select the color of the segments
    const color_mode_select = document.getElementById('input-color') as HTMLSelectElement;
    switch (color_mode_select.value) {
        case "average":
            average_color(segments, original_img);
            break;
        case "root":
            root_color(segments, original_img);
            break;
        case "center":
            center_color(segments, original_img);
            break;
        case "representative":
            representative_color(segments, original_img);
            break;
        case "segmentation":
            break;
        default:
            break;
    }
        
    const segmentation_mode_select = document.getElementById('input-segmentation') as HTMLSelectElement;
        
    console.log("segments:", segments.length);
    segments
        .sort((a, b) => (b.s - b.n) * (b.e - b.w) - (a.s - a.n) * (a.e - a.w)) // sort by size of the bounding box
        .forEach(segment => {
            // discard small segments (area smaller than a predefined value relative to the size of the image)
            if ((segment.s - segment.n) * (segment.e - segment.w) < (img.height * img.width) * discard_threshold) return;

            // fillCircle(ctx, [segment.x, segment.y], '#ff0000', 2); // draw the root of each segment

            if (!segment.children) return;

            let points: [number, number][] = [];
            switch (segmentation_mode_select.value) {
                case "aabb":
                    points = [
                        [segment.w, segment.n],
                        [segment.e, segment.n],
                        [segment.e, segment.s],
                        [segment.w, segment.s],
                    ];
                    break;
                case "convex":
                    points = monotoneChainConvexHull(segment.children.map(c => [c.x, c.y]));
                    break;
                case "concave":
                    points = concaveman(segment.children.map(c => [c.x, c.y])) as [number, number][];
                    break;
                default:
                    throw new Error("invalid segmentation mode: " + segmentation_mode_select.value);
            }

            if (tolerance > 0) {
                const simplified = simplify(points.map(p => ({ x: p[0], y: p[1] })), tolerance);
                fillLines(ctx, simplified.map((p: { x: number, y: number }) => [p.x, p.y]), segment.color, 1);
            } else fillLines(ctx, points, segment.color, 1);
        })
}

/** Use the average color of all pixels for each segment. */
function average_color(segments: Node[], original_img: ImageData) {
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
function root_color(segments: Node[], original_img: ImageData) {
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
function center_color(segments: Node[], original_img: ImageData) {
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
function representative_color(segments: Node[], original_img: ImageData) {
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