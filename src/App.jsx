import { useContext, useState, useEffect, useRef } from 'react';
import { WindowManagerContext } from './lib';

// import './App.css'

function App() {
  const  {
    windowsRef,
    windowsTree,
    createWindow,
    renderWindow,
    useMinimise,
    closeWindow
  } = useContext(WindowManagerContext);

  const { minimisedWindowIds, minimiseWindow, restoreMinimisedWindow } = useMinimise([]);

  const windowIds = Object.keys( windowsTree[0] );
  const filteredWindowIds = windowIds.filter( windowId => !minimisedWindowIds.includes(windowId) );
console.log('tree @ frontend',windowsTree)
  return (

      <div
        style={{
          width: '100vw',
          height: '100vh'
        }}
      >
      { filteredWindowIds.map( renderWindow ) }
        <button 
          onClick={() => {
            createWindow(Window, {
              onClick: (id) => {  
                closeWindow(id); 
              }//(id) => {  minimiseWindow(id); },
            }, 0);
          }}>
            new window
        </button>
      </div>
  )
}

export default App;


function Window({...props}){
  const {
    id,
    initialZIndex,
    onClick
  }=props;
  return ( <div>
    <button onClick={()=>{
      // console.log('clicked window show id', id)
      onClick(id)
      }}>close</button>
  </div>)
}