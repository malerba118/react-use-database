import * as apiSchemas from "./apiSchemas";
import * as models from "./models";
import useNormalizedApi from "./useNormalizedApi";
import createDB from "../react-use-database/index.es.js";

let [DatabaseProvider, useDB] = createDB(
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
