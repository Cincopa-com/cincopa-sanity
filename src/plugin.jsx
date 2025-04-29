import React from 'react';
import UploaderArea from './components/UploaderArea';

export function cincopaAssetRendering() {
  return {
    components: {
      input: (props) => (
        <UploaderArea {...props} />
      )
    }
  };
}
