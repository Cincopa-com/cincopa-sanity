import { useReducer } from 'react';

// Initializer function
function init({ token } = {}) {
  return {
    submitting: false,
    error: null,
    token: token ?? '',
  };
}

// Reducer function
function reducer(state, action) {
  switch (action?.type) {
    case 'submit':
      return { ...state, submitting: true, error: null };
    case 'error':
      return { ...state, submitting: false, error: action.payload };
    case 'reset':
      return init(action.payload);
    case 'change':
      return { ...state, [action.payload.name]: action.payload.value };
    default:
      throw new Error(`Unknown action type: ${action?.type}`);
  }
}

// Custom hook
export const secretsFormState = (secrets) => {
  return useReducer(reducer, secrets, init);
};
