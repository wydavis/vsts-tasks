$tasks = ConvertFrom-Json -InputObject $env:TASK_ARRAY
foreach ($task in $tasks) {
    $taskJson = Get-Content -FilePath $PSScriptRoot\..\Tasks\$task\task.json | ConvertFrom-Json
    $layoutDirectory = "$PSScriptRoot\..\_build\$($taskJson.name)"
    Write-Host "##vso[artifact.upload artifactName=$task; containerFolder=$task]$layoutDirectory"
}
