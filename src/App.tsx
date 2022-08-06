import { useState } from 'react';
import './styles/App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import shapify, { canvas as ascanvas } from './utils/shapify';
import Radio from './components/Radio';

let imgString: string | null = null;

function App() {

  const [img, setImg] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(true);
  const [imageChanged, setImageChanged] = useState(false);
  const [border, setBorder] = useState(5);

  function startShapification() {
    if (imgString) {
      // setShowPreview(true);
      shapify(imageChanged);
    }
  }

  return (
    <div className="App">
      <input className="form-control form-control-lg d-none" id="formFileLg" type="file" onChange={e => {
        const t = e.target as HTMLInputElement;
        if (t.files && t.files.length > 0) {
          const f = t.files[0];
          imgString = URL.createObjectURL(f);
          setImg(imgString);
          setImageChanged(true);
          // startShapification();
        }
      }} />
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
              <button className='btn btn-primary w-100 d-flex justify-content-center align-items-center' onClick={() => {
                document.getElementById("formFileLg")?.click();
              }}>
                Upload
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-plus-circle-fill ms-2" viewBox="0 0 16 16">
                  <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zM8.5 4.5a.5.5 0 0 0-1 0v3h-3a.5.5 0 0 0 0 1h3v3a.5.5 0 0 0 1 0v-3h3a.5.5 0 0 0 0-1h-3v-3z" />
                </svg>
              </button>
            </div>
            <div className="col-6">
              <button
                className='btn btn-primary w-100'
                onClick={() => {
                  setShowPreview(!showPreview);
                  document.querySelector('.canvas-container')?.classList.toggle('d-none');
                  document.getElementById("img-input")?.classList.toggle("d-none");
                }}
              >Show {showPreview ? "original" : "preview"}</button>
            </div>
          </div>

          <form
            name='parameters'
            id="parameter-form"
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
                <Radio name="lod" col={4} value={"low"} text={"Low"} onChange={startShapification} checked />
                <Radio name="lod" col={4} value={"medium"} text={"Medium"} onChange={startShapification} />
                <Radio name="lod" col={4} value={"high"} text={"High"} onChange={startShapification} />
              </div>
            </div>

            {/* color style */}
            <div className='mb-3'>
              <h4>Color style</h4>
              <div className='row mb-2'>
                <Radio name="color" col={6} value={"mondrian"} text={"Abstract"} onChange={startShapification} checked />
                <Radio name="color" col={6} value={"average"} text={"Average"} onChange={startShapification} />
              </div>

              <div className='row'>
                <Radio name="color" col={6} value={"vibrant"} text={"Vibrant"} onChange={startShapification} />
                <Radio name="color" col={6} value={"muted"} text={"Muted"} onChange={startShapification} />
              </div>
            </div>

            {/* border */}
            <div className='mb-3'>
              <label className='form-label' htmlFor='input-discard'>
                <h4>Border: {border}px</h4>
              </label>
              <input
                id="input-discard"
                name="border"
                className='form-range'
                type="range"
                min={0} max={25} step={1}
                defaultValue={border}
                title="Thickness of the border around each segment"
                onChange={e => {
                  setBorder(parseInt(e.target.value));
                  startShapification();
                }}
              />
            </div>

            {/* shape */}
            <div className='mb-3'>
              <h4>Shape</h4>
              <div className='row mb-2'>
                <Radio name="shape" col={6} value={"aabb"} text={"AABB"} onChange={startShapification} checked />
                <Radio name="shape" col={6} value={"obb"} text={"OBB"} onChange={startShapification} />
              </div>

              <div className='row'>
                <Radio name="shape" col={6} value={"convex"} text={"Convex"} onChange={startShapification} />
                <Radio name="shape" col={6} value={"concave"} text={"Concave"} onChange={startShapification} />
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
          style={{ gridArea: "preview", position: "relative", maxHeight: "100%" }}
          className="d-flex flex-column justify-content-center align-items-center"
        >
          {/* canvas */}
          {img ?
            <>
              <img id="img-input" className='d-none' alt='Provided by user' src={img} onLoad={e => {
                startShapification();
                // const bounds = (e.target as HTMLImageElement).getBoundingClientRect();
                // const canvas = document.getElementById("canvas") as HTMLCanvasElement;
                // canvas.width = bounds.width;
                // canvas.height = bounds.height;
              }} />
              <canvas
                id="as-canvas"
                className='border border-dark border-2 m-auto'
                height={250}
              />
            </> :
            <div className='center'>
              <div>
                {/* <label htmlFor="formFileLg" className="form-label">Large file input example</label> */}
                <button className='btn btn-primary' onClick={() => {
                  document.getElementById("formFileLg")?.click();
                }}>Upload</button>
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
