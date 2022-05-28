# immer 的使用和源码的实现原理
### immer的简单使用
```js
import { produce} from 'immer';

let baseState = {
  list:['1']
}

let nextState = produce(baseState,(draft) => {
  draft.list.push('2')
})

console.log(baseState);
console.log(nextState);

```
### 源码实现
```js
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
```
### 使用方法
```js
import React from "react";
import { Button } from 'antd';
import { useImmerState } from './immer';

let id = 1;

function Todos() {
  const [todos,setTodos] = useImmerState({
    list:['1'],
  })

  const handelAdd = () => {
    setTodos((draft:any) => {
      return draft.list.push(id++)
    })
  }

  console.log(todos);

  return <>
    <Button onClick={handelAdd}>增加</Button>
    <ul>
    {
      todos.list.map((item:string) => <li key={item}>{item}</li>)
    }
    </ul>
  </>
}

export default Todos;
```
### 自定义hooks
```js
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

```
