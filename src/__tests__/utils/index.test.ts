import ImageData from '@canvas/image-data';
import {
    hexToRgb,
    rgbToHex,
    componentToHex,
    i_to_xy,
    xy_to_i,
    nearest_neighbor
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