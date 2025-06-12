import { apiAssetList } from '../constants/ApiUrls'
import { useClient } from '../hooks/useClient'
import { SyncIcon } from '@sanity/icons'


export function createSyncAssetData({ token }) {
  return function SyncAssetData(props) {
    const client = useClient();
    return {
      label: 'Sync Asset Data from Cincopa',
      icon: SyncIcon,
      onHandle: async () => {
        try {
          let assetRid = props?.draft?.assetRid || props?.published?.assetRid

          const response = await fetch(`${apiAssetList}?api_token=${token}&rid=${assetRid}`);
          if (!response.ok) {
            throw new Error('Failed to fetch data');
          }

          const result = await response.json();
          if(result.success) {
            if(!result?.items.length){
              return;
            }

            const asset = result.items[0];
            let documentId = props?.id;
            const baseId = typeof documentId === 'string' ? documentId.replace(/^drafts\./, '') : null;
            if (!baseId) {
              console.warn('Document ID not available yet');
              return;
            }

            const draftId = `drafts.${baseId}`;
            const existingDoc = await client.getDocument(draftId) || await client.getDocument(baseId);
            const assetFields = [
              'assetRid',
              'assetType',
              'assetTitle',
              'assetDescription',
              'assetNotes',
              'assetRelatedLinkText',
              'assetRelatedLinkUrl',
              'assetUploaded',
              'assetReferenceId',
              '_id',
              '_type',
            ];

            const assetData = {
              _id: draftId,
              _type: 'cincopa.asset',
              assetRid: asset.rid,
              assetType: asset.type,
              assetTitle: asset.caption,
              assetDescription: asset.description,
              assetNotes: asset.long_description,
              assetRelatedLinkText: asset.related_link_text,
              assetRelatedLinkUrl: asset.related_link_url,
              assetUploaded: asset.modified,
              assetReferenceId: asset.reference_id,
            }

            const preservedFields = Object.fromEntries(
              Object.entries(existingDoc || {}).filter(([key]) => !assetFields.includes(key))
            );

            const mergedData = {
              _id: draftId,
              _type: 'cincopa.asset',
              ...assetData,
              ...preservedFields,
            };

            try {
              await client.createIfNotExists({ _id: draftId, _type: 'cincopa.asset' });
              await client.patch(draftId).set(mergedData).commit();
            } catch (error) {
                console.error('Failed to update document:', error);
            }
          }

        } catch (error) {
          console.error('Error getting asset data:', error);
        } finally {
          props.onComplete();
        }
      },
    };
  }
}
