# react-use-database

> query param hooks

An opinionated, batteries-included hook to sync query parameters with React state.
Works very similarly to useState except when you 'setState' your parameters will propagate to the URL
as query parameters. Alternatively, if you change the url, the state will update with the new query parameter values.
And the best part is you don't have to worry about coercing types! All of the coercion happens
under the hood. I've found one of the most annoying parts of working with query-string is that
even after parsing the url, everything is still a string!

[![NPM](https://img.shields.io/npm/v/react-use-database.svg)](https://www.npmjs.com/package/react-use-database) [![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)

## Install

```bash
npm install --save react-use-database
```

## Usage

```javascript
// src/history.js
import { createBrowserHistory as createHistory } from "history";

export default createHistory();
```

```javascript
// src/useQueryParams.js
import createParamsHook from 'react-use-database';
import history from './history';

export default createParamsHook(history);
```

```jsx
// src/App.js
import useQueryParams from './useQueryParams';

const App = (props) => {
  let { setParams, data } = useQueryParams([
    {
      name: "page",
      defaultValue: 10,
      type: "number",
      transform: (v) => Math.max(v, 1)
    },
  ]);
  return (
    <div>
      <h1>Page: {data.page}</h1>
      <button
        onClick={(e) => {
          setParams((prevParams) => ({
            page: prevParams.page - 1
          }))
        }}
      >
        Prev Page
      </button>
      <button
        onClick={(e) => {
          setParams((prevParams) => ({
            page: prevParams.page + 1
          }))
        }}
      >
        Next Page
      </button>
    </div>
  );
}
```

## License

MIT © [malerba118](https://github.com/malerba118)
