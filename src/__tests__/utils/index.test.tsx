import { hexToRgb, rgbToHex, componentToHex } from '../../utils';

test.each([
    ["#000000", { r: 0, g: 0, b: 0 }],
    ["#FFFFFF", { r: 255, g: 255, b: 255 }],
    ["bd5c55", { r: 189, g: 92, b: 85 }],
    ["#buic55", null],
])("should convert HEX %s to RGB %s", (hex, rgb) => {
    expect(hexToRgb(hex)).toEqual(rgb)
})

test.each([
    [{ r: 0, g: 0, b: 0 }, "#000000"],
    [{ r: 255, g: 255, b: 255 }, "#ffffff"],
    [{ r: 189, g: 92, b: 85 }, "#bd5c55"]
])("should convert RGB %s to HEX %s", (rgb, hex) => {
    expect(rgbToHex(rgb.r, rgb.g, rgb.b)).toEqual(hex)
})

test.each([
    [0, "00"],
    [255, "ff"],
    [189, "bd"]
])("should convert base10 integer %i to base16 %s", (rgb, hex) => {
    expect(componentToHex(rgb)).toEqual(hex)
})