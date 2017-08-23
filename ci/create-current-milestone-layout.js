var fs = require('fs');
var path = require('path');
var util = require('./ci-util');

// clean the _package folder
util.cleanPackagePath();

// initialize the current-milestone layout
fs.mkdirSync(path.dirname(util.currentMilestoneLayoutPath));
fs.mkdirSync(util.currentMilestoneLayoutPath);

// mark the layout with a version number.
// servicing supports both this new format and the legacy layout format as well.
fs.writeFileSync(path.join(util.currentMilestoneLayoutPath, 'layout-version.txt'), '2');

// get the package-slice artifact names
var artifactNames = fs.readdirSync(process.env.SYSTEM_ARTIFACTSDIRECTORY)
    .filter(function (val) {
        return val.match(/^package-slice-/);
    });
if (!artifactNames || !artifactNames.length) {
    throw new Error("expected artifact folders not found");
}

for (var i = 0; i < artifactNames.length; i++) {
    // extract the artifact
    var artifactName = artifactNames[i];
    var artifactZipPath = path.join(process.env.SYSTEM_ARTIFACTSDIRECTORY, artifactName, util.packageSliceZipName);
    var packageSlicePath = path.join(util.packagePath, artifactName);
    util.expandTasks(artifactZipPath, packageSlicePath);

    // link the artifact
    fs.readdirSync(packageSlicePath).forEach(function (itemName) {
        var itemSourcePath = path.join(packageSlicePath, itemName);
        var itemDestPath = path.join(util.currentMilestoneLayoutPath, itemName);
        fs.symlinkSync(itemSourcePath, itemDestPath, 'junction');
    });
}

// get the branch/commit info
var refs = util.getRefs();
assert(refs.head.commit, 'refs.head.commit');
if (refs.head.release) {
    // create the nuspec file
    var nuspecContent =
        `<?xml version="1.0"?>`
        + `\n<package>`
        + `\n  <metadata>`
        + `\n    <id>vsts-tasks-milestone</id>`
        + `\n    <version>0.1.0-m${refs.head.release}-${refs.head.commit}</version>`
        + `\n    <authors>vsts</authors>`
        + `\n    <owners>vsts</owners>`
        + `\n    <requireLicenseAcceptance>false</requireLicenseAcceptance>`
        + `\n    <description>vsts-tasks</description>`
        + `\n    <releaseNotes>vsts-tasks</releaseNotes>`
        + `\n    <copyright>Copyright 2017</copyright>`
        + `\n    <tags />`
        + `\n    <dependencies />`
        + `\n  </metadata>`
        + `\n</package>`;
    var nuspecPath = path.join(util.packagePath, 'vsts-tasks-milestone.nuspec');
    fs.writeFileSync(nuspecPath, nuspecContent);
}
