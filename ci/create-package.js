var fs = require('fs');
var path = require('path');
var util = require('./ci-util');

// clean the _package folder
util.cleanPackagePath();

// initialize the current-milestone layout
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

var nuspecContent =
    `<?xml version="1.0"?>`
    + `\n`
  # mkdir nugetTest
  # cd nugetTest
  # $now = [System.DateTime]::UtcNow
  # $version = "0.$('{0:yyyyMMdd}' -f $now).$([System.Math]::Floor($now.timeofday.totalseconds))-m123-commit"
  # $nuspecContent = @"
  # <?xml version="1.0"?>
<package>
  <metadata>
    <id>vsts-tasks</id>
    <version>$version</version>
    <authors>vsts</authors>
    <owners>vsts</owners>
    <requireLicenseAcceptance>false</requireLicenseAcceptance>
    <description>vsts-tasks</description>
    <releaseNotes>vsts-tasks</releaseNotes>
    <copyright>Copyright 2017</copyright>
    <tags />
    <dependencies />
  </metadata>
</package>
  # $nuspecContent | Out-File -FilePath vsts-tasks.nuspec -Encoding utf8
