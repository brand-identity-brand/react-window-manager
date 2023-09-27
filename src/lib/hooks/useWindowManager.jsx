import { useRef, useContext, useEffect, useState, useMemo } from "react";

import { WindowManagerRegistryContext } from "../context/WindowManagerRegistry";


export default function useWindowManager(currentWindowId){
    const {
        // doesTargetWindowIdExist,
        getTargetWindowSpecsById,
        setTargetWindowSpecsById,
        reassginTargetWindowId  
    } = useContext(WindowManagerRegistryContext);

    // below const are used once when hydrating from last session.
    const { windows: windowsFromLastSession, states: statesFromLastSession } = getTargetWindowSpecsById(currentWindowId);
    const [ windows, setWindows ] = useState(windowsFromLastSession);
    const { active, hidden, closed } = windows;
    const [ states, setStates ] = useState(statesFromLastSession); 
    // utility functions
    function registerWindow(childWindowId){
        const isSelfReferncing = childWindowId === currentWindowId;
        const isChildAlreadyRegistered = active.includes(childWindowId) || hidden.includes(childWindowId);
        //checker0
        if ( isSelfReferncing || isChildAlreadyRegistered ){

        }else{
            //checker0 passedsetTargetWindowSpecsById
            setWindows((prev)=> {
                const next = {
                    active: [...prev.active, childWindowId],
                    hidden: prev.hidden,
                    closed: prev.closed
                };
                setTargetWindowSpecsById(currentWindowId, {windows: next});
                return next;
            });
            const { registeredIn: prevRegisteredIn } = getTargetWindowSpecsById(childWindowId);
            setTargetWindowSpecsById(childWindowId, {registeredIn: [...prevRegisteredIn, currentWindowId]});
        }
    }
    /* pass below functions from parent Context*/
    function liftWindowToTop(childWindowId){
        // do nothing if window is already at the top
        const windowPosition = active.indexOf(childWindowId);
        if ( windowPosition === active.length - 1 ) return;
        
        // rearrang childWindowId to the last position.
        setWindows((prev)=> {
            const nextWithoutId = prev.active.filter( item => {
                if (item === childWindowId) return false;
                return true;
            });
            const next = {
                active: [...nextWithoutId, childWindowId],
                hidden: prev.hidden,
                closed: prev.closed
            };
            setTargetWindowSpecsById(currentWindowId, { windows: next });
            return next;
        });
    }
    /**
     * checker0: if id is duplicated abort appending to hiddenWindowsRef.
     * @param {*} childWindowId 
     */

    function hideWindow(childWindowId){

        const nextActive = active.filter( (value) => {
            if ( value === childWindowId ) return false;
            return true;
        });
        //checker0
        if ( nextActive.length === active.length ) return;
        //checker0 passed
        setWindows((prev)=> {
            const next = {
                active: nextActive,
                hidden: [...prev.hidden, childWindowId],
                closed: prev.closed
            }
            setTargetWindowSpecsById(currentWindowId, {windows: next});
            return next;
        });
    }

    function unhideWindow(childWindowId){
        const nextHidden = hidden.filter( (value) => {
            if ( value === childWindowId ) return false;
            return true;
        });
        //checker0
        if ( nextHidden.length === hidden.length ) return;
        //checker0 passed
        setWindows((prev)=> {
            const next = {
                active: [...prev.active, childWindowId],
                hidden: nextHidden,
                closed: prev.closed
            }
            setTargetWindowSpecsById(currentWindowId, { window: next } );
            return next;
        });
    }

    function closeWindow(childWindowId, status){
        const timestamp = Date.now();
        const nextChildWindowId = `${childWindowId}@${timestamp}`;
        switch (status) {
            case 'active': {
                //checker0
                const fromActive = active.includes(childWindowId);
                if ( fromActive === false ) break;
                //checker0 passed
                const nextActive = active.filter( (value) => {
                    if ( value === childWindowId ) return false;
                    return true;
                });
                setWindows((prev)=> {
                    const next = {
                        active: nextActive,
                        hidden: prev.hidden,
                        closed: [...prev.closed, nextChildWindowId]
                    };
                    setTargetWindowSpecsById(currentWindowId, { window: next})
                    return next;
                });
                break;
            }
            case 'hidden': {
                //checker0
                const fromHidden = hidden.includes(childWindowId);
                if (fromHidden === false ) break;
                //checker0 passed
                const nextHidden = hidden.filter( (value) => {
                    if ( value === childWindowId ) return false;
                    return true;
                });
                setWindows((prev)=> {
                    const next = {
                        active: prev.active,
                        hidden: nextHidden,
                        closed: [...prev.closed, nextChildWindowId]
                    }
                    setTargetWindowSpecsById(currentWindowId, { window: next})
                    return next;
                });
                break;
            }
            default: {
                //checker0
                const fromActive = active.includes(childWindowId);
                const fromHidden = hidden.includes(childWindowId);
                if ( fromActive === false && fromHidden === false ) break;
                //checker0 passed
                const nextActiveHidden = { active, hidden };
                if ( fromActive === true ) {
                    nextActiveHidden.active = active.filter( (value) => {
                        if ( value === childWindowId ) return false;
                        return true;
                    });
                }
                if ( fromHidden === true ) {
                    nextActiveHidden.hidden = hidden.filter( (value) => {
                        if ( value === childWindowId ) return false;
                        return true;
                    });
                }
                setWindows((prev)=> {
                    const next = {
                        active: nextActiveHidden.active,
                        hidden: nextActiveHidden.hidden,
                        closed: [...prev.closed, nextChildWindowId]
                    }
                    setTargetWindowSpecsById(currentWindowId, { window: next})
                    return next;
                });
            }
        }
        reassginTargetWindowId(childWindowId, nextChildWindowId)
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
            setTargetWindowSpecsById(currentWindowId, { states: prev })
            return prev;
        });
    }
    function getWindowState(title){
        return states[title]
    }

    function useWmState(title, value){
        if ( states.hasOwnProperty(title) ) { //getTargetWindowSpecsById(currentWindowId).states.hasOwnProperty('title') 
            return [ states[title], (value)=>setWindowState(title, value) ]
        }
        setWindowState(title, value);
        return [ states[title], (value)=>setWindowState(title, value) ]
    };

    return {
        currentWindowId,
        windows,
        //
        registerWindow: registerWindow,
        //
        liftWindowToTop: liftWindowToTop,
        hideWindow: hideWindow,
        unhideWindow: unhideWindow,
        closeWindow: closeWindow,
        //
        isWindowStatesReady,
        // setWindowState,
        // getWindowState,
        useWmState
    }
}
