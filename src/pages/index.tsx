import { produce} from '../immer/index';

let baseState = {
  list:['1']
}

let nextState = produce(baseState,(draft: { list: string[]; }) => {
  draft.list.push('2')
})

console.log(baseState);
console.log(nextState);
