const fs = require('node:fs');
const path = require('node:path');

const pickerSource = path.join(
  __dirname,
  '..',
  'node_modules',
  'react-native-image-picker',
  'ios',
  'ImagePickerManager.mm',
);

const currentBlock = `    if(phAsset){
        NSArray<PHAssetResource *> *resources = [PHAssetResource assetResourcesForAsset:phAsset];
        for (PHAssetResource *resource in resources) {
            if ((resource.type == PHAssetResourceTypePhoto || resource.type == PHAssetResourceTypeFullSizePhoto) && resource.originalFilename.length > 0) {
                asset[@"fileName"] = resource.originalFilename;
                break;
            }
        }
        asset[@"timestamp"] = [self getDateTimeInUTC:phAsset.creationDate];
        asset[@"id"] = phAsset.localIdentifier;
        // Add more extra data here ...
    }`;

const originalBlock = `    if(phAsset){
        asset[@"timestamp"] = [self getDateTimeInUTC:phAsset.creationDate];
        asset[@"id"] = phAsset.localIdentifier;
        // Add more extra data here ...
    }`;

if (!fs.existsSync(pickerSource)) {
  throw new Error(`react-native-image-picker source not found: ${pickerSource}`);
}

const source = fs.readFileSync(pickerSource, 'utf8');
if (source.includes(currentBlock)) {
  process.exit(0);
}
if (!source.includes(originalBlock)) {
  throw new Error('Image picker filename patch target did not match the installed package source.');
}

fs.writeFileSync(pickerSource, source.replace(originalBlock, currentBlock));
