import React from 'react';
import './styles/App.css';
import 'bootstrap/dist/css/bootstrap.min.css';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>Arty Shapes</h1>
        <h3>by Anton & Georg</h3>
      </header>

      <main>
        <div className='container-lg' style={{minHeight:"100vh"}}>
          <div className='row align-items-strech'>

			<div className='col-12 col-lg-6 row'>
				<div className='col-12'>
          			<img src="/input1.jpg" alt="Source" className='border border-primary' height={250}/>
				</div>
				<div className='col-12'>
          			<img src="/segmentation1.png" alt="Segmentation" className='border border-primary' height={250}/>
				</div>
			</div>

			<div className='col-12 col-lg-6'>
          		<canvas id="as-canvas" style={{width: "100%"}} className='border border-primary m-auto'/>
			</div>

		  </div>
        </div>
      </main>
    </div>
  );
}

export default App;
