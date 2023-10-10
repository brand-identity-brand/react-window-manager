import { createContext, useRef, useEffect, useState } from "react";
import useWindowManagerRegistry from "../hooks/useWindowManagerRegistry";

export const WindowManagerRegistryContext = createContext(null);
WindowManagerRegistryContext.displayName = 'WindowManagerRegistryContext';

export default function WindowManagerRegistryProvider({children, windowSpecsFromLastSession}){
// console.log('WMRP')
    const value = useWindowManagerRegistry(windowSpecsFromLastSession);

    return(
        <WindowManagerRegistryContext.Provider value={value}>
            {children}
        </WindowManagerRegistryContext.Provider>
    )
}