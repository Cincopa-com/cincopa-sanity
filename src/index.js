import {definePlugin} from 'sanity'
import {schemaTypes} from './schema'
import {cincopaAssetRendering} from './plugin'
import {uploadFileSchema} from './schema'

const defaultConfig = {
  fullCincopaSync:false,
};

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

