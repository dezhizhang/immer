import React,{ useState,useRef } from "react";
import { toProxy,INTERNAL } from '../immer/index';
import { isObject } from '../immer/is';


function useImmerState(baseState:any) {
    const [state,setState] = useState(baseState);
    const draftRef = useRef(toProxy(baseState,() => {
        const internal = draftRef.current[INTERNAL];
        const newState = internal.draftState;
        setState(() => isObject(newState) ? {...newState}:[...newState]);
    }));
    const updateDraft = (producer: (arg0: any) => any) => producer(draftRef.current);
    return [state,updateDraft]
}   

export {
    useImmerState
}
