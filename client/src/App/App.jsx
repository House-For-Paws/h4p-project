import classes from "./App.module.css";
import { Header } from "../Header/Header.jsx";
import { useState } from "react";
import { Footer } from "../Footer/Footer.jsx";



export function App() {
const names = ["amit" , "asdas" , "asda"]

const [arr,setArr] = useState(names)
const [input , setInput] = useState('')


function Delete_elem_Arr()
{
  setArr((prev) => {
  let newArr = [...prev]
  newArr = newArr.filter(el => el !== input);
  return newArr
  });
}



// const [input , setInput] = useState('')

// function handleInputChange(e)
// {
// console.log(e.target.value)
// setInput(e.target.value)
// }

// function handleAdd()
// {
//  setArr(prev => {
//   const newArr = prev.slice(0) //Shallow copying
//   newArr.push(input)
//   return newArr
//  })}
 
 //Upper function is the same

//  function handleAdd()
// {
//  let str = input.trim()
//  console.log({str} , {input})
//  if(str !== '');
//  setArr(prev => [...prev,input]) 
// }
 
function handleSubmit(e)
{
  e.preventDefault()//Prevents from the submit to be sended and refresh the page
  console.log("In submit")
  const text_name = (e.target.txt.value.trim())
  if (text_name !== "" && !arr.includes(text_name))
  {
    e.target.txt.value = "";
  }
  else
      return  
  
    setArr((prev) => [...prev, text_name]);
    
}


  return (
    <section className={classes.App}>
      <header>
        <Header />
      </header>
      <main>
        <form onSubmit={handleSubmit}>
          <input name="txt" placeholder="Enter your name" onChange={e => setInput(e.target.value)} />
        </form>
        {arr.map((name) => (
          <p key={crypto.randomUUID()}>{name}</p>
        ))}

        <button onClick={() => setArr([])}>Clear names</button>
        <button onClick={Delete_elem_Arr}>Delete</button>
      </main>
      <footer>
        <Footer />
      </footer>
    </section>
  );
}
