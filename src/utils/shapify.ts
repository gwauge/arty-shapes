import hk from './ccl';
import {
    nearest_neighbor,
    i_to_xy,
    rgbToHex,
    drawRectangle
} from './';

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

export function render_image_v1(
    ctx: CanvasRenderingContext2D,
    img: ImageData
) {
    // data structure for storing the bounding box of each color
    const aabb = new Map<string, {
        'n': number
        's': number
        'e': number
        'w': number
    }>();

    // calculate bounding boxes
    for (let i = 0; i < img?.data.length; i += 4) {
        const r = img.data[i + 0];
        const g = img.data[i + 1];
        const b = img.data[i + 2];
        // const a = image_data.data[i + 3];

        const [x, y] = i_to_xy(i, img.width);

        const hex = rgbToHex(r, g, b);
        const old_bb = aabb.get(hex);
        if (!old_bb) {
            aabb.set(hex, {
                'n': y,
                's': y,
                'e': x,
                'w': x,
            });
        } else {
            aabb.set(hex, {
                'n': old_bb.n,
                's': y,
                'e': Math.max(old_bb.e, x),
                'w': Math.min(old_bb.w, x),
            })
        }
    }

    // draw the bounding boxes
    console.log("segments:", Object.keys(aabb).length);
    aabb.forEach((bb, color, map) => {
        drawRectangle(ctx, Object.assign(bb, { color: color }))
    })
}

export function render_image_v2(
    ctx: CanvasRenderingContext2D,
    img: ImageData
) {
    const segments = hk(img);

    // draw the bounding boxes
    console.log("segments:", segments.length);
    segments
        // .sort((a, b) => b.rank - a.rank)
        .forEach(segment => {
            // discard small segments (smaller area than 300px)
            if ((segment.s - segment.n) * (segment.e - segment.w) < 300) return;

            drawRectangle(ctx, segment);
        })
}
