import { Card, Inline, Button, Box, Text } from '@sanity/ui'
import React, { useEffect, useState, useId } from 'react'
import { InsertAboveIcon } from '@sanity/icons'
import ModalHeader from './ModalHeader'
import { set, PatchEvent } from 'sanity'
import { uuid } from '@sanity/uuid'

export function UseCincopaInput(props) {
  const [openEditor, setOpenEditor] = useState(false);
  const token = process.env.SANITY_STUDIO_CINCOPA_API_TOKEN;
  const id = `ConfigureApiModal${useId()}`

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
      _type: 'cincopa_asset',
      _key: uuid(),
    }

    if (data.action === 'insertedItem') {
      setParams.title = data.item.caption || data.item.filename;
      setParams.assetTitle = data.item.caption || data.item.filename;
      setParams.assetRid = data.item.rid;
      setParams.assetFid = getAssetFid(data.item.type, data.defaults);
      setParams.assetType = data.item.type;
      setParams.assetDescription = data.item.description || '';
      setParams.assetNotes = data.item.long_description || '';
      setParams.assetRelatedLinkText = data.item.related_link_text || '';
      setParams.assetRelatedLinkUrl = data.item.related_link_url || '';
      setParams.assetUploaded = data.item.modified;
      setParams.assetReferenceId = data.item.reference_id;
    } else if (data.action === 'insertedGallery') {
      setParams.title = 'Cincopa Gallery';
      setParams.assetFid = data.fid;
    }

    props.onChange(PatchEvent.from(
      set(setParams)
    ));
  }

  const getAssetFid = (type, defaultsFid) => {
    let assetType = type;
    if(assetType == 'music'){
      assetType = 'audio';
    }
    return defaultsFid[assetType] || 'A4HAcLOLOO68';
  }

return (
  <>
    <Card padding={[3, 3, 4]} radius={2} shadow={1} tone="primary">
    {!token ? (
      <Box paddingY={[4, 4, 4]}>
        <Text size={2} tone="critical" align="center">
          A required API token is missing. Please contact your administrator or add the Cincopa token to your environment configuration.
        </Text>
      </Box>
    ) : (
      <>
      <Inline>
        <ModalHeader title={'Cincopa Video & Image Gallery'} />
      </Inline>
        <Inline paddingY={[4, 4, 4]} style={{ textAlign: 'center' }}>
          <Button
            fontSize={[2, 2, 3]}
            icon={InsertAboveIcon}
            padding={[3, 3, 4]}
            text="Insert from Cincopa"
            tone="primary"
            onClick={() => setOpenEditor(true)}
          />
        </Inline>

        {openEditor && (
          <div style={{ width: '100%', height: '600px' }}>
            <iframe
              src={`https://www.cincopa.com/media-platform/api/library-editor.aspx?disable_editor=y&api_token=${token}`}
              title="Cincopa Library Editor"
              width="100%"
              height="100%"
              allow="microphone *; camera *; display-capture *"
              allowFullScreen
            />
          </div>
        )}
      </>
    )}
    </Card>
  </>
);
}
