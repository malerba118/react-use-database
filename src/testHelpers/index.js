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

export const initDB = ({defaultEntities, userByIdDefaultValue} = {}) => {
  return createDB(
    models,
    {
      postById: {
        schema: models.PostSchema,
        defaultValue: null
      },
      postsByIds: {
        schema: [models.PostSchema],
        defaultValue: []
      },
      userById: {
        schema: models.UserSchema,
        defaultValue: userByIdDefaultValue === undefined ? null : userByIdDefaultValue
      },
      usersByIds: {
        schema: [models.UserSchema],
        defaultValue: []
      }
    },
    {
      defaultValues: defaultEntities
    }
  );
}
