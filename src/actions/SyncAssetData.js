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

            try {
              await client.createIfNotExists({ _id: draftId, _type: assetData._type });
              await client.patch(draftId).set(assetData).commit();
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
