import { apiAssetSetMeta } from '../constants/ApiUrls';
import { LaunchIcon } from '@sanity/icons';

export function createSetAssetData({ token }) {
  return function SetAssetData(props) {
    return {
      label: 'Send Asset Data to Cincopa',
      icon: LaunchIcon,
      onHandle: async () => {
        try {
          const asset = props?.draft || props?.published;
          if (!asset?.assetRid) {
            console.warn('Missing asset RID');
            return props.onComplete();
          }

          const params = new URLSearchParams({
            api_token: token,
            rid: asset.assetRid,
          });

          if (asset.assetTitle) params.append('caption', asset.assetTitle);
          if (asset.assetDescription) params.append('description', asset.assetDescription);
          if (asset.assetNotes) params.append('long_description', asset.assetNotes);
          if (asset.assetRelatedLinkText) params.append('related_link_text', asset.assetRelatedLinkText);
          if (asset.assetRelatedLinkUrl) params.append('related_link_url', asset.assetRelatedLinkUrl);
          if (asset.assetReferenceId) params.append('reference_id', asset.assetReferenceId);

          const url = `${apiAssetSetMeta}?${params.toString()}`;

          const response = await fetch(url);
          if (!response.ok) {
            throw new Error(`Cincopa API error: ${response.statusText}`);
          }

          const result = await response.json();

        } catch (error) {
          console.error('Error sending asset data to Cincopa:', error);
        } finally {
          props.onComplete();
        }
      },
    };
  }
}
