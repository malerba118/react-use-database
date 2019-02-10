import React from 'react'
import { schema } from "normalizr";
import createDB from '../'
import users from './users'
import cloneDeep from 'lodash/cloneDeep'

export {
  users
}

const UserSchema = new schema.Entity(
  'User',
  {},
  {
    idAttribute: 'id'
  }
)

const PostSchema = new schema.Entity(
  'Post',
  {
    author: UserSchema
  },
  {
    idAttribute: 'id'
  }
)

export const models = {
  PostSchema: PostSchema,
  UserSchema: UserSchema
}

export const getAppData = (app) => JSON.parse(app.find('#data').text())

export const initDB = (defaultValues) => {
  return createDB(
    models,
    {
      postById: models.PostSchema,
      postsByIds: [models.PostSchema],
      userById: models.UserSchema,
      usersByIds: [models.UserSchema],
    },
    {
      defaultValues
    }
  );
}
