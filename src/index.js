import React, { useEffect } from "react";
import { denormalize, normalize } from "normalizr";
import mergeWith from "lodash/mergeWith";
import cloneDeep from "lodash/cloneDeep";
import isArray from "lodash/isArray";
import isSet from "lodash/isSet";
import pick from "lodash/pick";
import { createGlobalState } from "react-hooks-global-state";

const createDB = (
  entitySchemas,
  {
    storedQueryDefinitions = {},
    defaultEntities = {},
  } = {}
) => {
  entitySchemas = Object.values(entitySchemas);
  const entitySchemaNames = entitySchemas.map(s => s.key)

  const getSchemaByName = name => {
    return entitySchemas.filter(s => s.key === name)[0] || null;
  };

  let initialEntitiesState = {};
  entitySchemas.forEach(schema => {
    initialEntitiesState[schema.key] = {};
  });
  initialEntitiesState = { ...initialEntitiesState, ...pick(defaultEntities, entitySchemaNames) };

  let initialStoredQueriesState = {};
  Object.keys(storedQueryDefinitions).forEach(queryName => {
    initialStoredQueriesState[queryName] = storedQueryDefinitions[queryName].defaultValue
  });

  const { GlobalStateProvider, useGlobalState } = createGlobalState({
    db: initialEntitiesState,
    storedQueries: initialStoredQueriesState
  });

  const useDB = () => {
    let [entities, setEntities] = useGlobalState("db");
    let [storedQueries, setStoredQueries] = useGlobalState("storedQueries");

    const executeQuery = ({schema, value}) => {
      return denormalize(
        value,
        schema,
        entities
      );
    };

    const getStoredQuery = (queryName) => {
      if (!storedQueryDefinitions[queryName]) {
        throw new Error(`No stored query exists with name ${queryName}`);
      }
      let schema = storedQueryDefinitions[queryName].schema
      let value = storedQueries[queryName]
      return { schema, value }
    };

    return {
      mergeEntities: (nextEntities, { customizer } = {}) => {
        setEntities(prevEntities => {
          if ((typeof nextEntities) === 'function') {
            nextEntities = nextEntities(prevEntities)
          }
          nextEntities = pick(nextEntities, entitySchemaNames)
          let nextState = mergeWith(
            {},
            prevEntities,
            nextEntities,
            customizer || ((objValue, srcValue) => {
              if (isArray(objValue) || isArray(srcValue) || isSet(objValue) || isSet(srcValue)) {
                return srcValue
              }
            })
          )
          return nextState;
        });
      },
      updateStoredQuery: (queryName, value) => {
        if (!storedQueryDefinitions[queryName]) {
          throw new Error(`No stored query exists with name ${queryName}`);
        }
        setStoredQueries((prevState) => {
          let nextState = {...prevState}
          let nextVal
          if ((typeof value) === 'function') {
            nextVal = value(prevState[queryName])
          }
          else {
            nextVal = value
          }
          nextState[queryName] = nextVal
          return nextState
        })
      },
      executeStoredQuery: (queryName) => {
        let query = getStoredQuery(queryName)
        return executeQuery(query)
      },
      getStoredQuery,
      executeQuery,
      entities,
      storedQueries
    };
  };
  return [GlobalStateProvider, useDB];
};

export default createDB;
