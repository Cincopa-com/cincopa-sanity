import { Card, Flex, Grid, Inline, Box, Heading, Text, Label, Button, Popover, Menu, MenuItem, MenuDivider, useClickOutside } from '@sanity/ui'
import {SearchIcon, EllipsisVerticalIcon, ResetIcon, UploadIcon} from '@sanity/icons'
import React, { useEffect, useRef, useState, useCallback } from 'react'
import { useClient } from '../hooks/useClient'
import {PatchEvent, set, unset, setIfMissing, useFormValue,  } from 'sanity'
import CincopaLogo from './CincopaLogo'
import { apiGetUploadUrl, apiAssetSetMeta } from '../constants/ApiUrls'
import AssetsListModal from '../components/AssetsListModal'
import EmbedCode from '../components/EmbedCode'

function Uploader(props) {
    const client = useClient();
    const documentId = useFormValue(['_id']);
    const uploaderRef = useRef(null);
    const hasInitialized = useRef(false);
    const [openMenu, setOpenMenu] = useState(false);
    const [menuElement, setMenuRef] = useState(null);
    const [uploadUrl, setUploadUrl] = useState(null);
    const [uploadState, handleUploadState] = useState(false);
    const handleAssetList = useCallback(() => props?.setDialogState('select-video'), [props?.setDialogState]);
    const onReset = useCallback(() => props?.onChange(PatchEvent.from(unset([]))), [props?.onChange]);
    const accessToken = props?.hasUploaderAccess ? props?.config?.token : props?.config?.token_viewer;

    useEffect(() => {
        if(accessToken && props?.hasUploaderAccess){
          getUploadUrl();
        }
    }, [accessToken]);

    const getUploadUrl = async() => {
        try {
            const response = await fetch(`${apiGetUploadUrl}?api_token=${accessToken}`);
            if (!response.ok) throw new Error('Failed to fetch data');
            const result = await response.json();
            setUploadUrl(result?.upload_url);
        } catch (err) {
            console.error('Error: Get Upload Url', err);
        }
    }

    useEffect(() => {
        if (!uploadUrl || !uploaderRef.current || hasInitialized.current) return;

        const script = document.createElement("script");
        script.src = "https://wwwcdn.cincopa.com/_cms/ugc/uploaderui.js";
        script.async = true;
        document.body.appendChild(script);

        script.onload = () => {
            if (window.cpUploadUI && uploaderRef.current && !hasInitialized.current) {
                const uploadUI = new cpUploadUI(uploaderRef.current, {
                    upload_url: uploadUrl,
                    multiple: false,
                    width: 'auto',
                    height: 'auto',
                    onUploadComplete: function (data) {
                        if (data.uploadState === 'Complete' && documentId) {
                            accessToken && data?.rid && setMeta(data?.rid);
                            props.onChange(
                                PatchEvent.from([
                                  setIfMissing({asset: {}, _type: 'cincopa.uploader'}),
                                  set({_type: getMimeCategory(data?.type || data?.file?.type), _weak: true, _ref: data?.rid}, ['asset']),
                                ])
                            )
                            updateDocument(data);
                            handleUploadState(false);
                        }
                    },
                });

                uploadUI.start();
                hasInitialized.current = true;
            }
        };

        return () => {
            document.body.removeChild(script);
        };
    }, [uploadUrl, props?.value?.asset, uploadState]);

    const setMeta = async(rid) =>{
        try {
          const response = await fetch(`${apiAssetSetMeta}?api_token=${accessToken}&rid=${rid}&reference_id=sanity`);
          if (!response.ok) {
            throw new Error('Failed to fetch data');
          }

          const result = await response.json();
        } catch (err) {
          console.log(err, 'Error: Asset Set Meta Data');
        }
    };

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
        assetType: getMimeCategory(asset?.type || asset?.file?.type),
        assetTitle: 'Example Title',
        assetDescription: '',
        assetReferenceId: 'sanity',
        assetUploaded: new Date().toISOString(),
      }

      try {
        await client.createIfNotExists({ _id: draftId, _type: assetData._type });
        await client.patch(draftId).set(assetData).commit();
      } catch (error) {
          console.error('Failed to update document:', error);
      }
    };

    const getMimeCategory = (mimeType) => {
        if (typeof mimeType !== 'string') return 'unknown';
        const [type] = mimeType.toLowerCase().split('/');
        switch (type) {
          case 'image':
          case 'video':
          case 'music':
            return type;
          default:
            return 'unknown';
        }
      }

    useEffect(() => {
        if (openMenu && props?.dialogState) {
          setOpenMenu(false)
        }
    }, [props?.dialogState, openMenu])

    const handleClickOutside = useCallback(() => {
        if (openMenu) {
            setOpenMenu(false);
        }
    }, [openMenu]);

    useClickOutside(handleClickOutside, [menuElement]);

    return(
        <>
        <Card>
            <Flex
                padding={2} align='center'
                justify='space-between'
                style={{
                    backgroundColor: '#f5f5f5',
                    borderRadius: '10px'
                }}>
                <CincopaLogo height={30} />
                <Flex align='center' gap={1}>
                    <Button
                        padding={2}
                        radius={3}
                        fontSize={3}
                        icon={SearchIcon}
                        mode="bleed"
                        title="Search Asset"
                        onClick={handleAssetList}
                    />
                    {props?.value?.asset && !uploadState && (
                    <Box>
                        <Popover padding={3}
                            content={
                                <Menu ref={setMenuRef}>
                                    <Label muted size={3} style={{marginBottom: '5px'}}>
                                        Asset Settings
                                    </Label>
                                    <MenuDivider />
                                    <>
                                      {props?.hasUploaderAccess && (
                                        <MenuItem
                                            icon={UploadIcon}
                                            text="Upload"
                                            onClick={() => handleUploadState(true)}
                                        />
                                      )}
                                    </>
                                    <MenuItem
                                        tone="critical"
                                        icon={ResetIcon}
                                        text="Clear field"
                                        onClick={onReset}
                                    />
                                </Menu>
                            }
                            portal
                            open={openMenu}
                        >
                            <Button
                                padding={2}
                                radius={3}
                                fontSize={3}
                                icon={EllipsisVerticalIcon}
                                mode="bleed"
                                title="Asset Settings"
                                onClick={() => setOpenMenu(true)}
                            />
                        </Popover>
                    </Box>
                    )}
                </Flex>
            </Flex>
            <Box
                style={{
                    backgroundColor: '#f5f5f5',
                    padding: '20px',
                    borderRadius: '10px',
                    marginTop: "5px",
                    minHeight: '300px',
                }}>
                {props?.value?.asset && !uploadState ? (
                    <EmbedCode
                        asset={props.value.asset}
                        onChange={props.onChange}
                    />
                ) : (
                    <>
                      {accessToken && props?.hasUploaderAccess ? (
                        <div ref={uploaderRef} ></div>
                        ) : (
                        <Flex paddingY={5} justify="center">
                          <Grid columns={1} gap={[2, 3, 4, 4]}>
                            <Inline paddingY={1} align="center">
                              <Heading size={[0, 1, 2, 2]} style={{color: '#0086cf'}}>
                                Uploader restricted
                              </Heading>
                            </Inline>
                            <Inline paddingY={1} align="center">
                              <Text size={2}>You have the <code>viewer</code> role, which does not allow uploading assets.</Text>
                            </Inline>
                          </Grid>
                        </Flex>
                      )}
                    </>
                )}
            </Box>
        </Card>

        {props?.dialogState === 'select-video' && (
            <AssetsListModal
                config={props?.config}
                hasUploaderAccess={props?.hasUploaderAccess}
                setDialogState={props?.setDialogState}
                onChange={props.onChange}
                selectedAsset={props?.value?.asset}
            />
        )}
        </>
    )
}

export default Uploader
