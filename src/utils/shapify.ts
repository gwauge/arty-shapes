import monotoneChainConvexHull from 'monotone-chain-convex-hull';
import simplify from 'simplify-js';

import hk from './ccl';
import {
    nearest_neighbor,
    fillLines,
} from './';

const DISCARD_THRESHOLD = 0.01;

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

    console.log("segments:", segments.length);
    segments
        .sort((a, b) => (b.s - b.n) * (b.e - b.w) - (a.s - a.n) * (a.e - a.w))
        .forEach(segment => {
            // discard small segments (area smaller than a predefined value relative to the size of the image)
            if ((segment.s - segment.n) * (segment.e - segment.w) < (img.height * img.width) * DISCARD_THRESHOLD) return;

            // fillCircle(ctx, [segment.x, segment.y], '#ff0000', 2); // draw the root of each segment

            console.log("segment:", segment.color, "\n\tchildren:", segment.children?.length, "\n\txy:", segment.x, segment.y);

            if (!segment.children) throw new Error("children is undefined");
            const convex_hull = monotoneChainConvexHull(segment.children.map(c => [c.x, c.y]));
            // fillLines(ctx, convex_hull, segment.color, 1);

            const simplified = simplify(convex_hull.map(p => ({ x: p[0], y: p[1] })), 20);
            fillLines(ctx, simplified.map((p: { x: number, y: number }) => [p.x, p.y]), segment.color, 1);
        })

}