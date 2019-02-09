import { schema } from "normalizr";

export const PostSchema = new schema.Entity(
  "Post",
  {},
  {
    idAttribute: "id"
  }
);
