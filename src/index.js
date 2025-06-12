import { definePlugin } from 'sanity'
import {schemaTypes} from '../src/schema'
import {cincopaAssetRendering} from '../src/plugin'
import {uploadFileSchema} from '../src/schema'

const defaultConfig = {};

export const cincopaUploader = definePlugin((userConfig = {}) => {
  const config = { ...defaultConfig, ...userConfig };
  const customFields = config?.cincopaAssetCustomFields?.fields || [];
  const finalSchemaTypes = schemaTypes.map((type) => {
    if (type.name === 'cincopa.asset') {
      return {
        ...type,
        fields: [...type.fields, ...customFields],
      }
    }
    return type
  });

  return {
    name: 'cincopa-uploader',
    schema: {
      types: [
        ...finalSchemaTypes,
        {
          ...uploadFileSchema,
          ...cincopaAssetRendering(config),
        },
      ],
    }
  };
});

