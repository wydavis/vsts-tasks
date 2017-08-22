Remove-Item -Recurse -Force $PSScriptRoot\..\_build -ErrorAction Ignore
mkdir $PSScriptRoot\..\_build
$tasks = Get-Content -LiteralPath $PSScriptRoot\..\make-options.json |
    ConvertFrom-Json |
    ForEach-Object { $_.tasks }
foreach ($task in $tasks) {
    $webClient = New-Object System.Web.WebClient
    $webClient.Headers['Authorization'] = "Bearer $env:SYSTEM_ACCESSTOKEN"
    $webClient.DownloadFile(
        "$env:SYSTEM_TEAMFOUNDATIONCOLLECTIONURI/$env:SYSTEM_TEAMPROJECTID/_apis/build/builds/$env:BUILD_BUILDID/artifacts?artifactName=$task&%24format=zip",
        "$PSScriptRoot\..\_build\$task.zip")
    Expand-Archive $PSScriptRoot\..\_build\$task.zip $PSScriptRoot\..\_build\$task
}
