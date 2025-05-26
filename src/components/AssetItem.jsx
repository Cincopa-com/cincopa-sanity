import React, { useCallback } from 'react';
import { Card, Stack, Heading, Box, Button, Flex } from '@sanity/ui'
import { AddIcon, EditIcon, PlayIcon } from '@sanity/icons'
import { PatchEvent, set, setIfMissing, useFormValue } from 'sanity'
import { useClient } from '../hooks/useClient'

export default function AssetItem({ config, hasUploaderAccess, asset, setDialogState, onChange, selectedAsset }) {
    const client = useClient();
    const documentId = useFormValue(['_id']);
    const assetDate = new Date(asset?.uploaded);
    const formattedDate = assetDate.toISOString().split('T')[0].replaceAll('-','/');
    const thumbnailUrl = asset?.thumbnail?.url || 'https://wwwcdn.cincopa.com/_cms/design15/images/nothumb.png';
    const accessToken = hasUploaderAccess ? config?.token : null;

    const handleAssetClick = (rid) => {
        if(!accessToken) return;

        let editor = {
            load_modules: [
                {
                  name: 'info',
                  title: 'Asset Info',
                  order: 0
                },
                {
                  name: 'thumbnail',
                  title: 'Set Thumbnail',
                  order: 4
                },
                {
                  name: 'video-trim',
                  title: 'Trimming',
                  order: 5
                },
                {
                  name: 'partitioning-speaker',
                  title: 'Auto Transcribe & CC',
                  feature: 'assets-subtitles',
                  order: 7
                },
                {
                  name: 'chapters',
                  feature: 'assets-timeline',
                  order: 8
                },
                {
                  name: 'annotations',
                  feature: 'assets-timeline',
                  order: 9
                },
                {
                  name: 'call-to-action',
                  feature: 'assets-timeline',
                  order: 10
                },
                {
                  name: 'replace-asset',
                  order: 11
                },
                {
                  name: 'video-renditions',
                  feature: 'video-renditions',
                  title: 'Renditions',
                  order: 12
                },
                {
                  name: "video-analytics",
                  order: 14
                },
                {
                  name: 'downloads-asset',
                  title: 'Attached Files & Links',
                  order: 15
                },
                {
                  title: 'Lead Generation',
                  name: "lead-generation",
                  order: 16
                },
              ],
        token: accessToken,
        rid,
        editorV2: true,
        }

        cincopa?.loadEditor(editor);
    };

    const handleAddAsset = useCallback(
        (asset) => {
            if (asset?.rid !== selectedAsset?._ref && documentId) {
                onChange(
                    PatchEvent.from([
                    setIfMissing({asset: {}, _type: 'cincopa.uploader'}),
                    set({_type: asset?.type, _weak: true, _ref: asset?.rid}, ['asset']),
                    ])
                )
                updateDocument(asset);
            }
            setDialogState(false);
        }
    )

    const updateDocument = async (asset) => {
      const baseId = typeof documentId === 'string' ? documentId.replace(/^drafts\./, '') : null;
      if (!baseId) {
        console.warn('Document ID not available yet');
        return;
      }

      const draftId = `drafts.${baseId}`;

      const assetData = {
        _id: draftId,
        _type: 'cincopa.asset',
        assetRid: asset?.rid,
        assetType: asset?.type,
        assetTitle: asset.caption || asset?.filename || '',
        assetDescription: asset?.description || '',
        assetNotes: asset?.long_description,
        assetRelatedLinkText: asset?.related_link_text,
        assetRelatedLinkUrl: asset?.related_link_url,
        assetUploaded: asset?.modified,
        assetReferenceId: asset?.reference_id,
      }

      try {
        await client.patch(draftId).setIfMissing({ _type: assetData._type }).set(assetData).commit();
      } catch (error) {
        console.error('Failed to update document:', error);
      }
    };

  return (
    <>
        <Card
            border
            padding={2}
            margin={2}
            sizing="border"
            radius={2}
        >

            <Stack
                space={3}
                height="fill"
            >
                <Box
                    style={{
                        position: 'relative',
                        backgroundImage: `url(${thumbnailUrl})`,
                        backgroundPosition: 'center',
                        backgroundSize: 'cover',
                        height: '160px'
                    }}>
                    {asset?.type === 'video' && (
                        <PlayIcon
                            style={{
                                position: 'absolute',
                                color: '#fff',
                                top: 'calc(50% - 20px)',
                                left: 'calc(50% - 20px)',
                                fontSize: '40px',
                            }}
                        />
                    )}
                </Box>
                <Flex
                    direction={'column'}
                    justify={'center'}
                    style={{
                        width: '100%',
                        gap: '20px'
                    }}
                >
                    <Heading
                        as="h4"
                        size={0}
                        style={{
                            padding: '10px 0',
                            wordBreak: 'break-word',
                        }}
                    >{asset?.caption || asset?.filename}</Heading>
                    <Box
                        style={{
                            fontSize: '12px',
                        }}
                    ><span style={{fontWeight: '600'}}>Uploaded:</span> {formattedDate}</Box>
                    <Flex
                        align={'center'}
                        justify={'space-between'}
                        wrap={'wrap'}
                        style={{
                            width: '100%',
                            gap: '10px'
                        }}>
                        <Button
                            icon={AddIcon}
                            fontSize={1}
                            padding={[2, 2, 3]}
                            mode="ghost"
                            text="Add"
                            radius="full"
                            style={{flex: 1}}
                            onClick={() => handleAddAsset(asset)}
                        />
                        <>
                          {hasUploaderAccess && (
                            <Button
                                icon={EditIcon}
                                fontSize={1}
                                padding={[2, 2, 3]}
                                radius="full"
                                mode="caution"
                                text="Edit Asset"
                                style={{flex: 1, background: '#0086cf'}}
                                onClick={() => handleAssetClick(asset.rid)}
                            />
                          )}
                        </>
                    </Flex>
                </Flex>
            </Stack>
        </Card>
    </>
  );
};
