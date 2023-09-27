import { useState, useRef } from "react";

export default function useWindowManagerRegistry(windowSpecsFromLastSession, syncToDataBaseFunctions) {

    const [ hasUnsavedStates, setHadUnsavedStates ] = useState(false); //tells the app if data are synced to database;

    const windowSpecsRef = useRef( windowSpecsFromLastSession ? windowSpecsFromLastSession : {} );
    function getAllWindowSpecs(){
        return windowSpecsRef.current
    }
	// {
	// 	"id": {
	// 		Component: 'Component.name',
	// 		props: {},
	// 		registeredIn: ['parentId'],
	// 		windows: {
	// 			active: ['childId'],
	// 			hidden: [],
	// 			closed: []
	// 		},
	// 		states: {}
	// 	}
	// }
    
    function doesTargetWindowIdExist(targetWindowId){
        return windowSpecsRef.current.hasOwnProperty(targetWindowId);
    }
    function getTargetWindowSpecsById(targetWindowId){
        return windowSpecsRef.current[targetWindowId];
    }
    /**
     * setTargetWindowSpecsById('WarehousgetTargetWindowSpecsByIde', { windows: { active: ['Edit'], hidden: [], closed: [] } })
     * @param {*} targetWindowId 
     * @param {*} anObjectOfSpecsToUpdate 
     * @returns 
     */
    function setTargetWindowSpecsById(targetWindowId, anObjectOfSpecsToUpdate){
        const targetWindowSpecs = windowSpecsRef.current[targetWindowId];
        const nextTargetWindowSpecs = { ...targetWindowSpecs, ...anObjectOfSpecsToUpdate };
        windowSpecsRef.current[targetWindowId] = nextTargetWindowSpecs;
        // setHadUnsavedStates(true);
        return windowSpecsRef.current;
    }
    /** */
    const defaultWindowSpecs = { Component:'',props:{},states:{},windows:{active:[],hidden:[],closed:[]},registeredIn:[] }
    function initWindow(newWindowId, specs=defaultWindowSpecs){
        // if windowId exist, abort
        if ( windowSpecsRef.current.hasOwnProperty(newWindowId) ) {
            // TODO: bring the window of newWindowId to the top
        } else {
            const result = { ...defaultWindowSpecs, ...specs }
            windowSpecsRef.current[newWindowId] = result;
        }

        // setHadUnsavedStates(true);
    }
// !
    // function registerWindow(childWindowId, parentWindowId, mode = 'active'){
    //     const { [mode]: addToThisArray, ...rest } =  windowSpecsRef.current[parentWindowId].windows; //getTargetWindowSpecsById(parentWindowId).
    //     setTargetWindowSpecsById(parentWindowId, { windows: {
    //         [mode]: [...addToThisArray, childWindowId], ...rest
    //     } });
    //     // setHadUnsavedStates(true);
    // }

    function reassginTargetWindowId(targetWindowId, nextWindowId){
        const { [targetWindowId]: targetWindowSpecs, ...otherWindowIds } = windowSpecsRef.current;
        // rename key
        const next = { [nextWindowId]: targetWindowSpecs, ...otherWindowIds };
        // rename Id in all affected parentWindow.windows 
        targetWindowSpecs.registeredIn.forEach( parentWindowId => {
            const parentWindowSpecs = windowSpecsRef.current[parentWindowId];
            const { active, hidden, closed }= parentWindowSpecs.windows;
            const nextActive = active.map( childWindowId => { return childWindowId===targetWindowId? nextWindowId : childWindowId });
            const nextHidden = hidden.map( childWindowId => { return childWindowId===targetWindowId? nextWindowId : childWindowId });
            const nextClosed = closed.map( childWindowId => { return childWindowId===targetWindowId? nextWindowId : childWindowId });
            setTargetWindowSpecsById(parentWindowId, {windows: {
                active: nextActive,
                hidden: nextHidden,
                closed: nextClosed
            }})
        });
        // rename in specs
        windowSpecsRef.current = next;
        // setHadUnsavedStates(true);
    }

    return {
        getAllWindowSpecs,
        doesTargetWindowIdExist,
        getTargetWindowSpecsById,
        setTargetWindowSpecsById,
        initWindow,
        // registerWindow,
        reassginTargetWindowId
    }
}