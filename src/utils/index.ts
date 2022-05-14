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

export function shapify(e: React.MouseEvent<HTMLButtonElement, MouseEvent>) {
    const canvas = document.getElementById('as-canvas') as HTMLCanvasElement;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const segmentation_image = document.getElementById('img-segmentation') as HTMLImageElement;
    canvas.height = segmentation_image.naturalHeight;
    canvas.width = segmentation_image.naturalWidth;
    
    ctx.drawImage(segmentation_image, 0, 0);

    const image_data = ctx.getImageData(0, 0, canvas.width, canvas.height);
    if (!image_data) return;

    // data structure for storing the bounding box for each color
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

        const x = (i / 4) % canvas.width;
        const y = Math.floor((i / 4) / canvas.width);

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
    const target_size = segmentation_image.height;
    const scaling_factor = target_size / canvas.height;
    canvas.height = segmentation_image.height;
    canvas.width = segmentation_image.width;
    ctx.scale(scaling_factor, scaling_factor);

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