import React, { useState } from "react";

const useAsync = fn => {
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
      try {
        let result = await fn(...arguments);
        setState(prevState => ({
          ...prevState,
          pending: false,
          fulfilled: true,
          result: result
        }));
      } catch (e) {
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
