import { useState } from 'react';

export function setLocalStorageValue(id, key, value){
    const localStorageItemString = localStorage.getItem(`${id}`);
    const localStorageItemObject = JSON.parse( localStorageItemString );
    localStorageItemObject[key] = value;
    localStorage.setItem(`${id}`, JSON.stringify(localStorageItemObject));
}

export default function useLocalStorageState(id, key, defaultValue){
    setLocalStorageValue(id, key, defaultValue);
    const [ state, setState ] = useState(defaultValue);
    function setLocalStorageState( value ){
        
        if ( value instanceof Function ){
            const newValue = value(state);
            setState(newValue);
            setLocalStorageValue(id, key, newValue);
        } else {
            setState(value);
            setLocalStorageValue(id, key, value);
        }

    }
    return [ state, setLocalStorageState];
}