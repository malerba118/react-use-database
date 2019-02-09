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
