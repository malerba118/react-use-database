# react-use-database

> relational data at its simplest

react-use-database gives you an opinionated interface, efficient data flow, and concise global state management. It forces you to think about your client-side data in the context of a queryable database. It gives you two global data stores: an entity store and a query store. The entity store contains all of your model data. It’s just a giant json blob that is **the source of truth** for any **database entity** that you have defined via Normalizr’s notion of schemas (eg UserSchema, TodoSchema, CommentSchema, etc.). But, what good is a database without a way to pull data from it? That’s where the query store comes in. A query is comprised of a schema and a value. The query `{schema: UserSchema, value: 32}` would return you a user whose id is 32. The query `{schema: [UserSchema], value: [32]}` would return you a singleton array of the user whose id is 32. By tracking and updating your entities and queries in their respective stores, **every component can have access to the latest data with minimal code and minimal effort**. Note, [Normalizr](https://github.com/paularmstrong/normalizr) is a peer dependency of react-use-database, you should familiarize yourself with it.

I used to implement relational state management with Redux/Normalizr. It worked well, but there was too much boilerplate and trying to onboard a new-hire to the idea was incredibly daunting. Redux and Normalizr are an incredible pairing, Dan Abramov was really onto something with his creation of each (He’s even done an [Egghead tutorial series](https://egghead.io/courses/building-react-applications-with-idiomatic-redux)  in which he describes almost the exact design pattern I’ve implemented in this library). The problem with Redux is that it lacks opinionation and it can be overwhelmingly verbose. It’s vulnerable to anti-patterns and there’s nothing inherent to its API to enforce its proper use. When used improperly, redux can become more of a burden than an asset.



[![NPM](https://img.shields.io/npm/v/react-use-database.svg)](https://www.npmjs.com/package/react-use-database) [![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)

## Install

```bash
npm install --save react-use-database
```

## Demo
Live Demo: [https://malerba118.github.io/react-use-database/](https://malerba118.github.io/react-use-database/)
Demo Code: [https://github.com/malerba118/react-use-database/tree/master/example/src](https://github.com/malerba118/react-use-database/tree/master/example/src)

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
#### See the [live example](https://malerba118.github.io/react-use-database/) and [example code](https://github.com/malerba118/react-use-database/tree/master/example/src) for a complex implementation


### Creating the Database

![](https://cdn-images-1.medium.com/max/2720/1*V8LylLWivGzNPevDvY51qQ.png)

Once we wrap our app in the DatabaseProvider we’re good to go. We can now use our database hook in any component to query the database.

### Fetching Todos

![](https://cdn-images-1.medium.com/max/2720/1*42oSAxGOGmhIxHRvmvPsDg.png)

Boom, now you can fetchTodos from anywhere and your TodosComponent will re-render with the latest list of todos.

### Updating a Todo

![](https://cdn-images-1.medium.com/max/2720/1*KpcKDaCjEcYM5fe6ZET3IQ.png)

This has to be my favorite one. You don’t even need to update any queries. You just take the updated Todo from the response body, normalize it, and deep merge it into the entity store and then your TodosComponent re-renders with the updated data. Virtually zero effort involved.

### Creating a Todo

![](https://cdn-images-1.medium.com/max/2720/1*U3NpXweaAzG2hLr4ptcjQA.png)

You might be seeing a pattern here. Updating the database is almost always as simple as normalizing data and passing the entities object to mergeEntities. This deep merges the entities patch onto the existing entities object. Once our Todo is created, we need to add its id to our ALL_TODOS query. Once this is done, our TodosComponent will re-render with the new todo.

### Deleting a Todo

![](https://cdn-images-1.medium.com/max/2720/1*ukOIy0ITc6IFtv7kl9E5fA.png)

To delete a todo, we can add a soft delete indicator to the todo in the database and we can update any relevant queries to omit the deleted todo id. Here’s a case where we probably don’t want to just normalize the data from the response and call mergeEntities on it.

### Other Queries

![](https://cdn-images-1.medium.com/max/2720/1*scCLgWI1O986v03_r7LWNg.png)

Because a query is just a schema and value, we can create our own queries whose state is not tracked by the query store. For example, if we received a todo id as a url parameter, we could do something like the above.

### Optimistic Updates

![](https://cdn-images-1.medium.com/max/2720/1*5xJferZ41I7VAj4OBnnUsg.png)

We also can easily perform optimistic updates by normalizing and merging entities before the API call has finished. And then if the API call comes back with an error level status code, we can merge the original todo back into entities to revert the update.

# API

* [createDB](#createdbentityschemas-options)
  - [DatabaseProvider](#databaseprovider)
  - [useDB](#usedb)
    - [mergeEntities](#mergeEntities)
    - [executeQuery](#executeQuery)
    - [getStoredQuery](#getStoredQuery)
    - [executeStoredQuery](#executeStoredQuery)
    - [entities](#entities)
    - [storedQueries](#storedQueries)

## `createDB(entitySchemas, options)`

Creates DatabaseProvider and useDB hook.

* `entitySchemas`: **required** Array or object whose values are normalizr Entity schemas
* `options`: **optional** options
  - `storedQueryDefinitions`: Object whose keys are query names and whose values have form `{ schema, defaultValue }`
  - `defaultEntities` : An entities object to seed the database


### Usage

```js
let [ DatabaseProvider, useDB ] = createDB(
  models,
  {
    storedQueryDefinitions: {
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
    defaultEntities: {
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

## `DatabaseProvider`

React context provider that enables react-use-database to have global state.

### Usage

```js
ReactDOM.render(
  <DatabaseProvider>
    <App />
  </DatabaseProvider>,
  document.getElementById("root")
);
```

## `useDB`

React database hook that allows you to query and update the database

### Usage

```js
const useNormalizedApi = () => {
  let db = useDB();
  
  return {
    ...
    addTodo: async (text) => {
      let todo = await api.addTodo(text);
      let { result, entities } = normalize(
        todo,
        apiSchemas.addTodoResponseSchema
      );
      db.mergeEntities(entities); // Merge new todo data into database
      db.updateStoredQuery('ALL_TODOS', (prevArray) => [...prevArray, todo.id]); 
    },
    ...
  };
};
  
const TodosComponent = (props) => {
  let db = useDB();
  
  let allTodosQuery = db.getStoredQuery('ALL_TODOS');
  let todos = db.executeQuery(allTodosQuery);
  
  return (
    <JSON data={todos} />
  )
}
```

## `mergeEntities(entitiesPatch, customizer)`

Method to deep merge an entities patch onto the current entities object to produce next entities state.

* `entitiesPatch`: **required** function or partial entities object. If function, one argument will be passed, the current entities. Under the hood, lodash's mergeWith is called to merge the entitiesPatch onto the current entities to produce the next enitities object.
* `customizer`: **optional** overrides [default customizer implementation](https://gist.github.com/malerba118/20b8bd16f6fe73568511f5c57b84a2b2) passed to lodash's [mergeWith](https://lodash.com/docs/#mergeWith)

### Usage

```js
const TodosComponent = (props) => {
  let db = useDB();
  
  let todo = db.executeQuery({schema: TodoSchema, value: 1});
  
  useEffect(() => {
    db.mergeEntities({
      Todo: {
        1: {
          id: 1,
          text: 'Buy cheese',
          completed: false
        }
      }
    })
  }, [])
  
  return (
    <JSON data={todo} />
  )
}
```

## License

MIT © [malerba118](https://github.com/malerba118)


