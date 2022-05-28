# immer
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