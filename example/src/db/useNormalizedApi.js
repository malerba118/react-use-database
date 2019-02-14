import { normalize } from "normalizr";
import { useDB } from "./db";
import * as apiSchemas from "./apiSchemas";
import api from "../api";

const filterQueries = {
  'active': 'ACTIVE_TODOS',
  'all': 'ALL_TODOS',
  'completed': 'COMPLETED_TODOS'
}

const immutableOps = {
  addId: (array, id) => {
    if (!array.includes(id)) {
      return [...array, id]
    }
    return array
  },
  removeId: (array, id) => {
    return array.filter(itemId => itemId !== id)
  }
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
      let todo = await api.updateTodo(id, payload);
      let { result, entities } = normalize(
        todo,
        apiSchemas.updateTodoResponseSchema
      );
      db.mergeEntities(entities);
      if (todo.completed) {
        db.updateStoredQuery('ACTIVE_TODOS', (prev) => immutableOps.removeId(prev, id));
        db.updateStoredQuery('COMPLETED_TODOS', (prev) => immutableOps.addId(prev, id));
      }
      else {
        db.updateStoredQuery('ACTIVE_TODOS', (prev) => immutableOps.addId(prev, id));
        db.updateStoredQuery('COMPLETED_TODOS', (prev) => immutableOps.removeId(prev, id));
      }
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
      db.updateStoredQuery('ALL_TODOS', (prev) => immutableOps.addId(prev, todo.id));
      db.updateStoredQuery('ACTIVE_TODOS', (prev) => immutableOps.addId(prev, todo.id));
      return {
        value: result,
        schema: apiSchemas.addTodoResponseSchema
      };
    },
    deleteTodo: async (id) => {
      let todo = await api.deleteTodo(id);
      let { result, entities } = normalize(
        todo,
        apiSchemas.deleteTodoResponseSchema
      );
      db.mergeEntities({
        Todo: {
          [id]: {
            isDeleted: true
          }
        }
      });
      db.updateStoredQuery('ALL_TODOS', (prev) => immutableOps.removeId(prev, id));
      db.updateStoredQuery('ACTIVE_TODOS', (prev) => immutableOps.removeId(prev, id));
      db.updateStoredQuery('COMPLETED_TODOS', (prev) => immutableOps.removeId(prev, id));
      return {
        value: result,
        schema: apiSchemas.deleteTodoResponseSchema
      };
    },
  };
};

export default useNormalizedApi;
