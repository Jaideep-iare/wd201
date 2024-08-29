const {connect} = require("./connectDB");
const Todo = require("./TodoModel");

const createTodo = async()=>{
 try {
    await connect();
    const todo = await Todo.create({
        title:"First Item",
        dueDate: new Date(),
        completed: false,
    });
    console.log(`Created Todo with id :${todo.id}`);
 } catch (error) {
    console.log(error);
 }   
}
// An immediately invoked function expression, or 
// IIFE (pronounced iffy), is a function that is called 
// immediately after it is defined.
(async ()=> {
    await createTodo();
   })();