import React, { useEffect } from "react";
import { denormalize, normalize } from "normalizr";
import mergeWith from "lodash/mergeWith";
import cloneDeep from "lodash/cloneDeep";
import isArray from "lodash/isArray";
import isSet from "lodash/isSet";
import { createGlobalState } from "react-hooks-global-state";

const createDB = (
  schemas,
  queryDefinitions,
  {
    defaultValues,
  } = {}
) => {
  schemas = Object.values(schemas);

  const getSchemaByName = name => {
    return schemas.filter(s => s.key === name)[0] || null;
  };

  let defaultEntities = {};
  schemas.forEach(schema => {
    defaultEntities[schema.key] = {};
  });
  defaultEntities = { ...defaultEntities, ...defaultValues };

  let defaultQueries = {};
  Object.keys(queryDefinitions).forEach(queryName => {
    defaultQueries[queryName] = queryDefinitions[queryName].defaultValue
  });

  const { GlobalStateProvider, useGlobalState } = createGlobalState({
    db: defaultEntities,
    storedQueries: defaultQueries
  });

  const useDB = () => {
    let [entities, setEntities] = useGlobalState("db");
    let [storedQueries, setStoredQueries] = useGlobalState("storedQueries");

    const executeQuery = (normalizedResult, schema) => {
      return denormalize(
        normalizedResult,
        schema,
        entities
      );
    }

    return {
      mergeEntities: (nextEntities, customizer) => {
        setEntities(prevEntities => {
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
        if (!queryDefinitions[queryName]) {
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
        if (!queryDefinitions[queryName]) {
          throw new Error(`No stored query exists with name ${queryName}`);
        }
        let normalizedResult = storedQueries[queryName]
        let schema = queryDefinitions[queryName].schema
        return executeQuery(normalizedResult, schema)
      },
      executeQuery,
      entities
    };
  };
  return [GlobalStateProvider, useDB];
};

export default createDB;
