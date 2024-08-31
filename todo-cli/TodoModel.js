const { DataTypes, Model } = require("sequelize");
const { sequelize } = require("./connectDB.js");

class Todo extends Model {
    //static function
  static async addTask(params){
    return await Todo.create(params);
  }
  //instance function
  displayableString(){
    return `${this.id}. ${this.completed ? "[x]" : "[ ]"} ${this.title} - ${this.dueDate} ${this.completed}`;
  }
}
Todo.init(
  {
    // Model attributes are defined here
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    dueDate: {
      type: DataTypes.DATEONLY,
    },
    completed: {
      type: DataTypes.BOOLEAN,
    },
  },
  {
    sequelize,
  }
);


module.exports = Todo;
Todo.sync();