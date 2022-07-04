import monotoneChainConvexHull from 'monotone-chain-convex-hull';
import simplify from 'simplify-js';
import concaveman from 'concaveman';
import PCA from 'pca-js';
import { fabric } from 'fabric';

import hk from './ccl';
import {
    nearest_neighbor,
    getImageData,
    angleBetween,
    rotate,
    AABBfromNSEW,
} from './';
import {
    representative_color,
    root_color,
    center_color,
    average_color,
    mondrian_colors,
    average_color_oklab,
    clustered_color
} from './colorMode';

import '@tensorflow/tfjs';
import { load } from '@tensorflow-models/deeplab';

type ModelNames = 'pascal' | 'cityscapes' | 'ade20k';
type QuantizationBytes = 1 | 2 | 4;

async function loadModel() {
    const modelName = (document.getElementById('input-modelName') as HTMLSelectElement).value;
    const quantizationBytes = parseInt((document.getElementById('input-quantizationBytes') as HTMLSelectElement).value);
    return await load({
        base: modelName as ModelNames,
        quantizationBytes: quantizationBytes as QuantizationBytes
    });
};

function segment() {
    const input_image_element = document.getElementById('img-input') as HTMLImageElement;
    const c = document.getElementById('seg-canvas') as HTMLCanvasElement;
    const ctx = c.getContext('2d');

    return loadModel()
        .then(model => model.segment(input_image_element))
        .then(
            ({ segmentationMap, width, height }) => {
                const scale_factor = c.height / height;

                const image = new ImageData(segmentationMap, width);

                // create new, in-memory canvas
                const newCanvas = document.createElement('canvas');
                newCanvas.width = width;
                newCanvas.height = height;
                const newCtx = newCanvas.getContext('2d');
                newCtx?.putImageData(image, 0, 0);

                // c.height = image.height * scale_factor;
                c.width = image.width * scale_factor;
                ctx?.scale(scale_factor, scale_factor);
                ctx?.clearRect(0, 0, c.width, c.height);
                ctx?.drawImage(newCanvas, 0, 0);

                newCanvas.remove();
            });
}

export let canvas: fabric.Canvas;

export default async function shapify(imageChanged: boolean = true) {
    console.time('shapify');

    // only regenerate segmentation if input image or model settings have changed
    if (imageChanged) {
        console.time('semantic segmentation');
        await segment();
        console.timeEnd('semantic segmentation');
    }

    // create new, clean canvas
    if (canvas) canvas.dispose();
    canvas = new fabric.Canvas('as-canvas')

    const segmentation_image_element = document.getElementById('seg-canvas') as HTMLCanvasElement;
    const seg_ctx = segmentation_image_element.getContext('2d');
    if (!seg_ctx) return;
    const segmentation_img = seg_ctx.getImageData(0, 0, segmentation_image_element.width, segmentation_image_element.height);

    // ensure canvas has the same size as the rendered image
    canvas.setHeight(segmentation_image_element.height);
    canvas.setWidth(segmentation_image_element.width);
    canvas.calcOffset();

    console.log("height", segmentation_img.height, "width", segmentation_img.width);

    draw_segments(segmentation_img);

    console.timeEnd('shapify');
}

export function draw_segments(
    img: ImageData
) {
    const segments = hk(img);

    // calculate appropriate color
    const original_img = nearest_neighbor(getImageData("img-input"), img.width, img.height);

    const discard_threshold_slider = document.getElementById('input-discard') as HTMLInputElement;
    const discard_threshold = parseFloat(discard_threshold_slider.value);

    const tolerance_input = document.getElementById('input-tolerance') as HTMLInputElement;
    const tolerance = parseInt(tolerance_input.value);

    // select the color of the segments
    const color_mode_select = document.getElementById('input-color') as HTMLSelectElement;
    switch (color_mode_select.value) {
        case "average":
            average_color(segments, original_img);
            break;
        case "average-oklab":
            average_color_oklab(segments, original_img);
            break;
        case "root":
            root_color(segments, original_img);
            break;
        case "center":
            center_color(segments, original_img);
            break;
        case "representative":
            representative_color(segments, original_img);
            break;
        case "mondrian":
            mondrian_colors(segments);
            break;
        case "cluster":
            clustered_color(segments, original_img);
            break;
        case "segmentation":
            break;
        default:
            break;
    }

    const segmentation_mode_select = document.getElementById('input-segmentation') as HTMLSelectElement;

    console.log("segments:", segments.length);
    segments
        .sort((a, b) => (b.s - b.n) * (b.e - b.w) - (a.s - a.n) * (a.e - a.w)) // sort by size of the bounding box
        .forEach((segment, index) => {
            // discard small segments (area smaller than a predefined value relative to the size of the image)
            if ((segment.s - segment.n) * (segment.e - segment.w) < (img.height * img.width) * discard_threshold) return;

            // fillCircle(ctx, [segment.x, segment.y], '#ff0000', 2); // draw the root of each segment

            if (!segment.children) return;

            // select segment points based on the segmentation mode
            let points: Vector[] = [];
            switch (segmentation_mode_select.value) {
                case "aabb":
                    points = AABBfromNSEW(segment.n, segment.s, segment.e, segment.w);
                    break;
                case "convex":
                    points = monotoneChainConvexHull(segment.children.map(c => [c.x, c.y]));
                    break;
                case "concave":
                    points = concaveman(segment.children.map(c => [c.x, c.y])) as Vector[];
                    break;
                case "oabb":
                    /* Credits to https://hewjunwei.wordpress.com/2013/01/26/obb-generation-via-principal-component-analysis/ */

                    points = monotoneChainConvexHull(segment.children.map(c => [c.x, c.y]));
                    const eigenvectors = PCA.getEigenVectors(points);
                    const angle = angleBetween(eigenvectors[0].vector, [1, 0]);

                    // calculate bounding box to determinate the center
                    let nsew: [number, number, number, number] = [-1, Infinity, -1, Infinity];
                    for (const point of points) {

                        nsew[0] = Math.max(nsew[0], point[1]);
                        nsew[1] = Math.min(nsew[1], point[1]);
                        nsew[2] = Math.max(nsew[2], point[0]);
                        nsew[3] = Math.min(nsew[3], point[0]);
                    }

                    const center: Vector = [
                        (nsew[2] + nsew[3]) / 2,
                        (nsew[1] + nsew[0]) / 2
                    ];

                    // rotate points around the center and find the bounding box
                    nsew = [-1, Infinity, -1, Infinity];
                    for (const point of points) {
                        const rotatedPoint = rotate(point, angle, center);

                        nsew[0] = Math.max(nsew[0], rotatedPoint[1]);
                        nsew[1] = Math.min(nsew[1], rotatedPoint[1]);
                        nsew[2] = Math.max(nsew[2], rotatedPoint[0]);
                        nsew[3] = Math.min(nsew[3], rotatedPoint[0]);
                    }

                    // rotate the bounding box points back
                    points = AABBfromNSEW(...nsew).map(p => rotate(p, -angle, center));
                    break;
                default:
                    throw new Error("invalid segmentation mode: " + segmentation_mode_select.value);
            }

            // simplify the segment
            const simplified = simplify(points.map(p => ({ x: p[0], y: p[1] })), tolerance);

            // Initialize and render the polygon in canvas
            if (color_mode_select.value === "mondrian") {
                canvas.add(new fabric.Polygon(simplified, {
                    fill: segment.color,
                    strokeWidth: 5,
                    stroke: "#000000"
                }))
            } else {
                canvas.add(new fabric.Polygon(simplified, {
                    fill: segment.color
                }))
            }
        })
}