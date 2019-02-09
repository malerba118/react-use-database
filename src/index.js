import React, { useEffect } from "react";
import { denormalize, schema, normalize } from "normalizr";
import mergeWith from "lodash/mergeWith";
import cloneDeep from "lodash/cloneDeep";
import { createGlobalState } from "react-hooks-global-state";

const createDB = (
  schemas,
  queryDefinitions,
  { defaultValues, subscribe = () => {} } = {}
) => {
  schemas = Object.values(schemas);

  const getSchemaByName = name => {
    return schemas.filter(s => s.key === name)[0] || null;
  };

  let defaults = {};
  schemas.forEach(schema => {
    defaults[schema.key] = {};
  });

  const initialState = { db: defaults };
  const { GlobalStateProvider, useGlobalState } = createGlobalState(
    initialState
  );

  defaults = { ...defaults, ...defaultValues };

  const useDB = () => {
    let [entities, setEntities] = useGlobalState("db");

    return {
      mergeEntities: nextEntities => {
        setEntities(prevEntities => {
          let nextState = cloneDeep(mergeWith(prevEntities, nextEntities));
          subscribe(cloneDeep(nextState));
          return nextState;
        });
      },
      executeQuery: (queryName, normalizedResult) => {
        if (!queryDefinitions[queryName]) {
          throw new Error(`No query exists with name ${queryName}`);
        }
        return denormalize(
          normalizedResult,
          queryDefinitions[queryName],
          entities
        );
      }
    };
  };
  return [GlobalStateProvider, useDB];
};

export default createDB;
