import { TodoSchema } from "./models";

export const getTodoById = (id) => {
  return {
    schema: TodoSchema,
    value: id
  }
};
