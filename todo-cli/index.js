const {connect} = require("./connectDB");
const Todo = require("./TodoModel");

const createTodo = async()=>{
 try {
    await connect();
    const todo = await Todo.addTask({
        title:"fifth Item",
        dueDate: new Date(),
      //   dueDate: new Date(new Date().setDate(new Date().getDate() - 1)),
        completed: false,
    });
    console.log(`Created Todo with id :${todo.id}`);
 } catch (error) {
    console.log(error);
 }   
}

const countItems = async()=>{
 try {
    await connect();
    const totalCount = await Todo.count();
    console.log(`Found total rows in Todo are:${totalCount}`);
 } catch (error) {
    console.log(error);
 }   
}

const getAllTodos = async()=>{
 try {
    await connect();
    const todos = await Todo.findAll();
    const todoList = todos.map(todo=>todo.displayableString()).join("\n");
    console.log(todoList);
 } catch (error) {
    console.log(error);
 }   
}

const getSingleTodo = async()=>{
 try {
    await connect();
    const todo = await Todo.findOne(
      {
         where:{
            completed:false,
         },
         order: [
            ['id','DESC']
         ]
      }
    );
    
    console.log(todo.displayableString());
 } catch (error) {
    console.log(error);
 }   
}

const updateItem = async(id)=>{
 try {
    await connect();
    await Todo.update({completed:true},
      {
         where:{
            id: id,
         }
      });
 } catch (error) {
    console.log(error);
 }   
}

const deleteItem = async(id)=>{
 try {
    await connect();
    const deletedItemCount = await Todo.destroy(
      {
         where:{
            id: id,
         }
      });
      console.log(`${deletedItemCount} rows deleted!`);
 } catch (error) {
    console.log(error);
 }   
}
// An immediately invoked function expression, or 
// IIFE (pronounced iffy), is a function that is called 
// immediately after it is defined.
(async ()=> {
   //  await createTodo();
   // await countItems();
   await getAllTodos();
   // await getSingleTodo();
   
   // await getAllTodos();
   // await updateItem(2);
   // await deleteItem(2);
   // await getAllTodos();
   })();