import ImageData from '@canvas/image-data';

import { BoundingBox } from './union-find';

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
    ] as [number, number];
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

export function clone_image(img: ImageData) {
    return new ImageData(
        new Uint8ClampedArray(img.data),
        img.width,
        img.height
    );
}

export function drawRectangle(
    ctx: CanvasRenderingContext2D,
    segment: BoundingBox & { color: string },
    alpha: number = 0.5
) {
    // use rgba to control the alpha value 
    const rgb = hexToRgb(segment.color);
    ctx.fillStyle = `rgba(${rgb?.r}, ${rgb?.g}, ${rgb?.b}, ${alpha})`; // fill with color

    ctx.fillRect(segment.w, segment.n, segment.e - segment.w, segment.s - segment.n);
}


export function fillLines(ctx: CanvasRenderingContext2D, coords: Array<[number, number]>, color: string, width: number = 1) {
    // draw lines between points
    ctx.beginPath();
    ctx.fillStyle = color;
    ctx.lineWidth = width;
    ctx.moveTo(coords[0][0], coords[0][1]);
    coords
        .forEach(point => {
            ctx.lineTo(point[0], point[1]);
        })
    ctx.closePath();
    ctx.fill();
}

export function strokeLines(ctx: CanvasRenderingContext2D, coords: Array<[number, number]>, color: string, width: number = 1) {
    // draw lines between points
    ctx.beginPath();
    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    ctx.moveTo(coords[0][0], coords[0][1]);
    coords
        .forEach(point => {
            ctx.lineTo(point[0], point[1]);
        })
    // ctx.lineTo(coords[0][0], coords[0][1]);
    ctx.closePath();
    ctx.stroke();
}

export function fillCircle(ctx: CanvasRenderingContext2D, coords: [number, number], color: string, radius = 2) {
    ctx.beginPath();
    ctx.arc(coords[0], coords[1], radius, 0, 2 * Math.PI, false);
    ctx.lineWidth = 3;
    ctx.fillStyle = color;
    ctx.fill();
}