import { createContext, useRef, useEffect, useState, useContext } from "react";
import useWindowManager from "../hooks/useWindowManager";

export const WindowManagerContext = createContext(null);

export default function WindowManagerProvider({id, children}){
    
    const value = useWindowManager(id);

    return(
        <WindowManagerContext.Provider value={ value }>
            {children}
        </WindowManagerContext.Provider>
    )
}