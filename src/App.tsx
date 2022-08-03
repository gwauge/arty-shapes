import { useState } from 'react';
import './styles/App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import shapify, { canvas as ascanvas } from './utils/shapify';

const HEIGHT = 254;
const TEST_IMG = 1;
const DISCARD_THRESHOLD = 0.01;
const TOLERANCE = 1;

function App() {

  const [img, setImg] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(true);
  const [imageChanged, setImageChanged] = useState(false);
  const [modelName, setModelName] = useState("ADE20K");
  const [quantizationBytes, setQuantizationBytes] = useState(2);
  const [discard, setDiscard] = useState(DISCARD_THRESHOLD);
  const [tolerance, setTolerance] = useState(TOLERANCE);
  const [color, setColor] = useState("abstract");
  const [border, setBorder] = useState(5);
  const [lod, setLod] = useState("low");
  const [shape, setShape] = useState("aabb");

  function startShapification() {
    if (img) {
      // setShowPreview(true);
      shapify(
        imageChanged,
        modelName,
        quantizationBytes,
        color,
        discard,
        tolerance,
        shape,
        border
      )
    }
  }

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

          {/* upload and switch buttons */}
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

          <form
            name='parameters'
            id="middle"
            onSubmit={e => e.preventDefault()}
            className='flex-grow-1 border rounded border-primary d-flex flex-column justify-content-around px-2'
          >
            {/* presets */}
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

            {/* level of detail */}
            <div className='mb-3'>
              <h4>Level of detail</h4>

              <div className='row'>
                <div className="col-4">
                  <button className={`btn btn${lod !== "low" ? "-outline" : ""}-primary w-100`} onClick={() => {
                    setLod("low");
                    startShapification();
                  }}>Low</button>
                </div>
                <div className="col-4">
                  <button className={`btn btn${lod !== "medium" ? "-outline" : ""}-primary w-100`} onClick={() => {
                    setLod("medium");
                    startShapification();
                  }}>Medium</button>
                </div>
                <div className="col-4">
                  <button className={`btn btn${lod !== "high" ? "-outline" : ""}-primary w-100`} onClick={() => {
                    setLod("high");
                    startShapification();
                  }}>High</button>
                </div>
              </div>
            </div>

            {/* color style */}
            <div className='mb-3'>
              <h4>Color style</h4>
              <div className='row mb-2'>
                <div className="col-6">
                  <button className={`btn btn${color !== "abstract" ? "-outline" : ""}-primary w-100`} onClick={() => {
                    setColor("abstract");
                    startShapification();
                  }}>Abstract</button>
                </div>
                <div className="col-6">
                  <button className={`btn btn${color !== "average" ? "-outline" : ""}-primary w-100`} onClick={() => {
                    setColor("average");
                    startShapification();
                  }}>Average</button>
                </div>
              </div>

              <div className='row'>
                <div className="col-6">
                  <button className={`btn btn${color !== "vibrant" ? "-outline" : ""}-primary w-100`} onClick={() => {
                    setColor("vibrant");
                    startShapification();
                  }}>Vibrant</button>
                </div>
                <div className="col-6">
                  <button className={`btn btn${color !== "muted" ? "-outline" : ""}-primary w-100`} onClick={() => {
                    setColor("muted");
                    startShapification();
                  }}>Muted</button>
                </div>
              </div>
            </div>

            {/* border */}
            <div className='mb-3'>
              <label className='form-label' htmlFor='input-discard'>
                <h4>Border: {border}px</h4>
              </label>
              <input
                id="input-discard"
                className='form-range'
                type="range"
                min={0} max={25} step={1}
                defaultValue={border}
                onChange={e => setBorder(parseInt(e.target.value))}
                title="Thickness of the border around each segment"
              />
            </div>

            {/* shape */}
            <div className='mb-3'>
              <h4>Shape</h4>
              <div className='row mb-2'>
                <div className="col-6">
                  <button className={`btn btn${shape !== "aabb" ? "-outline" : ""}-primary w-100`} onClick={() => {
                    setShape("aabb");
                    startShapification();
                  }}>AABB</button>
                </div>
                <div className="col-6">
                  <button className={`btn btn${shape !== "obb" ? "-outline" : ""}-primary w-100`} onClick={() => {
                    setShape("obb");
                    startShapification();
                  }}>OBB</button>
                </div>
              </div>

              <div className='row'>
                <div className="col-6">
                  <button className={`btn btn${shape !== "convex" ? "-outline" : ""}-primary w-100`} onClick={() => {
                    setShape("convex");
                    startShapification();
                  }}>Convex</button>
                </div>
                <div className="col-6">
                  <button className={`btn btn${shape !== "concave" ? "-outline" : ""}-primary w-100`} onClick={() => {
                    setShape("concave");
                    startShapification();
                  }}>Concave</button>
                </div>
              </div>
            </div>
          </form>

          <div id="export-container">

            <button className='btn btn-primary w-100' onClick={e => {
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
              if (ascanvas) download("artyshapes.svg", ascanvas.toSVG());
              else alert("Canvas is not ready yet!");
            }}>Export</button>
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
                    setImageChanged(true);
                    startShapification();
                  }
                }} />
              </div>
            </div>
          }
        </div>

      </main>
      <canvas id="seg-canvas" className='border border-dark border-2 m-auto' height={250} style={{ display: "none" }} />
    </div>

  );
}

export default App;
