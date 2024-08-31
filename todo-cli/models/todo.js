// models/todo.js
'use strict';
const {Model} = require('sequelize');
const { Op } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Todo extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static async addTask(params) {
      return await Todo.create(params);
    }
    static async showList() {
      console.log("My Todo list \n");

      console.log("Overdue");
      // FILL IN HERE
      const overdueTodos = await Todo.overdue();
      overdueTodos.forEach(todo => {
        console.log(todo.displayableString());
      });
      console.log("\n");

      console.log("Due Today");
      // FILL IN HERE
      const duetodayTodos = await Todo.dueToday();
      duetodayTodos.forEach(todo => {
        console.log(todo.displayableString());
      });
      console.log("\n");

      console.log("Due Later");
      // FILL IN HERE
      const duelaterTodos = await Todo.dueLater();
      duelaterTodos.forEach((todo) => console.log(todo.displayableString()));
      
    }

    static async overdue() {
      // FILL IN HERE TO RETURN OVERDUE ITEMS
      return Todo.findAll({
        where:{
          dueDate:{
            [Op.lt]: sequelize.literal("CURRENT_DATE"),
          },
        },
      });
    }

    static async dueToday() {
      // FILL IN HERE TO RETURN ITEMS DUE tODAY
      return Todo.findAll({
        where:{
          dueDate:{
            [Op.eq]: sequelize.literal("CURRENT_DATE"),
          },
        },
      });
    }

    static async dueLater() {
      // FILL IN HERE TO RETURN ITEMS DUE LATER
      return Todo.findAll({
        where:{
          dueDate:{
            [Op.gt]: sequelize.literal("CURRENT_DATE"),
          },
        },
      });
    }

    static async markAsComplete(id) {
      // FILL IN HERE TO MARK AN ITEM AS COMPLETE
      return await Todo.update({completed:true},{
        where:{
          id : id,
        },
      });
    }

    displayableString() {
      let checkbox = this.completed ? "[x]" : "[ ]";
      return `${this.id}. ${checkbox} ${this.title} ${this.dueDate === new Date().toISOString().split("T")[0] ? "" : this.dueDate}`.trim();
    }
  }
  Todo.init({
    title: DataTypes.STRING,
    dueDate: DataTypes.DATEONLY,
    completed: DataTypes.BOOLEAN
  }, {
    sequelize,
    modelName: 'Todo',
  });
  return Todo;
};