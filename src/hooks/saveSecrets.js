import { useCallback } from 'react';
import {  saveSecretsData } from '../actions/secrets';

export const saveSecrets = (client, secrets) => {
  return useCallback(
    async ({ token }) => {
      try {
        await saveSecretsData(
          client,
          token,
        );
      } catch (err) {
        console.error('Error while trying to save token:', err);
        throw err;
      }

      return {
        token,
      };
    },
    [client, secrets]
  );
};
