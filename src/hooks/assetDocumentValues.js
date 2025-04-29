import {isReference} from 'sanity'
import {useDocumentValues} from 'sanity'

const path = ['assetRid']
export const assetDocumentValues = (asset) => useDocumentValues(isReference(asset) ? asset._ref : '', path);
