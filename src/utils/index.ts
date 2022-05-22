import ImageData from '@canvas/image-data';

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
 * @returns Array of x and y coordinate in the image space
 */
export function xy_to_i([x, y]: [number, number], width: number) {
    return y * width * 4 + x * 4;
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

    // downscale image using nearest neighbor sampling
    const image_data = nearest_neighbor(original_img, segmentation_image.width, segmentation_image.height);

    // data structure for storing the bounding box of each color
    const aabb = new Map<string, {
        'n': number
        's': number
        'e': number
        'w': number
    }>()

    // calculate bounding boxes
    for (let i = 0; i < image_data?.data.length; i += 4) {
        const r = image_data.data[i + 0];
        const g = image_data.data[i + 1];
        const b = image_data.data[i + 2];
        // const a = image_data.data[i + 3];

        const [x, y] = i_to_xy(i, image_data.width);

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

    // clear the canvas for redrawing
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // ensure canvas has the same size as the rendered image
    canvas.height = segmentation_image.height;
    canvas.width = segmentation_image.width;

    // draw the bounding boxes
    aabb.forEach((bb, color, map) => {
        // use rgba to control the alpha value 
        // const rgb = hexToRgb(color);
        // ctx.fillStyle = `rgba(${rgb?.r}, ${rgb?.g}, ${rgb?.b}, 1)`; // fill with color

        // use hex color directly
        ctx.fillStyle = color;

        ctx.fillRect(bb.w, bb.n, bb.e - bb.w, bb.s - bb.n);
    })

    console.timeEnd('shapify');
}