# react-use-database

> relational data at its simplest

react-use-database combines normalizr, hooks, and a global data store to give you a simple interface to manage relational data on the client.


[![NPM](https://img.shields.io/npm/v/react-use-database.svg)](https://www.npmjs.com/package/react-use-database) [![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)

## Install

```bash
npm install --save react-use-database
```

## Simplest Usage

```jsx
import React from "react";
import ReactDOM from "react-dom";
import { schema } from "normalizr";
import createDB from "react-use-database";

const TodoSchema = new schema.Entity("Todo");

let [ DatabaseProvider, useDB ] = createDB(
  [TodoSchema],
  {},
  {
    // Seed the database
    defaultValues: {
      Todo: {
        1: {
          id: 1,
          text: 'Buy cheese'
        }
      }
    }
  }
);

const queries = {
  getTodoById: (id) => {
    return {
      schema: TodoSchema,
      value: id
    }
  }
}

const App = (props) => {
  let db = useDB();
  let queryToGetTodoWithIdOne = queries.getTodoById(1)
  let todo = db.executeQuery(queryToGetTodoWithIdOne)
  return <span>{todo.text}</span>
}

ReactDOM.render(
  <DatabaseProvider>
    <App />
  </DatabaseProvider>,
  document.getElementById("root")
);

```

## Complex Usage
#### See [example](https://github.com/malerba118/react-use-database/tree/master/example/src) for full code


```js
// src/db/db.js
import * as models from "./models";
import createDB from "react-use-database";

let [ DatabaseProvider, useDB ] = createDB(
  models,
  {
    ALL_TODOS: {
      schema: [models.TodoSchema],
      defaultValue: []
    },
    ACTIVE_TODOS: {
      schema: [models.TodoSchema],
      defaultValue: []
    },
    COMPLETED_TODOS: {
      schema: [models.TodoSchema],
      defaultValue: []
    },
  }
);

export { useDB, DatabaseProvider }
```


```jsx
// src/index.js
import React from "react";
import ReactDOM from "react-dom";
import { DatabaseProvider } from "./db";
import App from './App'

ReactDOM.render(
  <DatabaseProvider>
    <App />
  </DatabaseProvider>,
  document.getElementById("root")
);
```

```javascript
// src/db/useNormalizedApi.js
import { normalize } from "normalizr";
import { useDB } from "./db";
import * as apiSchemas from "./apiSchemas";
import api from "../api";

const filterQueries = {
  'active': 'ACTIVE_TODOS',
  'all': 'ALL_TODOS',
  'completed': 'COMPLETED_TODOS'
}

const immutableOps = {
  addId: (array, id) => {
    if (!array.includes(id)) {
      return [...array, id]
    }
    return array
  },
  removeId: (array, id) => {
    return array.filter(itemId => itemId !== id)
  }
}

const useNormalizedApi = () => {
  let db = useDB();

  return {
    fetchTodos: async (filter) => {
      let todos = await api.fetchTodos(filter);
      let { result, entities } = normalize(
        todos,
        apiSchemas.fetchTodosResponseSchema
      );
      db.mergeEntities(entities);
      db.updateStoredQuery(filterQueries[filter], result);
      return {
        value: result,
        schema: apiSchemas.fetchTodosResponseSchema
      };
    },
    updateTodo: async (id, payload) => {
      let todo = await api.updateTodo(id, payload);
      let { result, entities } = normalize(
        todo,
        apiSchemas.updateTodoResponseSchema
      );
      db.mergeEntities(entities);
      if (todo.completed) {
        db.updateStoredQuery('ACTIVE_TODOS', (prev) => immutableOps.removeId(prev, id));
        db.updateStoredQuery('COMPLETED_TODOS', (prev) => immutableOps.addId(prev, id));
      }
      else {
        db.updateStoredQuery('ACTIVE_TODOS', (prev) => immutableOps.addId(prev, id));
        db.updateStoredQuery('COMPLETED_TODOS', (prev) => immutableOps.removeId(prev, id));
      }
      return {
        value: result,
        schema: apiSchemas.updateTodoResponseSchema
      };
    },
    addTodo: async (text) => {
      let todo = await api.addTodo(text);
      let { result, entities } = normalize(
        todo,
        apiSchemas.addTodoResponseSchema
      );
      db.mergeEntities(entities);
      db.updateStoredQuery('ALL_TODOS', (prev) => immutableOps.addId(prev, todo.id));
      db.updateStoredQuery('ACTIVE_TODOS', (prev) => immutableOps.addId(prev, todo.id));
      return {
        value: result,
        schema: apiSchemas.addTodoResponseSchema
      };
    },
    deleteTodo: async (id) => {
      let todo = await api.deleteTodo(id);
      let { result, entities } = normalize(
        todo,
        apiSchemas.deleteTodoResponseSchema
      );
      db.mergeEntities({
        Todo: {
          [id]: {
            isDeleted: true
          }
        }
      });
      db.updateStoredQuery('ALL_TODOS', (prev) => immutableOps.removeId(prev, id));
      db.updateStoredQuery('ACTIVE_TODOS', (prev) => immutableOps.removeId(prev, id));
      db.updateStoredQuery('COMPLETED_TODOS', (prev) => immutableOps.removeId(prev, id));
      return {
        value: result,
        schema: apiSchemas.deleteTodoResponseSchema
      };
    },
  };
};

export default useNormalizedApi;
```

```jsx
// src/App.js
import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import Sidebar from './Sidebar';
import TodoDetail from './TodoDetail';
import { useDB, useNormalizedApi } from './db'
import styles from './styles'

const filterQueries = {
  'active': 'ACTIVE_TODOS',
  'all': 'ALL_TODOS',
  'completed': 'COMPLETED_TODOS'
}

function App(props) {
  const { classes } = props;
  let [filter, setFilter] = useState('active');
  let [selectedTodoId, setSelectedTodoId] = useState();

  let normalizedApi = useNormalizedApi()
  let db = useDB();

  useEffect(() => {
    normalizedApi.fetchTodos(filter)
  }, [filter])

  let todos = db.executeStoredQuery(filterQueries[filter]);
  let todoIds = JSON.stringify(todos.map(t => t.id))

  useEffect(() => {
    setSelectedTodoId(todos[0] && todos[0].id)
  }, [todoIds])

  return (
    <div className={classes.root}>
      <AppBar position="fixed" className={classes.appBar}>
        <Toolbar>
          <Typography variant="h6" color="inherit" noWrap>
            Todo App
          </Typography>
        </Toolbar>
      </AppBar>
      <Sidebar
        todos={todos}
        filter={filter}
        onFilterChange={setFilter}
        selectedTodo={selectedTodoId}
        onSelectedTodoChange={setSelectedTodoId}
      />
      <main className={classes.content}>
        <div className={classes.toolbar} />
        <TodoDetail id={selectedTodoId}/>
      </main>
    </div>
  );
}

export default withStyles(styles)(App);
```

# API

* [createDB](#createDB(schemas, storedQueryDefinitions, options))
  - [DatabaseProvider](#DatabaseProvider)
  - [useDB](#useDB)
    - [mergeEntities](#mergeEntities)
    - [executeQuery](#executeQuery)
    - [getStoredQuery](#getStoredQuery)
    - [executeStoredQuery](#executeStoredQuery)
    - [entities](#entities)
    - [storedQueries](#storedQueries)

## `createDB(schemas, storedQueryDefinitions, options)`

Creates DatabaseProvider and useDB hook.

* `schemas`: **required** Array or object whose values are normalizr Entity schemas
* `storedQueryDefinitions`: **required** Object whose keys are query names and whose values have form `{ schema, defaultValue }`
* `options`: **optional** options
  - `defaultValues` : An entities object to seed the database


### Usage

```js
let [ DatabaseProvider, useDB ] = createDB(
  models,
  {
    ALL_TODOS: {
      schema: [models.TodoSchema],
      defaultValue: []
    },
    ACTIVE_TODOS: {
      schema: [models.TodoSchema],
      defaultValue: []
    },
    COMPLETED_TODOS: {
      schema: [models.TodoSchema],
      defaultValue: []
    },
  },
  {
    defaultValues: {
      Todo: {
        1: {
          id: 1,
          text: 'Buy cheese',
          completed: false
        }
      }
    }
  }
);
```

## License

MIT © [malerba118](https://github.com/malerba118)


