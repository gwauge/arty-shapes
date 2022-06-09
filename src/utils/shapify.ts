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
    average_color_oklab
} from './colorMode';

export let canvas: fabric.Canvas;

export default function shapify() {
    console.time('shapify');

    // create new, clean canvas
    if (canvas) canvas.dispose();
    canvas = new fabric.Canvas('as-canvas')

    const segmentation_image_element = document.getElementById('img-segmentation') as HTMLImageElement;
    const segmentation_img = getImageData("img-segmentation");

    // ensure canvas has the same size as the rendered image
    canvas.setHeight(segmentation_image_element.height);
    canvas.setWidth(segmentation_image_element.width);
    canvas.calcOffset();

    // downscale image using nearest neighbor sampling
    const image_data = nearest_neighbor(segmentation_img, segmentation_image_element.width, segmentation_image_element.height);
    console.log("height", image_data.height, "width", image_data.width);

    draw_segments(image_data);

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
        case "Mondrian":
            mondrian_colors(segments);
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


            const simplified = simplify(points.map(p => ({ x: p[0], y: p[1] })), tolerance);

            // Initialize and render the polygon in canvas
            if (color_mode_select.value === "Mondrian") {
                // console.log("Mondrian");
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