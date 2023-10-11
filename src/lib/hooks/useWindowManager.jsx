import { useRef, useContext, useEffect, useState, useMemo } from "react";

import { WindowManagerRegistryContext } from "../context/WindowManagerRegistry";


export default function useWindowManager(currentWindowId){
    const {
        getAllWindowSpecs,
        setAllWindowSpecs,
        // doesTargetWindowIdExist,
        getTargetWindowSpecsById,
        setTargetWindowSpecsById,
        reassginTargetWindowId, 
        initWindow
    } = useContext(WindowManagerRegistryContext);

    // below const are used once when hydrating from last session.
    // const { current: { windows: windowsFromLastSession, states: statesFromLastSession }} = useRef( getTargetWindowSpecsById(currentWindowId, true) );
    const [ windows, setWindows ] = useState(getTargetWindowSpecsById(currentWindowId, true).windows);
    const { active, hidden, closed } = windows;

    const statesRef = useRef(getTargetWindowSpecsById(currentWindowId, true).states);
    const [ states, setStates ] = useState(statesRef.current);  //? statesFromLastSession : {}
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
    function initRegisterWindow(windowId, windowSpecs){
        const { Component, ...rest } = windowSpecs;
        initWindow(windowId, {
            Component: Component.displayName,
            ...rest
            // props: {
            //     initialTitle : windowId,
            //     initialPosition: {
            //         left: 10,
            //         top: 10
            //     },
            //     initialSize: {
            //         width: 700,
            //         height: 330
            //     }
            // }
        });
        registerWindow(windowId); 
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
            setTargetWindowSpecsById(currentWindowId, { windows: next } );
            return next;
        });
    }
    // loop through registeredId
    // update all windows spec if applicable
    // TODO: this will support window historys. specifics are to be determined
    function closeWindow(childWindowId, status){
        // prepare closed windowId for archiving.
        const timestamp = Date.now();
        const nextChildWindowId = `${childWindowId}@${timestamp}`;
        // get child window's children
        // { active, hidden, closed } = childenWindowSpecs.windows
        const childWindowSpecs = getTargetWindowSpecsById(childWindowId);
        const childWindowRegisteredIn = childWindowSpecs.registeredIn
        // update registeredIn spec of the childWindow
        const nextChildWindowRegisteredIn = childWindowRegisteredIn.filter( parentWindowId => parentWindowId !== currentWindowId );
        setTargetWindowSpecsById( childWindowId, { registeredIn: nextChildWindowRegisteredIn });
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
                    setTargetWindowSpecsById(currentWindowId, { windows: next})
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
                    setTargetWindowSpecsById(currentWindowId, { windows: next})
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
                    setTargetWindowSpecsById(currentWindowId, { windows: next})
                    return next;
                });
            }
        }

        if ( getTargetWindowSpecsById(childWindowId).registeredIn.length === 0 ) {
            reassginTargetWindowId(childWindowId, nextChildWindowId)
        } else {
            const allWindowSpecs = getAllWindowSpecs();
            const nextAllWindowSpecs = { ...allWindowSpecs, [nextChildWindowId]: childWindowSpecs }
            setAllWindowSpecs( nextAllWindowSpecs )
        }
        
    }
    function temp_closeWindow(childWindowId, status){
        // * in the complete version this would attach unix timestamp at close
        const nextChildWindowId = childWindowId;

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
                    setTargetWindowSpecsById(currentWindowId, { windows: next})
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
                    setTargetWindowSpecsById(currentWindowId, { windows: next})
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
                    setTargetWindowSpecsById(currentWindowId, { windows: next})
                    return next;
                });
            }
        }
        // * udpate registeredIn
        // TODO: support multiple registration
        // ! this does not support multiple registration
        // ! possible solution:
        //  ! register all setWindows and setStates to WindowManagerRegistrationContext
        //  ! loop or use recursion to apply changes to all parent windows
        //  ! e.g. closeWindow(childWindowId, parentWindowId, status)
        // removes the window from allSpecs
        const allWindowSpecs = getAllWindowSpecs();
        const { [nextChildWindowId]: childWindowSpecs, ...nextAllWindowSpecs } = allWindowSpecs;
        setAllWindowSpecs( ...nextAllWindowSpecs )
    }
    // function isWindowStatesReady(stateTitlesArray=[]){

    //     if ( stateTitlesArray.length ) {
    //         const anArrayOfBoolean = stateTitlesArray.map( title=> states.hasOwnProperty(title))
    //         const result = !anArrayOfBoolean.includes(false);
    //         return result;
    //     }
    //     return Object.keys(states).length > 0;
    // }
    // this hacks around react setState rerender
    // ! be aware of this anti pattern
    function setWindowStateWithoutRerendering(title, value){
        statesRef.current[title] = value;
        // states[title] = value;
    }
    // initialise state[title] without calling useWindowState for code readability
    // if state[title] doesnt exist it will return value, if exist it will return state[title]
    function initWindowState(title, value){
        if ( states.hasOwnProperty(title) ) { //getTargetWindowSpecsById(currentWindowId).states.hasOwnProperty('title') 
            return states[title]
        }
        setWindowStateWithoutRerendering(title, value);
        states[title] = value;
        syncWindowState();
        return states[title];
    }

    function setWindowState(value, refresh=true, title){
        setWindowStateWithoutRerendering(title, value);
        if ( refresh ) {
            // ! potential object refrence issue
            setStates({...statesRef.current})
            // setStates((prev)=>{
            //     prev[title] = value;
            //     // setTargetWindowSpecsById(currentWindowId, { states: prev })
            //     return {...prev};
            // });
        }
        syncWindowState();
    }

    function getWindowState(title){
        return states[title]
    }
    function syncWindowState(){
        setTargetWindowSpecsById(currentWindowId, { states: {...statesRef.current }})
    }
    function useWindowState(title, value){
        if ( states.hasOwnProperty(title) ) { //getTargetWindowSpecsById(currentWindowId).states.hasOwnProperty('title') 
            return [ states[title], (value, refresh=true)=>setWindowState(value, refresh, title) ]
        }
        // * below line of code initialises new state by adding it directly to the current states
        // * this ensures returned states[title] is not undefined and will not trigger a rerender
        // * rerender will occure when app runs setWindowState
        // * this is a needed anti pattern (react) or the code could get messy with useEffects
        states[title] = value;
        syncWindowState();
        return [ states[title], (value, refresh=true)=>setWindowState(value, refresh, title) ]
    };
    // useEffect(()=>{
    //     setTargetWindowSpecsById(currentWindowId, { windows: windows});
    // },[windows])
    // useEffect(()=>{
    //     setTargetWindowSpecsById(currentWindowId, { states: states});
    // },[states])
    return {
        currentWindowId,
        windows,
        states,
        //
        registerWindow,
        initRegisterWindow,
        // controllers
        liftWindowToTop,
        hideWindow,
        unhideWindow,
        // TODO
        closeWindow: temp_closeWindow,
        // states
        // isWindowStatesReady,
        initWindowState,
        setWindowStateWithoutRerendering,
        setWindowState,
        getWindowState,
        syncWindowState,
        useWindowState,
    }
}
