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
    closeWindow,
    getMinimisedWindowsInDesktop
  } = useContext(WindowManagerContext);

  const { minimisedWindowIds, minimiseWindow, restoreMinimisedWindow } = useMinimise();

  const windowIds = Object.keys( windowsTree[0] );
  const filteredWindowIds = windowIds.filter( windowId => !minimisedWindowIds.includes(windowId) );
// console.log('tree @ frontend',windowsTree)

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
              },//(id) => {  minimiseWindow(id); },
              minimise_onClick: minimiseWindow
            }, 0, { minimisedWindowIds, minimiseWindow, restoreMinimisedWindow });
          }}>
            new window
        </button>
        <div>
          {JSON.stringify(getMinimisedWindowsInDesktop(0, minimisedWindowIds))}
        </div>
      </div>
  )
}

export default App;


function Window({...props}){
  const {
    id,
    initialZIndex,
    onClick,
    minimise_onClick,
    useMinimise
  }=props;
  console.log(useMinimise)
  return ( 
    <div style={{
      padding: '20px',
      border: '1px solid black'
    }}>
      <button onClick={()=>{
        // console.log('clicked window show id', id)
        onClick(id)
        }}>close</button>
      <button onClick={()=>{
    // console.log('clicked window show id', id)
        minimise_onClick(id)
        }}>minimise</button>
    </div>
  )
}