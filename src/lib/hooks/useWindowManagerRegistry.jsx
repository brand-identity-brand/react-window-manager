import { useState, useRef } from "react";
import { deepCopyObj } from "../utils";

/**
 * 
 * @param {Object} windowSpecsFromLastSession
//  * @param {Object} syncWindowSpecsToDataBaseFunction - functions 
 * @returns 
 */
export default function useWindowManagerRegistry(windowSpecsFromLastSession){//, syncWindowSpecsToDataBaseFunction=()=>{}) {
    const windowSpecsRef = useRef( windowSpecsFromLastSession ? windowSpecsFromLastSession : {} );
    /**
     * 
     * @param {boolean} deepCopy 
     * @returns 
     */
    function getAllWindowSpecs(deepCopy=false){
        // console.log('accessed windowSpecsRef.current')
        if ( deepCopy ) return deepCopyObj(windowSpecsRef.current);
        return windowSpecsRef.current;
        
    }
    function setAllWindowSpecs(nextCurrent){
        // console.log('set windowSpecsRef.current')
        windowSpecsRef.current = nextCurrent
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
        
        return getAllWindowSpecs().hasOwnProperty(targetWindowId);
    }
    function getTargetWindowSpecsById(targetWindowId, deepCopy=false){
        return getAllWindowSpecs(deepCopy)[targetWindowId];
    }
    /**
     * setTargetWindowSpecsById('WarehousgetTargetWindowSpecsByIde', { windows: { active: ['Edit'], hidden: [], closed: [] } })
     * @param {*} targetWindowId 
     * @param {*} anObjectOfSpecsToUpdate 
     * @returns 
     */
    function setTargetWindowSpecsById(targetWindowId, anObjectOfSpecsToUpdate){
        const allWindowSpecsClone = getAllWindowSpecs();
        const targetWindowSpecs = allWindowSpecsClone[targetWindowId];
        const nextTargetWindowSpecs = { ...targetWindowSpecs, ...deepCopyObj(anObjectOfSpecsToUpdate) };
        setAllWindowSpecs({
            ...allWindowSpecsClone,
            [targetWindowId]: nextTargetWindowSpecs
        })
    }
    /** */
    const defaultWindowSpecs = { 
        Component:'',
        props:{},
        states:{},
        windows:{active:[],hidden:[],closed:[]},
        registeredIn:[] 
    }
    function initWindow(newWindowId, specs=defaultWindowSpecs){
        // if windowId exist, abort
        if ( getAllWindowSpecs().hasOwnProperty(newWindowId) ) {
            // TODO: bring the window of newWindowId to the top
        } else {
            const result = { ...defaultWindowSpecs, ...specs }
            const allWindowSpecsClone = getAllWindowSpecs();
            setAllWindowSpecs({[newWindowId]:result, ...allWindowSpecsClone});
        }
        // setHadUnsavedStates(true);
    }
// !
    // function registerWindow(childWindowId, parentWindowId, mode = 'active'){
    //     const { [mode]: addToThisArray, ...rest } =  getAllWindowSpecs()[parentWindowId].windows; //getTargetWindowSpecsById(parentWindowId).
    //     setTargetWindowSpecsById(parentWindowId, { windows: {
    //         [mode]: [...addToThisArray, childWindowId], ...rest
    //     } });
    //     // setHadUnsavedStates(true);
    // }

    function reassignTargetWindowId(targetWindowId, nextWindowId){
        const { [targetWindowId]: targetWindowSpecs, ...otherWindowIds } = getAllWindowSpecs();
        // rename key
        const next = { [nextWindowId]: targetWindowSpecs, ...otherWindowIds };
        // rename Id in all affected parentWindow.windows 
        targetWindowSpecs.registeredIn.forEach( parentWindowId => {
            const parentWindowSpecs = getAllWindowSpecs()[parentWindowId];
            const { active, hidden, closed }= parentWindowSpecs.windows;
            const nextActive = active.map( childWindowId => { return childWindowId===targetWindowId? nextWindowId : childWindowId });
            const nextHidden = hidden.map( childWindowId => { return childWindowId===targetWindowId? nextWindowId : childWindowId });
            const nextClosed = closed.map( childWindowId => { return childWindowId===targetWindowId? nextWindowId : childWindowId });
            setTargetWindowSpecsById(parentWindowId, {windows: {
                active: nextActive,
                hidden: nextHidden,
                closed: nextClosed
            }});
        });
        // rename in specs
        setAllWindowSpecs(next);
        // setHadUnsavedStates(true);
    }

    const hasUnsaveSpecsRef = useRef(false);
    function getHasUnsaveSpecs(){ 
        return hasUnsaveSpecsRef.current 
    };
    function setHasUnsaveSpecs( boolean ){ 
        hasUnsaveSpecsRef.current = boolean 
    };

    return {
        getAllWindowSpecs,
        setAllWindowSpecs,
        doesTargetWindowIdExist,
        getTargetWindowSpecsById,
        setTargetWindowSpecsById,
        initWindow,
        // registerWindow,
        reassignTargetWindowId,
        //
        getHasUnsaveSpecs,
        setHasUnsaveSpecs
    }
}