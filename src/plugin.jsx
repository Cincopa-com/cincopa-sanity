import React from 'react';
import UploaderArea from './components/UploaderArea';

export function cincopaAssetRendering(config) {
  return {
    components: {
      input: (props) => (
        <UploaderArea {...props} config={config} />
      )
    }
  };
}
