import { createContext, useState, useEffect, useRef } from "react";
// import Window from "../component/Window";
import { htmlToElement } from "./utils";

export const WindowManagerContext = createContext(null);

// TODO: turn renderWindows into a .map callback so more is exposed to the frontend on implementation.

// TODO: the above change will purify the "Window Manager" and let the implementator decides how the window should be rendered.
// TODO: to furthur modularise this package useEffect needs to be removed from WindowManagerContextProvider because it adds stylistic utilities for windows do be rendered. It should be in the desktop enviornment package. 
// TODO: the state for each children should probably be in DesktopEnviornmentContext becuase WindowManagerContext should only handle windows-rendering-tree and its zIndex (or not) 
/**
 * <DesktopEnviornmentProvider>
 *     <WindowManagerContextProvider>
 *          <App/>
 *     </WindowManagerContextProvider>
 * </DesktopEnviornmentProvider>
 */
/**
 * 
 * @param {*} props 
 * @returns 
 */
export default function WindowManagerContextProvider({children}){
    /**
     * keeps the unique id for the last window generated. 
     * +1 after before assignment
     */
    const windowId = useRef(0);
    /**
     * keeps the addresses and init args of all windows
     * key as id
     * value as address, the closest parent window id on the right. 
     * objects in object instead of objects in array because I like using object[key] instead of array[array.findIndex()]
     * 
     *  { 
     *      80: {
     *          address: [ 12, 26, 70, 80 ],
     *          zIndex: 9,
     *          props: { ...props },
     *          Component: Component
     *      },
     *      3: {
     *          address: [ 12, 26, 70, 80, 3 ],
     *          zIndex: 9,
     *          props: { ...props },
                Component: Component
     *      }
     *  }
     */
    const windowsRef = useRef({}); 
    /**
     * keeps the window rendering tree. 
     * 
     *  {
     *      id:{ 
     *          id:{}, 
     *          id:{
     *              id:{}
     *          }, 
     *          id:{} 
     *      }, 
     *      id:{
     *          id:{}
     *          id:{}
     *      }
     *  }
     */
    const [ windowsTree, setWindowsTree ] = useState({}); //
    /**
     * keeps the current topZIndex. 
     * +1 before each assignment
     */
    const topZIndexRef = useRef(0);

    const helpers = {
        assignWindowId: () => {
            windowId.current = windowId.current + 1;
            return windowId.current;
        },
        assignTopZIndex: () => {
            topZIndexRef.current = topZIndexRef.current + 1;
            return topZIndexRef.current;
        },
        updateWindowsTree: ( address, updater, parentWindowsTree={...windowsTree}, ogWindowsTree=parentWindowsTree ) => {
            if ( address.length > 0 ) {
                return helpers.updateWindowsTree( address, updater, parentWindowsTree[ address.shift() ], ogWindowsTree );
            } else {
                // updater takes the node at address as argument. 
                updater( parentWindowsTree );
                // newWindowsTree.children.push(id);
                setWindowsTree(ogWindowsTree);
                // return parentWindowsTree;
                return ogWindowsTree;
            }
        }
    }

    /**
     * 
     * Component passed must accept zIndex and Id
     * 
     * @param {*} Component 
     * @param {*} parentWindowId 
     */
    function createWindow(Component, props, parentWindowId){
        //parentWindowId of 0 means it is at the root level;
        // get the id for the newly created window
        const id = helpers.assignWindowId();
        const address = parentWindowId? windowsRef.current[parentWindowId].address : [];
        // 1) update windows
        windowsRef.current[id] = {
            address: [ ...address, id],
            zIndex: helpers.assignTopZIndex(),
            // user input
            props: { ...props },
            Component: Component
        };
        // 2) update windowsTree
        helpers.updateWindowsTree( address, ( parentWindowsTree ) => { parentWindowsTree[id]={} });
    };

    /**
     * this function is intended to be used as a callback for [].map where the array should be an array of windowIds
     * [..childrenIds].map( id => renderWindow )
     * @param {*} windowId 
     */
    function renderWindow( id ){
        // console.log(windowsRef.current)
        const {
            // address,
            zIndex,
            props,
            Component
        } = windowsRef.current[id];
        // console.log(id, zIndex)
        return(
            <Component
                key={id}
                id={id}
                initialZIndex={zIndex}
                {...props}
            />
        )
    }

    /**
     * this updates the zIndex value of the given id in windowsRef
     * this also returns the value updated with so the component can update zIndex state.
     * @param {*} id 
     */
    function windowToTop(id){
        // generate zIndex
        const newTopZIndex = helpers.assignTopZIndex(); // === topZIndex.current
        // get the window object to update zIndex
        windowsRef.current[id].zIndex = newTopZIndex;
        return newTopZIndex; // === topZIndex.current === windowsRef.current[id].zIndex
    }
    /**
     * removes id from rendering tree (windowsTree)
     * then cleans up leftovers from windowsRef
     * raise warning if there are children windows still open
     * @param {*} id 
     */
    // TODO: add restoreClosedWindow 
    // TODO-cont: this will depend on another ref, and perhaps add saveState first.
    function closeWindow( id ){
        // get the address of the window being closed by its id from windowsRef
        const { address } = windowsRef.current[id];
        // find the node of this window from windowsTree
        helpers.updateWindowsTree( address, (childrenWindowIds)=>{
            if ( Object.keys(childrenWindowIds).length > 0) {
                const confirmation = confirm('there are windows still opened, are you sure?');
                if ( confirmation ) {
                    // delete the node from windowsTree
                    deleteNodeFromWindowsTree(id)
                    // delete the key from windowsRef.current
                    deleteKeyFromWindowsRef(id);
                } 
            } else {
                deleteNodeFromWindowsTree(id);
                deleteKeyFromWindowsRef(id);
            }
        })

        function deleteNodeFromWindowsTree(id){
            helpers.updateWindowsTree( address, (childrenWindowIds)=>{
                delete childrenWindowIds[id];
            });
        }
        function deleteKeyFromWindowsRef(id){
            delete windowsRef.current[id];
        }
        // const newWindowsTree = { ...windowsTree };
        // 
        // const { ...childrenWindows } = newWindowsTree[id];
        // if ( Object.keys(childrenWindows).length > 0) {
        //     const confirmation = confirm('there are windows still opened, are you sure?');
        //     if ( confirmation ) {
        //         delete newWindowsTree[id];
        //         setWindowsTree( newWindowsTree );
        //     } 
        // } else {
        //     delete newWindowsTree[id];
        //     setWindowsTree( newWindowsTree );
        // }
    }

    // const [ minimisedWindowIds, setMinimisedWindowIds ] = useState([]);

    // function minimiseWindow(id) {
    //     setMinimisedWindowIds( [ ...minimisedWindowIds, id ] );
    // }

    // function restoreMinimisedWindow(id) {
    //     const indexToRemove = minimisedWindowIds.findIndex( min_id => min_id === id );
    //     minimisedWindowIds.splice(indexToRemove, 1);
    //     setMinimisedWindowIds( [ ...minimisedWindowIds ] );
    // }

    const value = {
        // TODO: change all windowId to windowIdRef within the package 
        windowIdRef: windowId,
        windowsTree,
        windowsRef,
        createWindow,
        renderWindow,
        closeWindow,
        windowToTop,
        //
        useMinimise,
        // useMaximise
    }

    /**
     * ? merge dependency arrays into 1 state to eliminate multiple rerenders
     */
    // useEffect(()=>{
    //     console.log(windowsTree)
    // },[ windowsTree ]);

    return(
        <WindowManagerContext.Provider value={value}>
            {children}
        </WindowManagerContext.Provider>
    )
}

/**
 * call this hook in the parent window track minimised windows by id
 * @param {*} defaultValue 
 * @returns 
 */
function useMinimise( defaultValue=[] ){
    const [ minimisedWindowIds, setMinimisedWindowIds ] = useState( defaultValue );

    function minimiseWindow(id) {
        setMinimisedWindowIds( prevState => [...prevState, id]);
    }

    function restoreMinimisedWindow(id) {
        setMinimisedWindowIds( prevState => prevState.filter( minimisedWindowId => minimisedWindowId !== id ) );
    }
    return {
        minimisedWindowIds, 
        minimiseWindow, // setMinimisedWindowId, 
        restoreMinimisedWindow // unsetMinimisedWindowId
    }
};

// function useMaximise( defaultValue=[] ){
//     const [ maximisedWindowIds, setMaximisedWindowIds ] = useState( defaultValue );

//     function maximiseWindow(id) {
//         setMaximisedWindowIds( prevState => [...prevState, id]);
//     }

//     function restoreMaximisedWindow(id) {
//         setMaximisedWindowIds( prevState => prevState.filter( maximisedWindowId => maximisedWindowId !== id ) );
//     }
//     return {
//         maximisedWindowIds, 
//         maximiseWindow, // setMaximisedWindowId, 
//         restoreMaximisedWindow // unsetMaximisedWindowId
//     }
// };