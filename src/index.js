import { definePlugin } from 'sanity'
import {schemaTypes} from '../src/schema'
import {cincopaAssetRendering} from '../src/plugin'
import {uploadFileSchema} from '../src/schema'

const defaultConfig = {};

export const cincopaUploader = definePlugin((userConfig = {}) => {
  const config = { ...defaultConfig, ...userConfig };
  return {
    name: 'cincopa-uploader',
    schema: {
      types: [
        ...schemaTypes,
        {
          ...uploadFileSchema,
          ...cincopaAssetRendering(config),
        },
      ],
    }
  };
});

