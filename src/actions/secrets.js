// import { defer } from 'rxjs'

export function saveSecretsData(
    client,
    token,
  ) {
    const doc = {
      _id: 'secrets.cincopa',
      _type: 'cincopa.apiKey',
      token,
    };
    return client.createOrReplace(doc);
}