# Arty Shapes

## About
This project was created as part of the lecture 'Algorithmen zur Prozessierung visueller Medien' (Algorithms for processing visual media) during the winter semester 2022 at [HPI](https://github.com/hpicgs) by [@instant-sky](https://github.com/instant-sky) & [@gwauge](https://github.com/gwauge).\
The main inspiration for this project was drawn from the 2008 paper [_Arty Shapes_](https://www.researchgate.net/publication/220795274_Arty_Shapes) by Song et al.

---
## Live demo
Try it out [__here__](artshapes.netlify.app) for yourself.

---
## Pipeline
The user selects an image for processing. As soon as the image has finished loading, the processing pipeline starts working inside the shapify function.\
There, the machine learning model is being loaded if necessary and all the variables are read from the GUI and passed on to the draw_segments function.\
Now the image is processed and split up into individual segments via the hk function. Afterwards each segments colored is modified according to the appropriate color setting. Lastly the shape is changed and the resulting shape is simplified. When everything is done, a polygon is drawn back to the canvas.

---

## Important available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.\
You will also see any lint errors in the console.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.