# Links user-redesign issues (#63-71) to the PelambresPlatform GitHub Project.
# Requires: gh auth refresh -h github.com -s project,read:project

$owner = "fede-longhi"
$repo = "PelambresPlatform"
$projectName = "PelambresPlatform"
$issueNumbers = 63..71

Write-Host "Looking for project '$projectName' under $owner..."

$projectList = gh project list --owner $owner --limit 50 --format json | ConvertFrom-Json
$project = $projectList.projects | Where-Object { $_.title -ieq $projectName } | Select-Object -First 1

if (-not $project) {
    Write-Host "Available projects:"
    $projectList.projects | ForEach-Object { Write-Host "  - $($_.title) (#$($_.number))" }
    throw "Project '$projectName' not found."
}

Write-Host "Using project: $($project.title) (#$($project.number))"

foreach ($issueNumber in $issueNumbers) {
    $issueUrl = "https://github.com/$owner/$repo/issues/$issueNumber"
    Write-Host "Adding $issueUrl ..."
    gh project item-add $project.number --owner $owner --url $issueUrl
}

Write-Host "Done. Added issues $($issueNumbers[0])-$($issueNumbers[-1]) to $($project.title)."
