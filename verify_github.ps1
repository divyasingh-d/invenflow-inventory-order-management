$repo = "divyasingh-d/invenflow-inventory-order-management"
$commits = Invoke-RestMethod "https://api.github.com/repos/$repo/commits?per_page=10"
Write-Host "=== GitHub Repository Verification ===" -ForegroundColor Cyan
Write-Host "Repo  : https://github.com/$repo"
Write-Host "Branch: main"
Write-Host "Commits pushed: $($commits.Count)"
Write-Host ""
Write-Host "Commit history:"
foreach ($c in $commits) {
    $sha = $c.sha.Substring(0, 7)
    $msg = $c.commit.message.Split([Environment]::NewLine)[0]
    Write-Host "  $sha - $msg"
}

Write-Host ""
Write-Host "Repository contents (root):"
$contents = Invoke-RestMethod "https://api.github.com/repos/$repo/contents/"
foreach ($f in $contents) {
    Write-Host "  $($f.type.PadRight(4)) $($f.name)"
}
