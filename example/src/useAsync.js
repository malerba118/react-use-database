import React, { useState, useRef } from "react";

const useAsync = fn => {
  let currentPromise = useRef(null)
  const [state, setState] = useState({
    pending: false,
    fulfilled: false,
    rejected: false,
    result: undefined
  });

  return [
    state,
    async function() {
      setState(prevState => ({
        ...prevState,
        pending: true,
        fulfilled: false,
        rejected: false,
        result: undefined
      }));
      let prom = fn(...arguments);
      currentPromise.current = prom
      try {
        let result = await prom
        if (prom !== currentPromise.current) {
          return
        }
        setState(prevState => ({
          ...prevState,
          pending: false,
          fulfilled: true,
          result: result
        }));
      } catch (e) {
        if (prom !== currentPromise.current) {
          return
        }
        setState(prevState => ({
          ...prevState,
          pending: false,
          rejected: true,
          result: e
        }));
      }
    }
  ];
};

export default useAsync;
