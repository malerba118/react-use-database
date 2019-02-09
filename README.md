# react-use-database

> relational data at its simplest


[![NPM](https://img.shields.io/npm/v/react-use-database.svg)](https://www.npmjs.com/package/react-use-database) [![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)

## Install

```bash
npm install --save react-use-database
```

## Usage

```js
// src/db/db.js
import * as apiSchemas from "./apiSchemas";
import * as models from "./models";
import useNormalizedApi from "./useNormalizedApi";
import createDB from "../react-use-database/index.es.js";

let [ DatabaseProvider, useDB ] = createDB(
  models,
  {
    postById: models.PostSchema,
    postsByIds: [models.PostSchema],
    getPostsResponse: apiSchemas.getPostsResponseSchema
  },
  {
    subscribe: console.log
  }
);

export { useDB, DatabaseProvider }
```



```jsx
// src/index.js
import React, { useEffect } from "react";
import ReactDOM from "react-dom";
import { DatabaseProvider } from "./db";
import App from './App'

const rootElement = document.getElementById("root");
ReactDOM.render(
  <DatabaseProvider>
    <App />
  </DatabaseProvider>,
  rootElement
);

```

```javascript
// src/db/useNormalizedApi.js
import { normalize } from "normalizr";
import { useDB } from "./db";
import * as apiSchemas from "./apiSchemas";
import api from "../api";

const useNormalizedApi = () => {
  let db = useDB();

  return {
    getPosts: async () => {
      let posts = await api.getPosts();
      let { result, entities } = normalize(
        posts,
        apiSchemas.getPostsResponseSchema
      );
      db.mergeEntities(entities);
      return result;
    },
    likePost: async id => {
      let post = await api.likePost(id);
      let { result, entities } = normalize(
        post,
        apiSchemas.likePostResponseSchema
      );
      db.mergeEntities(entities);
      return result;
    },
    unlikePost: async id => {
      let post = await api.unlikePost(id);
      let { result, entities } = normalize(
        post,
        apiSchemas.unlikePostResponseSchema
      );
      db.mergeEntities(entities);
      return result;
    }
  };
};

export default useNormalizedApi;
```

```jsx
// src/App.js
import React, { useEffect } from "react";
import ReactDOM from "react-dom";
import useAsync from "./useAsync";
import { useDB, useNormalizedApi } from "./db";

function App() {
  const db = useDB();
  const normalizedApi = useNormalizedApi();
  let [getPostsRequest, getPosts] = useAsync(normalizedApi.getPosts);

  let posts = db.executeQuery("postsByIds", getPostsRequest.result || []);

  useEffect(() => {
    getPosts();
  }, []);

  return (
    <div className="App">
      <h1>Posts</h1>
      {getPostsRequest.pending && <div>loading...</div>}
      {posts.map(p => (
        <div key={p.id}>
          <span>{p.title}</span>
          {!p.liked && (
            <button onClick={() => normalizedApi.likePost(p.id)}>like</button>
          )}
          {p.liked && (
            <button onClick={() => normalizedApi.unlikePost(p.id)}>
              unlike
            </button>
          )}
        </div>
      ))}
    </div>
  );
}

export default App
```


## License

MIT © [malerba118](https://github.com/malerba118)
