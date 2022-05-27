import monotoneChainConvexHull from 'monotone-chain-convex-hull';
import simplify from 'simplify-js';

import hk from './ccl';
import {
    nearest_neighbor,
    // drawRectangle,
    // xy_to_i,
    // hexToRgb,
    fillCircle,
    fillLines,
    // strokeLines
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

    // render_image_v1(ctx, image_data);
    render_image_v2(ctx, image_data);

    console.timeEnd('shapify');
}

export function render_image_v2(
    ctx: CanvasRenderingContext2D,
    img: ImageData
) {
    const segments = hk(img);

    // draw the bounding boxes

    console.log("height", img.height, "width", img.width);

    console.log("segments:", segments.length);
    segments
        // .sort((a, b) => b.rank - a.rank)
        .forEach(segment => {
            fillCircle(ctx, [segment.x, segment.y], '#ffffff', 2);

            // discard small segments (area smaller than a predefined value relative to the size of the image)
            if ((segment.s - segment.n) * (segment.e - segment.w) < (img.height * img.width) * DISCARD_THRESHOLD) return;

            console.log("segment:", segment.color, "children", segment.children?.length, "edge points", segment.edgePoints?.length);

            if (!segment.edgePoints) throw new Error("edgePoints is undefined");
            const convex_hull = monotoneChainConvexHull(segment.edgePoints);
            console.log("convex hull:", convex_hull.length);
            // strokeLines(ctx, convex_hull, segment.color, 1);

            const simplified = simplify(convex_hull.map(p => ({ x: p[0], y: p[1] })), 20);
            fillLines(ctx, simplified.map((p: { x: number, y: number }) => [p.x, p.y]), segment.color, 1);

            // drawRectangle(ctx, segment);
        })
}