// const uuidv4 = require('uuid/v4');
// This is a fake in-memory implementation of something
// that would be implemented by calling a REST server.
let counter = 0

const fakeDatabase = {
  todos: [
    {
      id: counter++,
      text: 'Buy milk',
      completed: true
    },
    {
      id: counter++,
      text: 'Do laundry',
      completed: false
    },
    {
      id: counter++,
      text: 'Clean bathroom',
      completed: false
    },
  ]
};

const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

const fetchTodos = filter =>
  delay(500).then(() => {
    switch (filter) {
      case 'all':
        return fakeDatabase.todos;
      case 'active':
        return fakeDatabase.todos.filter(t => !t.completed);
      case 'completed':
        return fakeDatabase.todos.filter(t => t.completed);
      default:
        throw new Error(`Unknown filter: ${filter}`);
    }
  });

const fetchTodo = id =>
  delay(500).then(() => {
    return fakeDatabase.todos.find(t => t.id === id);
  });

const addTodo = text =>
  delay(500).then(() => {
    const todo = {
      id: counter++,
      text,
      completed: false
    };
    fakeDatabase.todos.push(todo);
    return todo;
  });

const updateTodo = (id, {text, completed}) =>
  delay(500).then(() => {
    const todo = fakeDatabase.todos.find(t => t.id === id);
    todo.text = text === undefined ? todo.text : text;
    todo.completed = completed === undefined ? todo.completed : completed;
    return todo;
  });

const deleteTodo = (id) =>
  delay(500).then(() => {
    let deletedTodo = fakeDatabase.todos.find(t => t.id === id);
    fakeDatabase.todos = fakeDatabase.todos.filter(t => t.id !== id);
    return deletedTodo;
  });

export default {
  fetchTodos,
  fetchTodo,
  addTodo,
  updateTodo,
  deleteTodo
}
