# react-use-database

> relational data at its simplest

react-use-database gives you an opinionated interface, efficient data flow, and concise global state management. It forces you to think about your client-side data in the context of a queryable database. It gives you two global data stores: an **entity store** and a **query store**. 


The entity store contains all of your model data. It’s just a big json blob that is **the source of truth** for any **database entity** that you have defined via Normalizr’s notion of schemas (eg UserSchema, TodoSchema, CommentSchema, etc.).
Note, [Normalizr](https://github.com/paularmstrong/normalizr) is a peer dependency of react-use-database, you should familiarize yourself with it.

But, what good is a database without a way to pull data from it? That’s where the query store comes in. A query is comprised of a schema and a value. The query `{schema: UserSchema, value: 32}` would return you a user whose id is 32. The query `{schema: [UserSchema], value: [32, 33, 34]}` would return you an array of three users. By tracking and updating your entities and queries in their respective stores, **every component can have access to the latest data with almost no additional code**.

I used to implement relational state management with Redux/Normalizr. It worked well, but there was too much boilerplate and trying to onboard a new-hire to the idea was daunting. Redux and Normalizr are an incredible pairing, Dan Abramov was really onto something with his creation of each (He’s even done an [Egghead tutorial series](https://egghead.io/courses/building-react-applications-with-idiomatic-redux)  in which he describes almost the exact design pattern I’ve implemented in this library). The problem with Redux is that it lacks opinionation and it can be overwhelmingly verbose. It’s vulnerable to anti-patterns and there’s nothing inherent to its API to enforce its proper use. When used improperly, redux can become more of a burden than an asset.

For a more detailed introduction to react-use-database, see this [medium article](https://medium.com/free-code-camp/introducing-react-use-database-client-side-relational-data-just-got-easier-d272c9465bf0)


[![NPM](https://img.shields.io/npm/v/react-use-database.svg)](https://www.npmjs.com/package/react-use-database) [![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)

## Install

```bash
npm install --save react-use-database
```

## Demo
Live Demo: [https://malerba118.github.io/react-use-database/](https://malerba118.github.io/react-use-database/)<br/>
Demo Code: [https://github.com/malerba118/react-use-database/tree/master/example/src](https://github.com/malerba118/react-use-database/tree/master/example/src)

## Simplest Usage

```jsx
import React from "react";
import ReactDOM from "react-dom";
import { schema } from "normalizr";
import createDB from "react-use-database";

const TodoSchema = new schema.Entity("Todo");

let [DatabaseProvider, useDB] = createDB([TodoSchema], {
  // Seed the database
  defaultEntities: {
    Todo: {
      1: {
        id: 1,
        text: "Buy cheese"
      }
    }
  }
});

const queries = {
  getTodoById: id => {
    return {
      schema: TodoSchema,
      value: id
    };
  }
};

const App = props => {
  let db = useDB();
  let queryToGetTodoWithIdOne = queries.getTodoById(1);
  let todo = db.executeQuery(queryToGetTodoWithIdOne);
  return <span>{todo.text}</span>;
};

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
<p align="center"><a href="https://gist.github.com/malerba118/a05777cb4c49d37d8b6e4953f6be43d7">See the code</a></p>

Once we wrap our app in the DatabaseProvider we’re good to go. We can now use our database hook in any component to query the database.

### Fetching Todos

![](https://cdn-images-1.medium.com/max/2720/1*42oSAxGOGmhIxHRvmvPsDg.png)
<p align="center"><a href="https://gist.github.com/malerba118/e05440feed68ce4c1ba9d351274a621d">See the code</a></p>

Boom, now you can fetchTodos from anywhere and your TodosComponent will re-render with the latest list of todos.

### Updating a Todo

![](https://cdn-images-1.medium.com/max/2720/1*KpcKDaCjEcYM5fe6ZET3IQ.png)
<p align="center"><a href="https://gist.github.com/malerba118/dc6bbb461de546040497a7f1a5561e99">See the code</a></p>

This has to be my favorite one. You don’t even need to update any queries. You just take the updated Todo from the response body, normalize it, and deep merge it into the entity store and then your TodosComponent re-renders with the updated data. Virtually zero effort involved.

### Creating a Todo

![](https://cdn-images-1.medium.com/max/2720/1*U3NpXweaAzG2hLr4ptcjQA.png)
<p align="center"><a href="https://gist.github.com/malerba118/8a52d13b62af4dafa5f8fed5d2182cb3">See the code</a></p>

You might be seeing a pattern here. Updating the database is almost always as simple as normalizing data and passing the entities object to mergeEntities. This deep merges the entities patch onto the existing entities object. Once our Todo is created, we need to add its id to our ALL_TODOS query. Once this is done, our TodosComponent will re-render with the new todo.

### Deleting a Todo

![](https://cdn-images-1.medium.com/max/2720/1*ukOIy0ITc6IFtv7kl9E5fA.png)
<p align="center"><a href="https://gist.github.com/malerba118/00888f9374dc49a911eb54a218d831a9">See the code</a></p>

To delete a todo, we can add a soft delete indicator to the todo in the database and we can update any relevant queries to omit the deleted todo id. Here’s a case where we probably don’t want to just normalize the data from the response and call mergeEntities on it.

### Optimistic Updates

![](https://cdn-images-1.medium.com/max/2720/1*5xJferZ41I7VAj4OBnnUsg.png)
<p align="center"><a href="https://gist.github.com/malerba118/d412832a11d977e0a694aebe8cd8aaaa">See the code</a></p>

We also can easily perform optimistic updates by normalizing and merging entities before the API call has finished. And then if the API call comes back with an error level status code, we can merge the original todo back into entities to revert the update.

### Other Queries

![](https://cdn-images-1.medium.com/max/2720/1*scCLgWI1O986v03_r7LWNg.png)
<p align="center"><a href="https://gist.github.com/malerba118/227195192ed374a2780e81c3178412cd">See the code</a></p>

Because a query is just a schema and value, we can create our own queries whose state is not tracked by the query store. For example, if we received a todo id as a url parameter, we could do something like the above.


# API

* [createDB](#createdbentityschemas-options)
  - [DatabaseProvider](#databaseprovider)
  - [useDB](#usedb)
    - [mergeEntities](#mergeentitiesentitiespatch-options)
    - [executeQuery](#executequeryquery)
    - [getStoredQuery](#getstoredquerystoredqueryname)
    - [updateStoredQuery](#updatestoredquerystoredqueryname-nextvalue)
    - [executeStoredQuery](#executestoredquerystoredqueryname)
    - [entities](#entities)
    - [storedQueries](#storedqueries)

### `createDB(entitySchemas, options)`

Creates DatabaseProvider and useDB hook.

* `entitySchemas`: **required** Array or object whose values are [normalizr Entity schemas](https://github.com/paularmstrong/normalizr/blob/master/docs/api.md#entitykey-definition---options--)
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

### `DatabaseProvider`

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

### `useDB()`

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
  );
};
```

### `mergeEntities(entitiesPatch, options)`

Immutably deep merges an entities patch on to the current entities object to produce next entities state. Triggers re-render for components consuming useDB.

* `entitiesPatch`: **required** function or partial entities object. If function, one argument will be passed, the current entities. Under the hood, lodash's mergeWith is called to merge the entitiesPatch onto the current entities to produce the next enitities object.
* `options`: **optional** options
  - `customizer`: overrides [default customizer implementation](https://gist.github.com/malerba118/20b8bd16f6fe73568511f5c57b84a2b2) passed to lodash's [mergeWith](https://lodash.com/docs/#mergeWith)

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
    });
  }, []);

  return (
    <JSON data={todo} />
  );
};
```

### `executeQuery(query)`

Executes a query against the database (db.entities).

* `query`: **required** object with shape `{schema: normalizr.schema, value: any}`

### Usage

```js
const TodosComponent = (props) => {
  let db = useDB();

  let todos = db.executeQuery({schema: [TodoSchema], value: [1, 2, 3]});

  return (
    <JSON data={todos} />
  );
};
```

### `getStoredQuery(storedQueryName)`

Gets the current query state for the query name provided.

* `storedQueryName`: **required** query name from keys defined in storedQueryDefinitions

### Usage

```js
const models = [TodoSchema];

let [ DatabaseProvider, useDB ] = createDB(
  models,
  {
    storedQueryDefinitions: {
      ALL_TODOS: {
        schema: [TodoSchema],
        defaultValue: [1, 2, 3]
      }
    }
  }
);

const TodosComponent = (props) => {
  let db = useDB();

  let allTodosQuery = db.getStoredQuery('ALL_TODOS');
  console.log(allTodosQuery); // -> {schema: [TodoSchema], value: [1, 2, 3]}
  let todos = db.executeQuery(allTodosQuery);

  return (
    <JSON data={todos} />
  );
};
```

### `updateStoredQuery(storedQueryName, nextValue)`

Updates the value of the query with name equal to storedQueryName and triggers re-render for components consuming useDB.

* `storedQueryName`: **required** query name from keys defined in storedQueryDefinitions
* `nextValue`: **required** The next value of the stored query or a function that takes in the current value of the stored query and returns the next value

### Usage

```js
const TodosComponent = (props) => {
  let db = useDB();

  let todo = db.executeStoredQuery('ALL_TODOS');

  useEffect(() => {
    db.updateStoredQuery('ALL_TODOS', (prevArray) => [...prevArray, 32]);
  }, []);

  return (
    <JSON data={todo} />
  );
};
```

### `executeStoredQuery(storedQueryName)`

An alias for `db.executeQuery(db.getStoredQuery(storedQueryName))`.

* `storedQueryName`: **required** query name from keys defined in storedQueryDefinitions

### Usage

```js
const TodosComponent = (props) => {
  let db = useDB();

  let todos = db.executeStoredQuery('ALL_TODOS');

  return (
    <JSON data={todos} />
  );
};
```

### `entities`

The root data object from the entity store. Useful to listen to state changes.
Could be used to persist parts of state to local storage or to implement undo/redo features.
Entities saved to local storage could be used to hydrate the store via createDB's defaultEntities option.

### Usage

```js
let [ DatabaseProvider, useDB ] = createDB(
  models,
  {
    defaultEntities: LocalStorageClient.loadState('entities')
  }
);

const useEntityListener = () => {
  let db = useDB();

  useEffect(() => {
    LocalStorageClient.saveState('entities', db.entities)
  }, [db.entities]);
};
```

### `storedQueries`

The root data object from the query store. Useful to listen to state changes.
Could be used to persist parts of state to local storage or to implement undo/redo features.

### Usage

```js
const useStoredQueryListener = () => {
  let db = useDB();

  useEffect(() => {
    //do something
  }, [db.storedQueries]);
};
```

## License

MIT © [malerba118](https://github.com/malerba118)
