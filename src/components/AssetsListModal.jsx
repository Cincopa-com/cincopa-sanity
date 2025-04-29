import { Dialog, Flex, Inline, Box, Button, Select, TextInput } from '@sanity/ui';
import { useCallback, useId, useState, useEffect } from 'react';
import { SearchIcon } from '@sanity/icons'
import { styled } from 'styled-components';
import ModalHeader from './ModalHeader'
import Loader from '../components/Loader'
import AssetItem from '../components/AssetItem';
import { apiAssetList } from '../constants/ApiUrls'

const StyledDialog = styled(Dialog)`
  > div[data-ui='DialogCard'] > div[data-ui='Card'] {
    height: 100%;
  }
`;

export default function AssetsListModal({secrets, setDialogState, onChange, selectedAsset }) {
    const id = `AssetsListModal${useId()}`;
    const [data, setData] = useState(null);
    const [page, setPage] = useState(1);
    const [pages, setPages] = useState(1);
    const [isLoading, handleLoading] = useState(true);
    const handleClose = useCallback(() => setDialogState(false), [setDialogState]);
    const [searchValue, setSearchValue] = useState('');
    const searchFields = [
        { label: 'By Title', value: 'by_title' },
        { label: 'By Asset Id', value: 'by_asset_id' },
        { label: 'By Asset Tag', value: 'by_asset_tag' },
    ];

    const [searchFieldDefault, setSearchFieldDefault] = useState(searchFields[0].value);
    const [filterTimer, setFilterTimer] = useState(null);
    const [isMoreAssets, handleMoreAssets] = useState(false);

    useEffect(() => {
        if (secrets?.token) {
            fetchData();
        }
    }, [secrets?.token]);

    useEffect(() => {
        if (searchFieldDefault && searchValue != '') {
          handleLoading(true);
          getFilteredData();
        }
    
        if (filterTimer) {
          clearTimeout(filterTimer);
        }
    
      }, [searchFieldDefault, searchValue]);

    useEffect(() => {
        const loadScripts = async () => {
        try {
            // Load the first script
            await loadScript("https://wwwcdn.cincopa.com/_cms/ugc/uploaderui.js");

            // Load the second script after the first one finishes
            await loadScript("//wwwcdn.cincopa.com/_cms/media-platform/libasync.js");

        } catch (error) {
            console.error("Error loading scripts:", error);
        }
        };

        loadScripts();
    }, []); 
    
    const loadScript = (src) => {
        return new Promise((resolve, reject) => {
        const script = document.createElement("script");
        script.src = src;
        script.async = true;
        script.onload = () => resolve();
        script.onerror = (err) => reject(new Error(`Script load error: ${src}`));
        document.body.appendChild(script);
        });
    };

    const fetchData = async (firstPage) => {
        try {
            const currentPage = firstPage ? firstPage : page;
            const response = await fetch(`${apiAssetList}?api_token=${secrets.token}&items_per_page=50&page=${currentPage}`);

            if (!response.ok) {
                throw new Error('Failed to fetch data');
            }

            const result = await response.json();

            if(result?.items_data.page < result?.items_data.pages_count){
                handleMoreAssets(true);
            }else{
                handleMoreAssets(false);
            }

            if(firstPage){
                setData(result);
                setSearchValue('');
            }else{
                setData((prevData) => {
                return prevData
                    ? { ...result, items: [...prevData.items, ...result.items] }
                    : result;
                });
            }

            setPage(prevPage => prevPage + 1);
            setPages(result?.items_data.pages_count);
                handleLoading(false);
        } catch (err) {
            setData({});
            handleLoading(false);
        }
    };

    const getFilteredData = async () => {
        if (filterTimer) {
          clearTimeout(filterTimer);
        }
        if (!searchValue) return;
    
        const newFilterTimer = setTimeout(async () => {
          let url = `${apiAssetList}?api_token=${secrets.token}`;
          if(searchFieldDefault == 'by_asset_id') {
            url += `&rid=${searchValue}`;
          }else if(searchFieldDefault == 'by_title') {
            url += `&details=${searchValue}`;
          }else if(searchFieldDefault == 'by_asset_tag'){
            url += `&tag=${searchValue}`
          }else{
            return;
          }
    
          try {
            const response = await fetch(url);
    
            if (!response.ok) {
              throw new Error('Failed to fetch data');
            }
    
            const filteredResult = await response.json();
            setData(filteredResult);
            handleLoading(false);
            handleMoreAssets(false);
          } catch (err) {
            handleLoading(false);
            setData({});
          }
        }, 800);
        setFilterTimer(newFilterTimer);
      };

    const handleOnSearchFieldChange = (value) => {
        setSearchFieldDefault(value);
    };

    const handleOnSearchValueChange = (event) => {
        setSearchValue(event.target.value);
    };

    const loadMoreAssets = () => {
        handleLoading(true);
        fetchData();
    }
  
  return (
    <StyledDialog
      __unstable_autoFocus
      header={<ModalHeader title={'Select Asset'} />}
      id={id}
      onClose={handleClose}
      width={2}
    >
        {isLoading ? (
            <Loader/>
        ) : (
            <>
             <Flex 
                padding={4} 
                wrap={'nowrap'} 
                justify={'flex-start'}
                gap={4}
            >
                <Select
                    fontSize={2}
                    padding={3}
                    value={searchFieldDefault}
                    onChange={(event) => handleOnSearchFieldChange(event.target.value)}
                >
                    {searchFields.map((searchField) => (
                    <option value={searchField.value} key={searchField.value}>
                        {searchField.label}
                    </option>
                ))}
                </Select>
                <TextInput
                    fontSize={2}
                    icon={SearchIcon}
                    onChange={handleOnSearchValueChange}
                    padding={3}
                    placeholder="Search Asset"
                    value={searchValue}
                ></TextInput>

            </Flex>
            <Flex padding={4} wrap={'wrap'}>
                {data?.items?.length > 0 ? (
                    data.items.map((asset, index) => (
                        <Box key={asset?.rid} style={{width: '33.33333333%'}}>
                            <AssetItem
                                secrets={secrets}
                                asset={asset}
                                setDialogState={setDialogState}
                                onChange={onChange}
                                selectedAsset={selectedAsset}
                            />
                        </Box>                    
                    ))
                    ) : (
                    <p style={{ padding: '1rem' }}>No assets found.</p>
                )}
            </Flex>
            </>
        )}

        {!isLoading && isMoreAssets && (
            <Box padding={4} style={{textAlign: 'center'}}>
                <Inline space={[3, 3, 4]}>
                    <Button
                        fontSize={1}
                        padding={4}
                        radius="full"
                        mode="caution"
                        text="Load More"
                        style={{flex: 1, background: '#0086cf'}}
                        onClick={loadMoreAssets}
                    />
                </Inline>
          </Box>
        )}
    </StyledDialog>
  );
}
