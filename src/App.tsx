import React from 'react';
import './styles/App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import shapify, { canvas } from './utils/shapify';
import { randomizeSelect } from './utils';

const HEIGHT = 250;
const TEST_IMG = 2;
const DISCARD_THRESHOLD = 0.01;
const TOLERANCE = 15;

function App() {

  const [img, setImg] = React.useState(TEST_IMG);
  const [discard, setDiscard] = React.useState(DISCARD_THRESHOLD);
  const [tolerance, setTolerance] = React.useState(TOLERANCE);

  return (
    <div className="App">
      <header className="App-header">
        <h1>Arty Shapes</h1>
        <h3>APVM @ HPI</h3>
      </header>

      <main>

        <div className='container-lg' style={{ minHeight: "100vh" }}>
          <div className='row align-items-strech justify-content-center h-100'>

            {/* interactive elements */}
            <div className='col-12 row h-100 justify-content-between my-3'>
              <div className='col-4'>
                <div>
                  <label className='form-label'>Image</label>
                  <select defaultValue={img} className='form-select' id='input-image' onChange={e => setImg(parseInt(e.target.value))}>
                    <option value={1}>Woman in city</option>
                    <option value={2}>Kitchen</option>
                  </select>
                </div>

                <div className='mt-2'>
                  <label className='form-label' htmlFor='input-color'>Color selection mode</label>
                  <select id='input-color' className='form-select' defaultValue={"average"}>
                    <option value="average">Average</option>
                    <option value="root">Root</option>
                    <option value="center">Center</option>
                    <option value="segmentation">Segmentation</option>
                    <option value="representative">Representative</option>
                    <option value="Mondrian">Mondrian</option>
                  </select>
                </div>
              </div>

              <div className='col-4'>
                <div>
                  <label className='form-label' htmlFor='input-discard'>Discarding threshold: {Math.floor(discard * 100)}%</label>
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

                <div className='mt-3'>
                  <label className='form-label' htmlFor='input-tolerance'>Simplification tolerance: {tolerance}</label>
                  <input
                    id="input-tolerance"
                    className='form-range'
                    type="range"
                    min={0} max={100} step={1}
                    defaultValue={tolerance}
                    onChange={e => setTolerance(parseInt(e.target.value))}
                    title="Tolerance used for shape simplification (see shapify.js)"
                  />
                </div>
              </div>

              <div className='col-4'>
                <div className=''>
                  <label className='form-label' htmlFor='input-segmentation'>Segment mode</label>
                  <select id='input-segmentation' className='form-select' defaultValue={"convex"}>
                    <option value="aabb">Axis-aligned bounding box</option>
                    <option value="convex">Convex hull</option>
                    <option value="concave">Concave hull</option>
                    {/* <option value="oabb">Object-aligned bounding box</option> */}
                  </select>
                </div>

                <div className='mt-3 d-flex justify-content-between'>
                  <button className='btn btn-lg btn-danger' onClick={e => {
                    e.preventDefault();

                    randomizeSelect('input-color');
                    randomizeSelect('input-segmentation');

                    // randomize simplify.js tolerance value
                    const MAX_RANDOM_TOLERANCE = 15;
                    const tolerance = document.getElementById('input-tolerance') as HTMLInputElement;
                    tolerance.value = Math.floor(Math.random() * MAX_RANDOM_TOLERANCE).toString();
                    setTolerance(parseInt(tolerance.value)); // update state

                    shapify();
                    console.log("canvas:", canvas);
                  }}>Randomize</button>
                  <button className='btn btn-lg btn-primary' id="btn-shapify" onClick={shapify}>Shapify</button>
                  <button className='btn btn-lg btn-success' onClick={e => {
                    e.preventDefault();
                    function download(filename: string, content: string) {
                      var element = document.createElement('a');
                      element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(content));
                      element.setAttribute('download', filename);
                    
                      element.style.display = 'none';
                      document.body.appendChild(element);
                    
                      element.click();
                    
                      document.body.removeChild(element);
                    }

                    // Start file download.
                    if (canvas) download("artyshapes.svg", canvas.toSVG());
                    else alert("Canvas is not ready yet!");
                    
                  }}>Export</button>
                </div>
              </div>
            </div>

            <div className='row g-2'>
              {/* images */}
              <div className='col-12 col-xl-4 flex-shrink-0'>
                <img src={`input${img}.jpg`} alt="Source" height={HEIGHT} className='border border-dark border-2' id='img-input' />
              </div>
              <div className='col-12 col-xl-4 flex-shrink-0'>
                <img src={`segmentation${img}.png`} alt="Segmentation" height={HEIGHT} className='border border-dark border-2' id='img-segmentation' />
              </div>

              {/* canvas */}
              <div className='col-12 col-xl-4 flex-shrink-0 d-flex justify-content-center'>
                <canvas id="as-canvas" className='border border-dark border-2 m-auto' height={250} />
              </div>

            </div>

          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
