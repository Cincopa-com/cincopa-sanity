import { useMemo } from 'react'
import { useDocumentValues } from 'sanity'

import { cincopaSecretsDocumentId } from '../constants/index'

const path = ['token']
export const secretsDocumentValues = () => {
  const {error, isLoading, value} = useDocumentValues(cincopaSecretsDocumentId, path);

  const cache = useMemo(() => {
    const exists = Boolean(value);
    const secrets = {
      token: value?.token || null,
    }
    return {
      isInitialSetup: !exists,
      needsSetup: !secrets?.token,
      secrets,
    }
  }, [value])

  return {error, isLoading, value: cache}
}
