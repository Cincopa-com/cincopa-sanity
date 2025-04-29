const cincopaAsset = {
    name: 'cincopa.asset',
    type: 'document',
    title: 'Cincopa Asset',
    fields: [
      {
        title: 'Asset Title',
        type: 'string',
        name: 'assetTitle',
      },
      {
        title: 'Asset RID',
        type: 'string',
        name: 'assetRid',
      },
      {
        title: "Asset Type",
        name: "assetType",
        type: "string",
        options: {
          list: [
            { title: "Video", value: "video" },
            { title: "Image", value: "image" },
            { title: "Audio", value: "music" },
            { title: "Unknown", value: "unknown" }
          ],
          layout: "radio",
          direction: "horizontal"
        }
      },
      {
        title: 'Asset Description',
        type: 'text',
        name: 'assetDescription',
      },
      {
        title: 'Asset Notes',
        type: 'text',
        name: 'assetNotes',
      },
      {
        title: 'Asset Related Link Text',
        type: 'string',
        name: 'assetRelatedLinkText',
      },
      {
        title: 'Asset Related Link Url',
        type: 'string',
        name: 'assetRelatedLinkUrl',
      },
      {
        title: 'Asset Reference ID',
        type: 'string',
        name: 'assetReferenceId',
      },
      {
        title: 'Asset Uploaded',
        type: 'date',
        name: 'assetUploaded',
      },
      {
        name: 'cincopaAssets',
        title: 'Cincopa Assets',
        type: 'array',
        of: [
          {
            type: 'reference',
            to: [{ type: 'cincopaAsset' }],
          },
        ]
      }
    ],
  }

export const schemaTypes = [
    cincopaAsset,
]

export const uploadFileSchema = {
  name: 'cincopa.uploader',
  type: 'object',
  title: 'Cincopa Asset Uploader',
  fields: [
    {
      title: 'Asset',
      name: 'asset',
      type: 'file',
    },
  ],
}