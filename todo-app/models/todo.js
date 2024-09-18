"use strict";
const { Model } = require("sequelize");
const { Op } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Todo extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Todo.belongsTo(models.User, {
        foreignKey: "userId",
      });
    }
    static addTodo({ title, dueDate, userId }) {
      return this.create({
        title: title,
        dueDate: dueDate,
        completed: false,
        userId,
      });
    }
    static remove(id, userId) {
      return this.destroy({
        where: {
          id,
          userId,
        },
      });
    }
    static getTodos() {
      return this.findAll();
    }
    static getTodosByDate(duedate, userId) {
      if (duedate === "overdue") {
        return Todo.findAll({
          where: {
            dueDate: {
              [Op.lt]: new Date().toISOString(),
            },
            completed: false,
            userId,
          },
        });
      } else if (duedate === "duetoday") {
        return Todo.findAll({
          where: {
            dueDate: {
              [Op.eq]: new Date().toISOString(),
            },
            completed: false,
            userId,
          },
        });
      } else {
        return Todo.findAll({
          where: {
            dueDate: {
              [Op.gt]: new Date().toISOString(),
            },
            completed: false,
            userId,
          },
        });
      }
    }
    static getCompletedTodos(userId) {
      return Todo.findAll({
        where: {
          completed: true,
          userId,
        },
      });
    }
    setCompletionStatus(completed) {
      if (completed === false) {
        return this.update({ completed: true });
      } else {
        return this.update({ completed: false });
      }
    }
  }
  Todo.init(
    {
      title: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notNull: { msg: "Title is required" },
          len: 5,
        },
      },
      dueDate: {
        type: DataTypes.DATEONLY,
        allowNull: false,
        validate: {
          notNull: { msg: "Due date is required" },
        },
      },
      completed: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
    },
    {
      sequelize,
      modelName: "Todo",
    }
  );
  return Todo;
};
