import { isObject, isArray, isFunction } from './is';
export const INTERNAL = Symbol('INTERNAL');

export function produce(baseState: any, producer: any) {
    let proxy = toProxy(baseState);
    producer(proxy);
    const internal = proxy[INTERNAL];
    return internal.mutated ? internal.draftState:internal.baseState
}

export function toProxy(baseState: any,callParentCopy?:Function) {
    let keyToProxy: any = {};
    let internal = {
        baseState,
        draftState: createDraftState(baseState),
        keyToProxy,
        mutated: false,
    };
    return new Proxy(baseState, {
        get(target, key) {
            if (key === INTERNAL) {
                return internal;
            }
            let value = target[key];
            if (isObject(value) || isArray(value)) {
                if (key in keyToProxy) {
                    return keyToProxy[key];
                } else {
                    keyToProxy[key] = toProxy(value,() => {
                        internal.mutated = true;
                        const proxyChild = keyToProxy[key];
                        let { draftState:childDraftState } = proxyChild[INTERNAL];
                        internal.draftState = childDraftState;
                        callParentCopy && callParentCopy();
                    });
                }
                return keyToProxy[key];
            }else if(isFunction(value)) {
              internal.mutated = true;
              callParentCopy && callParentCopy();
              return value.bind(internal.draftState)  
            }
            return internal.mutated
                ? (internal.draftState as any)[key]
                : internal.baseState[key];
        },
        set(target, key, value) {
            internal.mutated = true;
            const { draftState } = internal;
            (draftState as any)[key] = value;
            callParentCopy && callParentCopy();
            return true;
        },
    });
}

function createDraftState(baseState: any) {
    if (isObject(baseState)) {
        return Object.assign({}, baseState);
    } else if (isArray(baseState)) {
        return [...baseState];
    } else {
        return baseState;
    }
}
