import { createContext, useRef, useEffect,useState } from "react";

export const WindowManagerRegistryContext = createContext(null);


export default function WindowManagerRegistryProvider({children}){

    const [isLocalStorageHydrated, setIsLocalStorageHydrated] = useState(false);
    const windowIdsRef = useRef({});
    const windowIdCounterRef = useRef(0);

    useEffect(() => {
        if( localStorage.length === 0 ){
            saveRefs();
        }
        if (!isLocalStorageHydrated && localStorage.hasOwnProperty('WindowManagerContext')) {
            const localStorageString = localStorage.getItem('WindowManagerContext');
            const localStorageObject = JSON.parse( localStorageString );
            windowIdsRef.current = localStorageObject.windowIds;
            windowIdCounterRef.current = localStorageObject.windowIdCounter;
            setIsLocalStorageHydrated(true);
        }

    }, []);

    function saveRefs(){
        // console.log(windowIdsRef.current)
        localStorage.setItem('WindowManagerContext', JSON.stringify({
            windowIds: windowIdsRef.current,
            windowIdCounter: windowIdCounterRef.current
        }));
    }

    function getNextIdCounter(){
        windowIdCounterRef.current = windowIdCounterRef.current + 1;
        saveRefs();
        return `${windowIdCounterRef.current}`;
    }

    function initWindow(id, specs={Component:null, props:null, states:null}){
        windowIdsRef.current[id] = {
            Component: specs.Component,
            props: specs.props,
            states: specs.states
        };
        saveRefs();
    }

    const value = {
        isLocalStorageHydrated: isLocalStorageHydrated,
        getWindowIds: () => windowIdsRef.current,
        getNextIdCounter: getNextIdCounter,
        initWindow: initWindow
    }

    return(
        <WindowManagerRegistryContext.Provider value={value}>
            {children}
        </WindowManagerRegistryContext.Provider>
    )
}