import ImageData from '@canvas/image-data';
import { hk } from './ccl';
import { Node } from './union-find';

export function hexToRgb(hex: string) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
}

export function componentToHex(c: number) {
    const hex = c.toString(16);
    return hex.length === 1 ? "0" + hex : hex;
}

export function rgbToHex(r: number, g: number, b: number) {
    return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
}

/*
early version of the segment data structure
type Segment = {
    id: number,
    aabb: {
        'n': number
        's': number
        'e': number
        'w': number
    },
    segmentation_color: string,

}
*/

/**
 * Resize an image using nearest-neighbor sampling.
 * Credits to {@link https://tech-algorithm.com/articles/nearest-neighbor-image-scaling Tech-Algorithm.com} for the algorithm.
 * @param img Image to resize
 * @param width Target  width
 * @param height Target height
 * @returns Resized image
 */
export function nearest_neighbor(img: ImageData, width: number, height: number) {
    const new_img = new ImageData(width, height);
    const scale_x = img.width / width;
    const scale_y = img.height / height;

    for (let i = 0; i < height; i++) {
        for (let j = 0; j < width; j++) {
            const px = Math.floor(j * scale_x);
            const py = Math.floor(i * scale_y);

            const index_new = xy_to_i([j, i], width);
            const index_old = xy_to_i([px, py], img.width);
            new_img.data[index_new + 0] = img.data[index_old + 0];
            new_img.data[index_new + 1] = img.data[index_old + 1];
            new_img.data[index_new + 2] = img.data[index_old + 2];
            new_img.data[index_new + 3] = img.data[index_old + 3];
        }
    }
    return new_img;
}

/**
 * Converts a linear array position to a 2D position. 
 * Note that `ImageData` arrays are exprected, i.e. rgba 
 * each have their own index but result in the same pixel 
 * coordinates.
 * @param i Position in the array
 * @param width Width of the image
 * @returns Array of x and y coordinate in the image space
 */
export function i_to_xy(i: number, width: number) {
    return [
        Math.floor((i / 4) % width),
        Math.floor((i / 4) / width)
    ]
}

/**
 * Converts a 2D position to a linear array position. 
 * Note that `ImageData` arrays are presumed, i.e. rgba 
 * each pixel coordinate has 4 array positions.
 * @param i Position in the array
 * @param width Width of the image
 * @param per_pixel Number of array positions per pixel. Defaults to 4 (i.e. for ImageData).
 * @returns Array of x and y coordinate in the image space
 */
export function xy_to_i([x, y]: [number, number], width: number, per_pixel = 4) {
    return y * width * per_pixel + x * per_pixel;
}

export function shapify(e: React.MouseEvent<HTMLButtonElement, MouseEvent>) {
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
    aabb.forEach((bb, color, map) => {
        // use rgba to control the alpha value 
        // const rgb = hexToRgb(color);
        // ctx.fillStyle = `rgba(${rgb?.r}, ${rgb?.g}, ${rgb?.b}, 1)`; // fill with color

        // use hex color directly
        ctx.fillStyle = color;

        ctx.fillRect(bb.w, bb.n, bb.e - bb.w, bb.s - bb.n);
    })
}

function render_image_v2(
    ctx: CanvasRenderingContext2D,
    img: ImageData
) {
    const forest = hk(img);

    const roots: { [index: string]: Node & {
        n: number;
        s: number;
        e: number;
        w: number;
    } } = {};

    Object.values(forest).forEach(vertex => {
        const { parent, index } = vertex;
        if (parent === vertex) {
            return roots[index] = Object.assign(vertex, {
                n: vertex.y,
                s: vertex.y,
                e: vertex.x,
                w: vertex.x,
            });
        }

        if (!parent.children) parent.children = {};
        parent.children[index] = vertex;
    })

    Object.values(roots).forEach(segment => {
        // console.log("segment", segment);
        
        // calculate bounding box
        if (!segment.children) {
            console.log("no children", segment);
            return;
        } else {
            Object.values(segment.children).forEach(child => {
                const { x, y } = child;
                segment.n = Math.min(y, segment.n);
                segment.s = Math.max(y, segment.s);
                segment.e = Math.max(x, segment.e);
                segment.w = Math.min(x, segment.w);
            })
        }

        // discard small segments (smaller area than 300px)
        if ((segment.s - segment.n) * (segment.e - segment.w) < 300) return;

        // use hex color directly
        // ctx.fillStyle = segment.color;

        // use rgba to control the alpha value 
        const rgb = hexToRgb(segment.color);
        ctx.fillStyle = `rgba(${rgb?.r}, ${rgb?.g}, ${rgb?.b}, 0.5)`; // fill with color

        // draw bounding boxes
        ctx.fillRect(segment.w, segment.n, segment.e - segment.w, segment.s - segment.n);
    })
}