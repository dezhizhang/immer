import { isObject,isArray } from './is';
const INTERNAL = Symbol('INTERNAL');

export function produce(baseState:any,producer:any) {
    let proxy = toProxy(baseState);
}

export function toProxy(baseState:any) {
    let keyToProxy:any = {};
    let internal = {
        baseState,
        draftState:createDraftState(baseState),
        keyToProxy,
        mutated:false,
    }
    return new Proxy(baseState,{
        get(target,key) {
            if(key === INTERNAL) {
                return internal;
            }
            let value = target[key];
            if(isObject(value) || isArray(value)) {
                if(key in keyToProxy) {
                    return keyToProxy[key];
                }else {
                    keyToProxy[key] = toProxy(value);
                }
                return keyToProxy[key];
            }
            return internal.mutated ? (internal.draftState as any)[key]:internal.baseState[key]
        },
        set(target,key,value) {
            internal.mutated = true;
            const { draftState } = internal;
            (draftState as any)[key] = value
            return false;
        }
    })
}

function createDraftState(baseState:any) {

}