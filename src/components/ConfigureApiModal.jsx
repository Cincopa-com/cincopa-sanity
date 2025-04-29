import { Box, Button, Card, Checkbox, Code, Dialog, Flex, Inline, Stack, Text, TextInput } from '@sanity/ui'
import React, { memo, useCallback, useId, useMemo, useRef, useEffect } from 'react'
import FormField from './FormField'
import ModalHeader from './ModalHeader'
import { useClient } from '../hooks/useClient'
import { saveSecrets } from '../hooks/saveSecrets'
import { secretsFormState } from '../hooks/secretsFormState'

function ConfigureApiModal({ secrets, setDialogState }) {
    
    const saving = useRef(false);
    const client = useClient();
    const focusToField = useRef(null);
    const [state, dispatch] = secretsFormState(secrets);
    const hasSecretsInitially = useMemo(() => secrets?.token, [secrets]);
    const handleClose = useCallback(() => setDialogState(false));
    const handleSaveSecrets = saveSecrets(client, secrets);
    const dirty = useMemo(
        () =>
          secrets.token !== state.token
        [secrets, state]
    );

    const id = `ConfigureApiModal${useId()}`
    const fieldNames = ['token'];
    const [tokenId] = useMemo(() => fieldNames.map((field) => `${id}-${field}`), [id]);

    const handleConfigureSubmit = useCallback(
        (event) => {
          event.preventDefault();
    
          if (!saving.current && event.currentTarget.reportValidity()) {
            saving.current = true
            dispatch({ type: 'submit'} )
            const { token } = state;
            handleSaveSecrets({token})
              .then((savedSecrets) => {
                const {projectId, dataset} = client.config();
                // clear([cacheNs, secretsId, projectId, dataset])
                preload(() => Promise.resolve(savedSecrets), [projectId, dataset])
                setDialogState(false)
              })
              .catch((err) => dispatch({type: 'error', payload: err.message}))
              .finally(() => {
                saving.current = false;
                setDialogState(false);
              })
          }
        },
        [client, dispatch, handleSaveSecrets, setDialogState, state]
    );

    const handleChangeToken = useCallback(
        (event) => {
          dispatch({
            type: 'change',
            payload: {name: 'token', value: event.currentTarget.value},
          })
        },
        [dispatch]
      )

    useEffect(() => {
        if (focusToField.current) {
            focusToField.current.focus()
        }
    }, [focusToField]);

    return (
        <Dialog
            animate
            width={1}
            onClose={handleClose}
            header={<ModalHeader title={'Manage API Credentials'} />}
        >
            <Box padding={4} style={{position: 'relative'}}>
                <form onSubmit={handleConfigureSubmit}>
                    <Stack space={4}>
                        <Card padding={[4, 4, 4]} radius={2} shadow={1} tone="primary">
                            <Stack space={3}>
                            <Text size={1}>
                                To set up a new access token, please visit your account on{' '}
                                <a
                                href="https://www.cincopa.com/cincopamanager/api"
                                target="_blank"
                                rel="noreferrer noopener"
                                >
                                cincopa.com
                                </a>
                                .
                            </Text>
                            <Text size={1}>
                                Your credentials will be securely stored in a hidden document, accessible only to editors.
                            </Text>
                            </Stack>
                        </Card>

                        <FormField title="Access Token" inputId={tokenId}>
                            <TextInput
                                type="text"
                                placeholder="Access Token"
                                id={tokenId}
                                ref={focusToField}
                                value={state.token ?? ''}
                                onChange={handleChangeToken}
                            />
                        </FormField>

                        <Inline space={2} paddingY={4}>
                            <Button
                                text="Save"
                                // disabled={!dirty}
                                loading={state.submitting}
                                tone="primary"
                                mode="default"
                                type="submit"
                            />
                            <Button
                                disabled={state.submitting}
                                text="Cancel"
                                mode="bleed"
                                onClick={handleClose}
                            />
                        </Inline>
                    </Stack>
                </form>
            </Box>
        </Dialog>
    )
}

export default memo(ConfigureApiModal)