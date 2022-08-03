import React from 'react';
import './styles/App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import shapify, { canvas as ascanvas } from './utils/shapify';
import { randomizeSelect } from './utils';

const HEIGHT = 254;
const TEST_IMG = 1;
const DISCARD_THRESHOLD = 0.01;
const TOLERANCE = 1;

function App() {

  const [img, setImg] = React.useState<string | null>(null);
  const [showPreview, setShowPreview] = React.useState(false);
  const [imageChanged, setImageChanged] = React.useState(true);
  const [discard, setDiscard] = React.useState(DISCARD_THRESHOLD);
  const [tolerance, setTolerance] = React.useState(TOLERANCE);

  return (
    <div className="App">
      <header className="App-header">
        <h1>Arty Shapes</h1>
      </header>

      <main className='mx-5 my-2'>
        {/* left side */}
        <div
          id="parameter-container"
          className='d-flex flex-column gap-2'
          style={{ gridArea: "parameter" }}
        >

          <div id="button-container" className='row'>
            <div className="col-6">
              <button className='btn btn-primary w-100'>Upload +</button>
            </div>
            <div className="col-6">
              <button
                className='btn btn-primary w-100'
                onClick={() => setShowPreview(!showPreview)}
              >Show {showPreview ? "original" : "preview"}</button>
            </div>
          </div>

          <div
            id="middle"
            className='flex-grow-1 border rounded border-primary d-flex flex-column justify-content-around px-2'
          >
            <div className='mb-3'>
              <h4>Presets</h4>
              <div className='row'>
                <div className='col-4'>
                  <input type="radio" className="btn-check" name="options-preset" id="preset-skyline" autoComplete="off" defaultChecked />
                  <label className="btn btn-outline-primary w-100" htmlFor="preset-skyline">Skyline</label>
                </div>

                <div className='col-4'>
                  <input type="radio" className="btn-check" name="options-preset" id="preset-portrait" autoComplete="off" />
                  <label className="btn btn-outline-primary w-100" htmlFor="preset-portrait">Portrait</label>
                </div>

                <div className='col-4'>
                  <input type="radio" className="btn-check" name="options-preset" id="preset-gp" autoComplete="off" />
                  <label className="btn btn-outline-primary w-100" htmlFor="preset-gp">GP</label>
                </div>
              </div>
            </div>

            <div className='mb-3'>
              <h4>Level of detail</h4>
              <div className='row'>
                <div className='col-4'>
                  <input type="radio" className="btn-check" name="options-lod" id="lod-low" autoComplete="off" defaultChecked />
                  <label className="btn btn-outline-primary w-100" htmlFor="lod-low">Low</label>
                </div>

                <div className='col-4'>
                  <input type="radio" className="btn-check" name="options-lod" id="lod-medium" autoComplete="off" />
                  <label className="btn btn-outline-primary w-100" htmlFor="lod-medium">Medium</label>
                </div>

                <div className='col-4'>
                  <input type="radio" className="btn-check" name="options-lod" id="lod-high" autoComplete="off" />
                  <label className="btn btn-outline-primary w-100" htmlFor="lod-high">High</label>
                </div>
              </div>
            </div>

            <div className='mb-3'>
              <h4>Color style</h4>
              <div className='row gap-y-1'>
                <div className='col-6 mb-2'>
                  <input type="radio" className="btn-check" name="options-color" id="color-abstract" autoComplete="off" defaultChecked />
                  <label className="btn btn-outline-primary w-100" htmlFor="color-abstract">Abstract</label>
                </div>

                <div className='col-6 mb-2'>
                  <input type="radio" className="btn-check" name="options-color" id="color-average" autoComplete="off" />
                  <label className="btn btn-outline-primary w-100" htmlFor="color-average">Average</label>
                </div>

                <div className='col-6'>
                  <input type="radio" className="btn-check" name="options-color" id="color-vibrant" autoComplete="off" />
                  <label className="btn btn-outline-primary w-100" htmlFor="color-vibrant">Vibrant</label>
                </div>

                <div className='col-6'>
                  <input type="radio" className="btn-check" name="options-color" id="color-muted" autoComplete="off" />
                  <label className="btn btn-outline-primary w-100" htmlFor="color-muted">Muted</label>
                </div>
              </div>
            </div>

            {/* discarding threshold */}
            <div className='mb-3'>
              <label className='form-label' htmlFor='input-discard'>
                <h5>Discarding threshold: {Math.floor(discard * 100)}%</h5>
              </label>
              <input
                id="input-discard"
                className='form-range'
                type="range"
                min={0} max={0.1} step={0.01}
                defaultValue={discard}
                onChange={e => setDiscard(parseFloat(e.target.value))}
                title="Discard elements whose bounding box area is less than the specified value of the total image area"
              />
            </div>

            <div className='mb-3'>
              <h4>Shape</h4>
              <div className='row gap-y-1'>
                <div className='col-6 mb-2'>
                  <input type="radio" className="btn-check" name="options-shape" id="shape-aabb" autoComplete="off" defaultChecked />
                  <label className="btn btn-outline-primary w-100" htmlFor="shape-aabb">AABB</label>
                </div>

                <div className='col-6 mb-2'>
                  <input type="radio" className="btn-check" name="options-shape" id="shape-obb" autoComplete="off" />
                  <label className="btn btn-outline-primary w-100" htmlFor="shape-obb">OBB</label>
                </div>

                <div className='col-6'>
                  <input type="radio" className="btn-check" name="options-shape" id="shape-convex" autoComplete="off" />
                  <label className="btn btn-outline-primary w-100" htmlFor="shape-convex">Convex</label>
                </div>

                <div className='col-6'>
                  <input type="radio" className="btn-check" name="options-shape" id="shape-concave" autoComplete="off" />
                  <label className="btn btn-outline-primary w-100" htmlFor="shape-concave">Concave</label>
                </div>
              </div>
            </div>

          </div>

          <div id="export-container">
            <button className='btn btn-primary w-100'>Export</button>
          </div>

        </div>


        {/* right side */}
        <div
          id="image-preview-container"
          style={{ gridArea: "preview", position: "relative" }}
        >
          {/* canvas */}
          {img ?
            <>
              <canvas
                id="as-canvas"
                className='border border-dark border-2 m-auto'
                height={250}
                style={{ display: showPreview ? "inherit" : "none" }}
              />
              <img src={img} style={{ display: showPreview ? "none" : "inherit" }} />
            </> :
            <div className='center'>
              <div>
                {/* <label htmlFor="formFileLg" className="form-label">Large file input example</label> */}
                <input className="form-control form-control-lg" id="formFileLg" type="file" onChange={e => {
                  const t = e.target as HTMLInputElement;
                  if (t.files && t.files.length > 0) {
                    const f = t.files[0];
                    setImg(URL.createObjectURL(f));
                  }
                }} />
              </div>
            </div>
          }
        </div>

      </main>
    </div>

  );
}

export default App;
