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
    {/* {
      todos.list.map((item:string) => <li key={item}>{item}</li>)
    } */}
    </ul>
  </>
}

export default Todos;