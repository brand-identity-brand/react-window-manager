import { createContext } from "react";
import useWindowManager from "../hooks/useWindowManager";

export const WindowManagerContext = createContext(null);
WindowManagerContext.displayName = 'WindowManagerContext';

export default function WindowManagerProvider({id, children}){
    // console.log('WMP '+id)
    const value = useWindowManager(id);

    return(
        <WindowManagerContext.Provider value={ value }>
            {children}
        </WindowManagerContext.Provider>
    )
}