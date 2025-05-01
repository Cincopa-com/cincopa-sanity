import { Card, Inline, Box, Button, Stack, Text, TextInput } from '@sanity/ui'
import React, { useMemo, useCallback, useEffect, useState, useRef, useId } from 'react'
import { InsertAboveIcon } from '@sanity/icons'
import ModalHeader from './ModalHeader'
import FormField from './FormField'
import { useClient } from '../hooks/useClient'
import { secretsDocumentValues } from '../hooks/secretsDocumentValues'
import { saveSecrets } from '../hooks/saveSecrets'
import { secretsFormState } from '../hooks/secretsFormState'
import { set, PatchEvent } from 'sanity'
import { uuid } from '@sanity/uuid'

export function UseCincopaInput(props) {
  const client = useClient();
  const saving = useRef(false);
  const [openEditor, setOpenEditor] = useState(false);
  const secretValues = secretsDocumentValues();
  const [state, dispatch] = secretsFormState(secretValues.value.secrets);
  const handleSaveSecrets = saveSecrets(client, secretValues.value.secrets);
  const id = `ConfigureApiModal${useId()}`
  const fieldNames = ['token'];
  const [tokenId] = useMemo(() => fieldNames.map((field) => `${id}-${field}`), [id]);

  useEffect(() => {
    function receiveMessage(event) {
      if (
        event.data &&
        event.data.sender === 'cincopa-assets-iframe'
      ) {
        if (
          event.data.action === 'insertedItem' ||
          event.data.action === 'insertedGallery'
        ) {
          handleInsert(event.data);
        }
      }
    }
  
    window.addEventListener('message', receiveMessage, false);
    return () => {
      window.removeEventListener('message', receiveMessage, false);
    };
  }, []);

  const handleInsert = async (data) => {
    const setParams = {
      _type: 'useCincopa',
      _key: uuid(),
    }
    
    if(data.action == 'insertedItem'){
      setParams.title = data.item.caption || data.item.filename;
      setParams.rid = data.item.rid;
      setParams.fid = getAssetFid(data.item.type, data.defaults);
    }else if(data.action == 'insertedGallery'){
      setParams.title = 'Cincopa Gallery';
      setParams.fid = data.fid;
    }

    props.onChange(PatchEvent.from(
      set(setParams)
    ));
  }

  const getAssetFid = (type, defaultsFid) => {
    return defaultsFid[type] || 'A4HAcLOLOO68';
  }

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
              preload(() => Promise.resolve(savedSecrets), [projectId, dataset])
            })
            .catch((err) => dispatch({type: 'error', payload: err.message}))
            .finally(() => {
              saving.current = false;
            })
        }
      },
      [client, dispatch, handleSaveSecrets, state]
  );

  const handleChangeToken = useCallback(
    (event) => {
      dispatch({
        type: 'change',
        payload: {name: 'token', value: event.currentTarget.value},
      })
    },
    [dispatch]
  );

  return (
    <>
      <Card
       padding={[3, 3, 4]}
       radius={2}
       shadow={1}
       tone="primary"
      >
        <Inline>
        
          {secretValues?.value?.secrets?.token ? (
            <ModalHeader title={'Cincopa Video & Image Gallery'} />
          ) : (
            <>
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
            </>
          )}
        </Inline>
      </Card>

          {secretValues?.value?.secrets?.token ? (
            <>
            <Inline paddingY={[4, 4, 4]} style={{
              textAlign: 'center'
            }}>
              <Button
                fontSize={[2, 2, 3]}
                icon={InsertAboveIcon}
                padding={[3, 3, 4]}
                text="Insert from Cincopa"
                tone="primary"
                onClick={() => {setOpenEditor(true)}}
              />
            </Inline>
            {openEditor && (
              <div style={{ width: '100%', height: '600px' }}>
                <iframe
                  src={`https://www.cincopa.com/media-platform/api/library-editor.aspx?disable_editor=y&api_token=${secretValues.value.secrets.token}`}
                  title="Cincopa Library Editor"
                  width="100%"
                  height="100%"
                  allow="microphone *; camera *; display-capture *"
                  allowFullScreen
                ></iframe>
              </div>
            )}
            </>
          ):(
            <>
            <Box paddingY={[4, 4, 4]}>
              <form onSubmit={handleConfigureSubmit}>
                <Stack space={4}>
                  <FormField title="Access Token" inputId={tokenId}>
                    <TextInput
                        type="text"
                        placeholder="Access Token"
                        id={tokenId}
                        value={state.token ?? ''}
                        onChange={handleChangeToken}
                    />
                  </FormField>
                  <Inline>
                    <Button
                      loading={state.submitting}
                      text="Save"
                      tone="primary"
                      mode="default"
                      type="submit"
                    />
                  </Inline>
                </Stack>
              </form>
            </Box>
            </>
          )}
    </>
  )
}
