import { createContext, useRef, useEffect, useState, useContext } from "react";
import useWindowManager from "../hooks/useWindowManager";
import { WindowManagerRegistryContext } from "./WindowManagerRegistry";
export const WindowManagerContext = createContext(null);

function Provider({id, children}){
    const value = useWindowManager(id);

    return(
        <WindowManagerContext.Provider value={ value }>
            {children}
        </WindowManagerContext.Provider>
    )
}   

export default function WindowManagerProvider({id, children}){
    const { isLocalStorageHydrated } = useContext(WindowManagerRegistryContext);

    if ( !isLocalStorageHydrated ) {
        return (
            <div> loading... </div>
        )
    };

    return(
        <Provider id={id}>
            {children}
        </Provider>
    )
}