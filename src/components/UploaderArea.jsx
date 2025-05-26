import React, {useState, memo, Suspense } from 'react'
import { Card } from '@sanity/ui'
import { useClient } from '../hooks/useClient'
import Uploader from '../components/Uploader'
import UploaderAccessDialog from './UploaderAccessDialog'
import Loader from '../components/Loader'
import { useCurrentUser } from 'sanity'

const UploaderArea = ({ config, ...props }) => {
    const client = useClient()
    const [dialogState, setDialogState] = useState(false);
    const user = useCurrentUser();
    const roles = user?.roles?.map((r) => r.name) || [];
    const deniedRoles = ['viewer', 'contributor'];
    const hasUploaderAccess = roles.some((role) => !deniedRoles.includes(role));
    const accessToken = hasUploaderAccess ? config?.token : config?.token_viewer;

    return (
        <Card padding={4}>
            <Suspense fallback={<Loader />}>
                <>
                    {!accessToken ? (
                        <UploaderAccessDialog />
                    ) : (
                        <Uploader
                            {...props}
                            onChange={props.onChange}
                            dialogState={dialogState}
                            client={client}
                            setDialogState={setDialogState}
                            config={config}
                            hasUploaderAccess={hasUploaderAccess}
                        />
                    )}
                </>
            </Suspense>
        </Card>
    );
}

export default memo(UploaderArea);
