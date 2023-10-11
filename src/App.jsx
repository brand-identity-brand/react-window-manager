import { useContext, useEffect, useState } from 'react';

import { WindowManagerContext, WindowManagerProvider, WindowManagerRegistryContext } from './lib';

function App() {
    const { initWindow, getAllWindowSpecs } = useContext(WindowManagerRegistryContext)
    const { windows, registerWindow, hideWindow, unhideWindow, closeWindow} = useContext(WindowManagerContext);

    const [ idToAction, setIdToAction] = useState(0);
    useEffect(()=>{
        console.log(getAllWindowSpecs())
    })
    return (
        <div style={{ width: '100vw', height: '100vh'}}>
            {/* { filteredWindowIds.map( renderWindow ) } */}
            <button onClick={()=>{
                initWindow(idToAction)
                registerWindow(idToAction) 
            }}> initWindow </button> <br/>

            <input onChange={(e)=>{
                setIdToAction(e.target.value)
            }}></input><br/>
            <button onClick={()=>{ hideWindow(idToAction) }}> hideWindow </button><br/>
            <button onClick={()=>{ unhideWindow(idToAction) }}> unhideWindow </button><br/>
            <button onClick={()=>{ closeWindow(idToAction) }}> closeWindow </button><br/>
            
            { `active: ${ JSON.stringify(windows.active) }`}<br/>
            { `hidden: ${ JSON.stringify(windows.hidden) }`}<br/>
            { `closed: ${ JSON.stringify(windows.closed) }`}<br/>
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