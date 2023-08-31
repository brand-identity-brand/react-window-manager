import { useContext, useState, useEffect, useRef } from 'react';

import { WindowManagerContext, WindowManagerProvider } from './lib';

function App() {
     const { getNextIdCounter, initWindow, registerWindow, hideWindow, unhideWindow, closeWindow, setData,...windows} = useContext(WindowManagerContext);

    const [ idToAction, setIdToAction] = useState(0);
    
    return (
        <div style={{ width: '100vw', height: '100vh'}}>
            {/* { filteredWindowIds.map( renderWindow ) } */}
            <button onClick={()=>{
                const id = getNextIdCounter();
                initWindow(id)
                registerWindow(id) 
            }}> initWindow </button> <br/>

            <input onChange={(e)=>{
                setIdToAction(e.target.value)
            }}></input><br/>
            <button onClick={()=>{ hideWindow(idToAction) }}> hideWindow </button><br/>
            <button onClick={()=>{ unhideWindow(idToAction) }}> unhideWindow </button><br/>
            <button onClick={()=>{ closeWindow(idToAction) }}> closeWindow </button><br/>
            
            { `active: ${ JSON.stringify(windows.activeWindows) }`}<br/>
            { `hidden: ${ JSON.stringify(windows.hiddenWindows) }`}<br/>
            { `closed: ${ JSON.stringify(windows.closedWindows) }`}<br/>
        </div>
    )
}

export default function WrappedHome(){
    return (
        <WindowManagerProvider id={'app'}>
            <App/>
        </WindowManagerProvider>
    )
}