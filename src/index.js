import React, { useEffect } from "react";
import { denormalize, schema, normalize } from "normalizr";
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
    subscribe
  } = {}
) => {
  schemas = Object.values(schemas);

  const getSchemaByName = name => {
    return schemas.filter(s => s.key === name)[0] || null;
  };

  let defaults = {};
  schemas.forEach(schema => {
    defaults[schema.key] = {};
  });
  defaults = { ...defaults, ...defaultValues };

  const { GlobalStateProvider, useGlobalState } = createGlobalState({ db: defaults });

  const useDB = () => {
    let [entities, setEntities] = useGlobalState("db");

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
          if ((typeof subscribe) === 'function') {
            subscribe(cloneDeep(nextState));
          }
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
