import React from 'react';
import './styles/App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import shapify from './utils/shapify';

const HEIGHT = 250;
const TEST_IMG = 2;

function App() {

  const [img, setImg] = React.useState(TEST_IMG);

  return (
    <div className="App">
      <header className="App-header">
        <h1>Arty Shapes</h1>
        <h3>APVM @ HPI</h3>
      </header>

      <main>

        <div className='container-lg' style={{ minHeight: "100vh" }}>
          <div className='row align-items-strech h-100'>

            {/* interactive elements */}
            <div className='col-12 row h-100 justify-content-between my-3'>
              <div className='col-6'>
                <select defaultValue={img} onChange={e => setImg(parseInt(e.target.value))}>
                  <option value={1}>Woman in city</option>
                  <option value={2}>Kitchen</option>
                </select>
              </div>

              <div className='col-6'>
                <button className='btn btn-primary' id="btn-shapify" onClick={shapify}>Shapify</button>
              </div>
            </div>

            {/* images */}
            <div className='col-12 col-lg-6 row h-100 justify-content-between'>
              <div className='col-12'>
                <img src={`segmentation${img}.png`} alt="Segmentation" height={HEIGHT} className='border border-primary' id='img-segmentation' />
              </div>
              <div className='col-12'>
                <img src={`input${img}.jpg`} alt="Source" height={HEIGHT} className='border border-primary' id='img-input' />
              </div>
            </div>

            {/* canvas */}
            <div className='col-12 col-lg-6'>
              <canvas id="as-canvas" className='border border-primary m-auto' />
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
