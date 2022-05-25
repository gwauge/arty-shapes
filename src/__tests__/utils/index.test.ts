import ImageData from '@canvas/image-data';
import {
    hexToRgb,
    rgbToHex,
    componentToHex,
    i_to_xy,
    xy_to_i,
    nearest_neighbor,
    drawRectangle
} from '../../utils';

test.each([
    ["#000000", { r: 0, g: 0, b: 0 }],
    ["#FFFFFF", { r: 255, g: 255, b: 255 }],
    ["bd5c55", { r: 189, g: 92, b: 85 }],
    ["#buic55", null],
])("should convert HEX %s to RGB %s", (hex, rgb) => {
    expect(hexToRgb(hex)).toEqual(rgb);
})

test.each([
    [{ r: 0, g: 0, b: 0 }, "#000000"],
    [{ r: 255, g: 255, b: 255 }, "#ffffff"],
    [{ r: 189, g: 92, b: 85 }, "#bd5c55"]
])("should convert RGB %s to HEX %s", (rgb, hex) => {
    expect(rgbToHex(rgb.r, rgb.g, rgb.b)).toEqual(hex);
})

test.each([
    [0, "00"],
    [255, "ff"],
    [189, "bd"]
])("should convert base10 integer %i to base16 %s", (rgb, hex) => {
    expect(componentToHex(rgb)).toEqual(hex);
})

test.each([
    [0, [0, 0]],
    [12, [3, 0]],
    [84, [1, 2]],
    [86, [1, 2]],
])("should convert index %i to coordinates %s", (i, xy) => {
    expect(i_to_xy(i, 10)).toEqual(xy);
})

test.each([
    [[0, 0] as [number, number], 0],
    [[3, 0] as [number, number], 12],
    [[1, 2] as [number, number], 84],
])("should convert coordinates %s to index %i", (xy, i) => {
    expect(xy_to_i(xy, 10)).toEqual(i);
})

test.each([
    [[0, 0] as [number, number], 0],
    [[3, 0] as [number, number], 3],
    [[1, 2] as [number, number], 21],
])("should convert coordinates %s to index %i", (xy, i) => {
    expect(xy_to_i(xy, 10, 1)).toEqual(i);
})

describe('nearest-neighbor interpolation', () => {
    let img: ImageData;
    beforeEach(() => {
        img = new ImageData(4, 4);
        for (let i = 0; i < img.data.length; i += 4) {
            img.data[i + 0] = i;
            img.data[i + 1] = 0;
            img.data[i + 2] = 0;
            img.data[i + 3] = 255;
        }
    });

    test('should have the target size', () => {
        const scaled = nearest_neighbor(img, 2, 2);
        expect(scaled.width).toEqual(2);
        expect(scaled.height).toEqual(2);
    });

    test('should be correctly downsized', () => {
        const scaled = nearest_neighbor(img, 2, 2);
        expect(scaled.data[0]).toEqual(0);
        expect(scaled.data[4]).toEqual(8);
        expect(scaled.data[8]).toEqual(32);
        expect(scaled.data[12]).toEqual(40);
    });
})

/*
test('should draw rectangle', () => {
    const WIDTH = 10;
    const HEIGHT = 10;

    const canvas = document.createElement('canvas');
    canvas.height = WIDTH;
    canvas.width = HEIGHT;

    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Could not get canvas context');
    ctx.clearRect(0, 0, WIDTH, HEIGHT);

    drawRectangle(ctx, {
        n: 0,
        s: HEIGHT / 2,
        w: 0,
        e: WIDTH / 2,
        color: '#ff0000'
    });

    const img = ctx.getImageData(0, 0, WIDTH, HEIGHT);
    console.log(img.data);

    let i = xy_to_i([0, 0], img.width);
    console.log(img.data[i + 0], img.data[i + 1], img.data[i + 2], img.data[i + 3]);
    expect(img.data[i + 0]).toEqual(255);
    expect(img.data[i + 1]).toEqual(0);
    expect(img.data[i + 2]).toEqual(0);
    expect(img.data[i + 3]).toEqual(128);

    drawRectangle(ctx, {
        n: 0,
        s: HEIGHT / 2,
        w: 0,
        e: WIDTH / 2,
        color: '#ff0000'
    });

    i = xy_to_i([2, 2], img.width);
    expect(img.data[i + 0]).toEqual(250);
    expect(img.data[i + 1]).toEqual(0);
    expect(img.data[i + 2]).toEqual(0);
    expect(img.data[i + 3]).toEqual(128);
})
*/