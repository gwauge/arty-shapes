import ImageData from '@canvas/image-data';

export function hexToRgb(hex: string) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (!result) throw new Error("Invalid hex color: " + hex);
    return {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    };
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

export function getImageData(img_id: string) {
    const img = document.getElementById(img_id) as HTMLImageElement;
    if (!img) throw new Error("image not found: " + img_id);

    const canvas = document.createElement('canvas');
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error("could not get context for image: " + img_id);

    ctx.drawImage(img, 0, 0);
    return ctx.getImageData(0, 0, img.naturalWidth, img.naturalHeight);
}

export function randomizeSelect(id: string) {
    const select = document.getElementById(id) as HTMLSelectElement;
    const items = select.getElementsByTagName('option');
    const index = Math.floor(Math.random() * items.length);
    select.selectedIndex = index;
}

type ArrayLengthMutationKeys = 'splice' | 'push' | 'pop' | 'shift' | 'unshift' | number;
export type ArrayItems<T extends Array<any>> = T extends Array<infer TItems> ? TItems : never;
export type FixedLengthArray<T, L extends number, TObj = [T, ...Array<T>]> =
    Pick<TObj, Exclude<keyof TObj, ArrayLengthMutationKeys>>
    & {
        readonly length: L
        [I: number]: T
        [Symbol.iterator]: () => IterableIterator<T>
    }