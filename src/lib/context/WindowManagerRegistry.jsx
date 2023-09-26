import { createContext, useRef, useEffect, useState } from "react";
import useWindowManagerRegistry from "../hooks/useWindowManagerRegistry";

export const WindowManagerRegistryContext = createContext(null);


export default function WindowManagerRegistryProvider({children, windowSpecsFromLastSession, syncToDataBaseFunctions}){

    const value = useWindowManagerRegistry(windowSpecsFromLastSession, syncToDataBaseFunctions);

    return(
        <WindowManagerRegistryContext.Provider value={value}>
            {children}
        </WindowManagerRegistryContext.Provider>
    )
}