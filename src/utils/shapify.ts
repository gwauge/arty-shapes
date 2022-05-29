import monotoneChainConvexHull from 'monotone-chain-convex-hull';
import simplify from 'simplify-js';

import hk from './ccl';
import {
    nearest_neighbor,
    fillLines,
    getImageData,
    xy_to_i,
    rgbToHex,
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

    const segments = hk(img);

    // calculate appropriate color
    const original_img = nearest_neighbor(getImageData("img-input"), img.width, img.height);
    console.log(original_img.width, original_img.height);

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
        case "segmentation":
            break;
        default:
            break;
    }

    console.log("segments:", segments.length);
    segments
        .sort((a, b) => (b.s - b.n) * (b.e - b.w) - (a.s - a.n) * (a.e - a.w)) // sort by size of the bounding box
        .forEach(segment => {
            // discard small segments (area smaller than a predefined value relative to the size of the image)
            if ((segment.s - segment.n) * (segment.e - segment.w) < (img.height * img.width) * discard_threshold) return;

            // fillCircle(ctx, [segment.x, segment.y], '#ff0000', 2); // draw the root of each segment

            // console.log("segment:", segment.color, "\n\tchildren:", segment.children?.length, "\n\txy:", segment.x, segment.y);

            if (!segment.children) return;
            const convex_hull = monotoneChainConvexHull(segment.children.map(c => [c.x, c.y]));
            // fillLines(ctx, convex_hull, segment.color, 1);

            const simplified = simplify(convex_hull.map(p => ({ x: p[0], y: p[1] })), tolerance);
            fillLines(ctx, simplified.map((p: { x: number, y: number }) => [p.x, p.y]), segment.color, 1);
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

        console.log("index:", i, "color:",
            Math.round(r / root.children.length),
            Math.round(g / root.children.length),
            Math.round(b / root.children.length));

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

        console.log("index:", i, "color:",
            r,
            g,
            b);

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

        console.log("i:", i, "wens:", w, e, n, s, "coords:", x, y, "color:",
            rgbToHex(r, g, b));

        root.color = rgbToHex(
            r,
            g,
            b,
        );
    })
}