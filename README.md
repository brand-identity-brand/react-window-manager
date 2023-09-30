# React Window Manager

## Intro
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

## Refernece

### WindowManagerRegistry
#### Provider
```javascript
<WindowManagerRegistryProvider windowSpecsFromLastSession={Object} syncToDataBaseFunctions={Function}>
    {children}
<WindowManagerRegistryProvider/>
```
| Prop | Description |
| --- | ----------- |
| windowSpecsFromLastSession | windowSpecsRef.current default value. this could be retrieved from an external storage such as database or localStorage. |
| [TODO] syncToDataBaseFunctions | his function is meant to save the current windowSpecsRef to your external store |
#### Context 
```javascript
const {
    initWindow, // Function
    getAllWindowSpecs, // Function
    doesTargetWindowIdExist, // Function
    getTargetWindowSpecsById, // Function
    setTargetWindowSpecsById, // Function
    reassginTargetWindowId // Function
} = useContext( WindowManagerRegistryProviderContext );
```
| Item | Params | Description |
| - | - | - |
| ```initWindow()``` | windowId: String | this adds a windowId key into windowSpecsRef.current |
| ```getAllWindowSpecs()``` | n/a | deep copy and returns windowSpecsRef.current |
| ```doesTargetWindowIdExist()``` | targetWindowId: String | returns true if targetWindowId exists in windowSpecsRef.current else false |
| ```getTargetWindowSpecsById()``` | targetWindowId: String | deep copy and returns windowSpecsRef.current[targetWindowId] |
| ```setTargetWindowSpecsById()``` | targetWindowId: String, specFragment: Object | replace the spcified specs of the targetWindowId. e.g. { Component: 'NewComponent', registeredIn: [ 'parentWindowId' ] } will replace Component and state key in the spec |
| [usable] ```reassignTargetWindowId()``` | targetWindowId: String, newTargetWindowId: String | this renames targetWindowId in windowSpecsRef.current | 

### WindowManager
#### Provider
```javascript
<WindowManagerProvider id={String}/>
id = the current window id in windowSpecsRef.current
```
| Prop | Description |
| - | - |
| id | the id reference for provider to extract the correct windowSpecs from windowSpecsRef.current |
#### Context

```javascript
const {
    currentWindowId,
    // useState
    windows,
    states,
    // init
    registerWindow,
    // controllers
    liftWindowToTop,
    hideWindow,
    unhideWindow,
    closeWindow,
    // states
    isWindowStatesReady,
    initWindowState,
    setWindowState,
    getWindowState,
    useWindowState
} = useWindowManagerProvider
```
| Item | Params | Description |
| - | - | - |
| ```currentWindowId``` | n/a | the current windowId |
| ```windows``` | n/a | the current windows state of WindowContextProvider. windowSpecs.current[windowId] mirrors this value. this value is cleared when WindowContextProvider is unmounted. Useful for debugging but bad for readability |
| ```states``` | n/a | the current states state of WindowContextProvider. windowSpecs.current[windowId] mirrors this value. this value is cleared when WindowContextProvider is unmounted. Useful for debugging but bad for readability |
| ```registerWindow()``` | childWindowId: String | registers child window in current window |
| ```liftWindowToTop()``` | childWindowId: String | moves childWindowId to the end of active array in windows state. |
| ```hideWindow()``` | childWindowId: String | moves childWindowId to the end of hidden array in windows state from active array. |
| [usable]```closeWindow()``` | childWindowId: String | moves childWindowId to the end of closed array in windows state from active or hidden array. TODO: behaviour when the closed window has its own child or is registered in multiple windows |
| ```isWindowStatesReady()``` | stateTitlesArray: [String] | checks if states[title] is initialised in states state. |
| ```iniWindowState()``` | title: String, value: any | returns either states[title] if exist or mutate states by adding title:value in it, sync with windowSpecsRef then returns value. Use this when you need a state value that renders before or with WindowContextProvider. |
| ```setWindowState()``` | title: String, value: any | updates states[title] and sync with windowSpecsRef. Use this when you only need to set state[title] but not consume in the current WindowcontextProvider |
| ```getWindowState()``` | title: String | returns states[title]. Use this when you only need state[title] but not update state[title] in the current WindowcontextProvider  |
| ```useWindowState()``` | title: String, value: any | returns states[title] and it's setter. Like React.useState() |