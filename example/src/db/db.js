import * as apiSchemas from "./apiSchemas";
import * as models from "./models";
import useNormalizedApi from "./useNormalizedApi";
import createDB from "../react-use-database/index.es.js";

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
    }
  }
);

export { useDB, DatabaseProvider }
