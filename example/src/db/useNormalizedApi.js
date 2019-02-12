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
      db.updateStoredQuery('ALL_POSTS', result);
      return [result, apiSchemas.getPostsResponseSchema];
    },
    likePost: async id => {
      let post = await api.likePost(id);
      let { result, entities } = normalize(
        post,
        apiSchemas.likePostResponseSchema
      );
      db.mergeEntities(entities);
      return [result, apiSchemas.likePostResponseSchema];
    },
    unlikePost: async id => {
      let post = await api.unlikePost(id);
      let { result, entities } = normalize(
        post,
        apiSchemas.unlikePostResponseSchema
      );
      db.mergeEntities(entities);
      return [result, apiSchemas.unlikePostResponseSchema];
    }
  };
};

export default useNormalizedApi;
