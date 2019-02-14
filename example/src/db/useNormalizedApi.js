import { normalize } from "normalizr";
import { useDB } from "./db";
import * as apiSchemas from "./apiSchemas";
import api from "../api";

const filterQueries = {
  'active': 'ACTIVE_TODOS',
  'all': 'ALL_TODOS',
  'completed': 'COMPLETED_TODOS'
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
      let todos = await api.updateTodo(id, payload);
      let { result, entities } = normalize(
        todos,
        apiSchemas.updateTodoResponseSchema
      );
      db.mergeEntities(entities);
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
      db.updateStoredQuery('ALL_TODOS', (prev) => [...prev, todo.id]);
      db.updateStoredQuery('ACTIVE_TODOS', (prev) => [...prev, todo.id]);
      return {
        value: result,
        schema: apiSchemas.updateTodoResponseSchema
      };
    },
  };
};

export default useNormalizedApi;
