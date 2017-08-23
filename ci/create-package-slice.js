var fs = require('fs');
var path = require('path');
var util = require('./ci-util');

// clean the _package folder
util.cleanPackagePath();

// build the layout for the nested task zips
console.log();
console.log('> Linking content for nested task zips');
var nestedZipsContentPath = path.join(util.packagePath, 'nested-zips-layout');
util.linkNonAggregatedLayoutContent(util.buildPath, nestedZipsContentPath, /*metadataOnly*/false);

// create the nested task zips (part of the package slice layout)
console.log();
console.log('> Creating nested task zips (content for package slice)');
var packageSliceLayoutPath = path.join(util.packagePath, 'package-slice-layout');
util.compressTasks(nestedZipsContentPath, packageSliceLayoutPath, /*individually:*/true);

// link the task metadata into the package slice layout
console.log();
console.log('> Linking metadata content for package slice');
util.linkNonAggregatedLayoutContent(util.buildPath, packageSliceLayoutPath, /*metadataOnly*/true);

//     // mark the layout with a version number.
//     // servicing supports both this new format and the legacy layout format as well.
//     fs.writeFileSync(path.join(packageSliceLayoutPath, 'layout-version.txt'), '2');

// zip the package slice
console.log();
console.log('> Zipping the package slice')
var packageSliceZipPath = path.join(util.packagePath, util.packageSliceZipName)
util.compressTasks(packageSliceLayoutPath, packageSliceZipPath);

//     // create the non-aggregated tasks zip
//     console.log();
//     console.log('> Zipping non-aggregated tasks layout');
//     var nonAggregatedZipPath = path.join(packagePath, 'non-aggregated-tasks.zip');
//     compressTasks(packageSliceLayoutPath, nonAggregatedZipPath);
// }
// exports.createNonAggregatedZip = createNonAggregatedZip;
