import * as apiSchemas from "./apiSchemas";
import * as models from "./models";
import useNormalizedApi from "./useNormalizedApi";
import createDB from "../react-use-database/index.es.js";

let [ DatabaseProvider, useDB ] = createDB(
  models,
  {
    ALL_POSTS: {
      schema: [models.PostSchema],
      defaultValue: []
    },
  }
);

export { useDB, DatabaseProvider }
