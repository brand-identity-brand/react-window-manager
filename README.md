# React Window Manager

React Window Manager is a react context that manages element rendering with:
 - windowSpecsRef:
```javascript
{
    [windowId]:{ 
        // Component: '', //this key is used by react-desktop-environment, you can also add your own key value pairs
        registeredId: [],
        props: {
            initialPosition: { left: 100, top: 100 },
            initialSize: { width: 100, height: 100 },
            initialTitle: ''
        },
        windows: {
            active: [],
            hidden: [],
            closed: []
        },
        states: {}
    }, 
    [windowId]:{
        registeredId: [ anotherWindowId, anotherWindowId, ... ],
        props: {
            initialPosition: { left: 100, top: 100 },
            initialSize: { width: 100, height: 100 },
            initialTitle: '',
            ['custom prop key']: 'custom prop value',
            ...
        },
        // Component: Component.name,
        windows: {
            active: [ childWindowId, childWindowId ],
            hidden: [ childWindowId, childWindowId, ...],
            closed: [ `${childWindowId}@${unixtimestamp}`, ...]
        },
        states: {
            ['state key']: 'state value',
            ...
        }
    }
}
```

## Installation

```zsh
npm i react-window-manager
```

## Usage
```javascript
// main.jsx
import React, { useContext } from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'
import App from './App'
import WindowManagerRegistryProvider, {WindowManagerRegistryContext} from './lib';

ReactDOM.createRoot(document.getElementById('root')).render(<Wrapper/>);

function Wrapper(){
  return (
    <React.StrictMode>
      <WindowManagerRegistryProvider>
        <Main/>
      </WindowManagerRegistryProvider>
    </React.StrictMode>
  )
}

function Main(){
  const { initWindow } = useContext(WindowManagerRegistryContext);
  initWindow('app');
  return (
      <App/>
  )
}
```
```javascript
import { useContext, useState, useEffect, useRef } from 'react';

import { WindowManagerContext, WindowManagerProvider, WindowManagerRegistryContext } from './lib';

function App() {
    const { initWindow } = useContext(WindowManagerRegistryContext)
    const { windows, registerWindow, hideWindow, unhideWindow, closeWindow} = useContext(WindowManagerContext);

    const [ idToAction, setIdToAction] = useState(0);
    
    return (
        <div style={{ width: '100vw', height: '100vh'}}>
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
```