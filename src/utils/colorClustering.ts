import { Node } from "./union-find";
import { xy_to_i, rgbToHex } from ".";

export function pointsInRange(segment: Node, point: Node, eps: number, original_img: ImageData) {
    let outputList: Node[] = [];
    const pr = original_img.data[xy_to_i([point.x, point.y], original_img.width) + 0];
    const pg = original_img.data[xy_to_i([point.x, point.y], original_img.width) + 1];
    const pb = original_img.data[xy_to_i([point.x, point.y], original_img.width) + 2]; 


    segment.children?.forEach((otherPoint) => {
        const or = original_img.data[xy_to_i([otherPoint.x, otherPoint.y], original_img.width) + 0];
        const og = original_img.data[xy_to_i([otherPoint.x, otherPoint.y], original_img.width) + 1];
        const ob = original_img.data[xy_to_i([otherPoint.x, otherPoint.y], original_img.width) + 2]; 

        if (Math.abs(or - pr) + 
            Math.abs(og - pg) +
            Math.abs(ob - pb) < eps) {
                outputList.push(otherPoint);
        }
    });

    return outputList;
}

export function dbscan(segment: Node, eps: number, minPts: number, original_img: ImageData) {
    let C = 0;
    let cluster = [];
    cluster.push(segment.children?.forEach((pointP, index) => {
        
        if (pointP.label) {
            console.log("earlyReturn")
            return;
        }
        let neighbors = pointsInRange(segment, pointP, eps, original_img);

        if (neighbors.length < minPts) {
            pointP.label = "Noise";
            return;
        }
        C += 1;
        pointP.label = String(C);
        let seedset = neighbors;
        seedset.forEach((pointQ, index) => {
            if (pointP == pointQ) {
                return;
            }
            if (pointQ.label == "Noise") {
                pointQ.label = String(C);
            }
            if (pointQ.label) {
                return;
            }
            pointQ.label = String(C);
            neighbors = pointsInRange(segment, pointQ, eps, original_img);
            if (neighbors.length >= minPts) {
                seedset.concat(neighbors);
            }
        })
        console.log(seedset);
        return seedset;


    }));

    return cluster;

}