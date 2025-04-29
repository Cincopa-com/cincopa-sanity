import React, {useState, memo, Suspense } from 'react'
import { Card } from '@sanity/ui'
import { useClient } from '../hooks/useClient'
import ConfigureApiModal from './ConfigureApiModal'
import Uploader from '../components/Uploader'
import UploaderAccessDialog from './UploaderAccessDialog'
import Loader from '../components/Loader'
import { assetDocumentValues } from '../hooks/assetDocumentValues'
import { secretsDocumentValues } from '../hooks/secretsDocumentValues'

const UploaderArea = (props) => {
    const client = useClient()
    const [dialogState, setDialogState] = useState(false);
    const secretValues = secretsDocumentValues();
    const assetValues = assetDocumentValues(props.value?.asset)
    const error = secretValues.error || assetValues.error;
    const isLoading = secretValues.isLoading || assetValues.isLoading;

    return (
        <Card padding={4}>
            <Suspense fallback={<Loader />}>
                {isLoading ? (
                    <Loader />
                ) : (
                <>
                    {secretValues.value.needsSetup && !assetValues.value ? (
                        <UploaderAccessDialog setDialogState={setDialogState} />
                    ) : (
                        <Uploader 
                            {...props}
                            config={props.config}
                            onChange={props.onChange}
                            dialogState={dialogState}
                            client={client}
                            setDialogState={setDialogState}
                            secrets={secretValues.value.secrets}
                            asset={assetValues.value}
                        />
                    )}
                    

                    {dialogState === 'secrets' && (
                        <ConfigureApiModal
                            setDialogState={setDialogState}
                            secrets={secretValues.value.secrets}
                        />
                    )}
                </>
                )}
            </Suspense>
        </Card>
    );
}

export default memo(UploaderArea);
