import { Card, Flex, Box, Label, Button, Popover, Menu, MenuItem, MenuDivider, useClickOutsideEvent } from '@sanity/ui'
import {WrenchIcon, SearchIcon, EllipsisVerticalIcon, ResetIcon, UploadIcon} from '@sanity/icons'
import React, { useEffect, useRef, useState, useCallback } from 'react'
import { useClient } from '../hooks/useClient'
import {PatchEvent, set, unset, setIfMissing} from 'sanity'
import CincopaLogo from './CincopaLogo'
import { apiGetUploadUrl, apiAssetSetMeta } from '../constants/ApiUrls'
import AssetsListModal from '../components/AssetsListModal'
import EmbedCode from '../components/EmbedCode'

function Uploader(props) {
    const client = useClient();
    const uploaderRef = useRef(null);
    const hasInitialized = useRef(false);
    const [openMenu, setOpenMenu] = useState(false);
    const [menuElement, setMenuRef] = useState(null);
    const [uploadUrl, setUploadUrl] = useState(null);
    const [uploadState, handleUploadState] = useState(false);
    const handleAssetList = useCallback(() => props?.setDialogState('select-video'), [props?.setDialogState]);
    const handleConfigureApi = useCallback(() => props?.setDialogState('secrets'), [props?.setDialogState]);
    const onReset = useCallback(() => props?.onChange(PatchEvent.from(unset([]))), [props?.onChange]);
    
    useEffect(() => {
        if(props?.secrets?.token){
          getUploadUrl();
        }
    }, [props?.secrets?.token]);

    const getUploadUrl = async() => {
        try {
            const response = await fetch(`${apiGetUploadUrl}?api_token=${props?.secrets.token}`);
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
                        if (data.uploadState === 'Complete') {
                            props?.secrets?.token && data?.rid && setMeta(data?.rid);
                            props.onChange(
                                PatchEvent.from([
                                  setIfMissing({asset: {}, _type: 'cincopa.uploader'}),
                                  set({_type: getMimeCategory(data?.type || data?.file?.type), _weak: true, _ref: data?.rid}, ['asset']),
                                ])
                            )
                            createDocument(data);
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
          const response = await fetch(`${apiAssetSetMeta}?api_token=${props?.secrets?.token}&rid=${rid}&reference_id=sanity`);
          if (!response.ok) {
            throw new Error('Failed to fetch data');
          }
    
          const result = await response.json();
        } catch (err) {
          console.log(err, 'Error: Asset Set Meta Data');
        }
    };

    const createDocument = async (asset) => {
        const newAsset = {
            _type: 'cincopa.asset',
            assetRid: asset?.rid,
            assetType: getMimeCategory(data?.type || data?.file?.type),
            assetTitle: 'Example title',
            assetDescription: 'Example description',
            assetReferenceId: 'sanity',
            assetUploaded: new Date().toISOString(),
        }
        
        try {
            const result = await client.create(newAsset)
        } catch (error) {
            console.error('Document creation failed:', error)
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

    useClickOutsideEvent(
        () => setOpenMenu(false),
        () => [menuElement]
    );

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
                    <Button
                        padding={2}
                        radius={3}
                        fontSize={3}
                        onClick={handleConfigureApi}
                        icon={WrenchIcon}
                        mode="bleed"
                        title="Configure plugin credentials"
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
                                    <MenuItem
                                        icon={UploadIcon}
                                        text="Upload"
                                        onClick={() => handleUploadState(true)}
                                    />
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
                    marginTop: "5px" 
                }}>
                {props?.value?.asset && !uploadState ? (
                    <EmbedCode 
                        asset={props.value.asset}
                        onChange={props.onChange}
                    />
                ) : (
                    <div ref={uploaderRef} ></div>
                )}
            </Box>
        </Card>

        {props?.dialogState === 'select-video' && (
            <AssetsListModal
                secrets={props?.secrets}
                setDialogState={props?.setDialogState}
                onChange={props.onChange}
                selectedAsset={props?.value?.asset}
            />
        )}
        </>
    )
}

export default Uploader