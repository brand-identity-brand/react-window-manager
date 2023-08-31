import { useRef, useContext, useEffect, useState, useMemo } from "react";

import useLocalStorageState from './useLocalStorageState';

import { WindowManagerRegistryContext } from "../context/WindowManagerRegistry";



export default function useWindowManager(id){
    const {
        // isLocalStorageHydrated,
        getNextIdCounter,
        initWindow
    } = useContext(WindowManagerRegistryContext);
    // console.log( id, localStorage.getItem(`${id}`)  )
    const localStorageItemString = () => localStorage.hasOwnProperty(`${id}`)
        ? localStorage.getItem(`${id}`) 
        : (()=>{ 
            localStorage.setItem(`${id}`, '{}'); return '{}'
    })();

    const localStorageItemObject = JSON.parse( localStorageItemString() );

    const defaultWindowsAtom = localStorageItemObject?.hasOwnProperty('windows')
        ? localStorageItemObject.windows 
        : (()=>{
            localStorageItemObject['windows'] = {
                activeWindows: [],
                hiddenWindows: [],
                closedWindows: []
            };
            localStorage.setItem(`${id}`, JSON.stringify(localStorageItemObject))
            return localStorageItemObject.windows
        })()
    ;
    const defaultStatesAtom = localStorageItemObject?.hasOwnProperty('states')
        ? localStorageItemObject.states
        : (()=>{
            localStorageItemObject['states'] = {};
            localStorage.setItem(`${id}`, JSON.stringify(localStorageItemObject))
            return localStorageItemObject.states;
        })()
    ;

    // const windowsAtom = useMemo(() => atom(`${id}`,'windows', defaultWindowsAtom ),[]);
    // const statesAtom = useMemo(() => atom(`${id}`,'states', defaultStatesAtom),[]);

    // const [ windows, setWindows] = useAtom(windowsAtom); 
    // const [ states, setStates] = useAtom(statesAtom); 
    const [ windows, setWindows] = useLocalStorageState(id, 'windows', defaultWindowsAtom ); 
    const [ states, setStates] = useLocalStorageState(id, 'states', defaultStatesAtom); 

    const { activeWindows, hiddenWindows, closedWindows } = windows;

    /**
     * register child window to current parent window
     * checker0: if id is duplicated abort initialisation.
     * @param {*} id 
     */
    function registerWindow(id){
        //checker0
        if ( activeWindows.includes(id) ) return;
        //checker0 passed
        setWindows((prev)=> {
            return {
                activeWindows: [...prev.activeWindows, id],
                hiddenWindows: prev.hiddenWindows,
                closedWindows: prev.closedWindows
            }
        });
    }
    /* pass below functions from parent Context*/
    function liftWindowToTop(id){
        // do nothing if window is already at the top
        const windowPosition = activeWindows.indexOf(id);
        if ( windowPosition === activeWindows.length - 1 ) return;
        
        // rearrang id to the last position.
        setWindows((prev)=> {
            const nextWithoutId = prev.activeWindows.filter( item => {
                if (item === id) return false;
                return true;
            })
            return {
                activeWindows: [...nextWithoutId, id],
                hiddenWindows: prev.hiddenWindows,
                closedWindows: prev.closedWindows
            }
        });
    }
    /**
     * checker0: if id is duplicated abort appending to hiddenWindowsRef.
     * @param {*} id 
     */

    function hideWindow(id){

        const next = activeWindows.filter( (value) => {
            if ( value === id ) return false;
            return true;
        });
        //checker0
        if ( next.length === activeWindows.length ) return;
        //checker0 passed
        setWindows((prev)=> {
            return {
                activeWindows: next,
                hiddenWindows: [...prev.hiddenWindows, id],
                closedWindows: prev.closedWindows
            }
        });
    }

    function unhideWindow(id){
        const next = hiddenWindows.filter( (value) => {
            if ( value === id ) return false;
            return true;
        });
        //checker0
        if ( next.length === hiddenWindows.length ) return;
        //checker0 passed
        setWindows((windows)=> {
            return {
                activeWindows: [...windows.activeWindows, id],
                hiddenWindows: next,
                closedWindows: windows.closedWindows
            }
        });
    }

    function closeWindow(id, status){
        switch (status) {
            case 'active': {
                //checker0
                const fromActive = activeWindows.includes(id);
                if ( fromActive === false ) break;
                //checker0 passed
                const next = activeWindows.filter( (value) => {
                    if ( value === id ) return false;
                    return true;
                });
                setWindows((windows)=> {
                    return {
                        activeWindows: next,
                        hiddenWindows: windows.hiddenWindows,
                        closedWindows: [...windows.closedWindows, id]
                    }
                });
                break;
            }
            case 'hidden': {
                //checker0
                const fromHidden = hiddenWindows.includes(id);
                if (fromHidden === false ) break;
                //checker0 passed
                const next = hiddenWindows.filter( (value) => {
                    if ( value === id ) return false;
                    return true;
                });
                setWindows((windows)=> {
                    return {
                        activeWindows: windows.activeWindows,
                        hiddenWindows: next,
                        closedWindows: [...windows.closedWindows, id]
                    }
                });
                break;
            }
            default: {
                //checker0
                const fromActive = activeWindows.includes(id);
                const fromHidden = hiddenWindows.includes(id);
                if ( fromActive === false && fromHidden === false ) break;
                //checker0 passed
                const next = { activeWindows, hiddenWindows };
                if ( fromActive === true ) {
                    next.activeWindows = activeWindows.filter( (value) => {
                        if ( value === id ) return false;
                        return true;
                    });
                }
                if ( fromHidden === true ) {
                    next.hiddenWindows = hiddenWindows.filter( (value) => {
                        if ( value === id ) return false;
                        return true;
                    });
                }
                setWindows((windows)=> {
                    return {
                        activeWindows: next.activeWindows,
                        hiddenWindows: next.hiddenWindows,
                        closedWindows: [...windows.closedWindows, id]
                    }
                });
            }
        }
    }
    function isWindowStatesReady(stateTitlesArray=[]){

        if ( stateTitlesArray.length ) {
            const anArrayOfBoolean = stateTitlesArray.map( title=> states.hasOwnProperty(title))
            const result = !anArrayOfBoolean.includes(false);
            return result;
        }
        return Object.keys(states).length > 0;
    }
    function setWindowState(title, value){
        setStates((prev)=>{
            prev[title] = value;
            return prev;
        });
    }
    function getWindowState(title){

        return states[title]
    }

    return {
        id,
        activeWindows: activeWindows,
        hiddenWindows: hiddenWindows,
        closedWindows: closedWindows,
        //
        getNextIdCounter: getNextIdCounter, //function
        initWindow: initWindow,//function,
        registerWindow: registerWindow,
        //
        liftWindowToTop: liftWindowToTop,
        hideWindow: hideWindow,
        unhideWindow: unhideWindow,
        closeWindow: closeWindow,
        //
        isWindowStatesReady,
        setWindowState,
        getWindowState
    }
}
