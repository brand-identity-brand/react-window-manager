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
    // <WindowManagerProvider id={'app'}>
      <App/>
    // </WindowManagerProvider>
  )
}