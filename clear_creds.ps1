$targets = @('git:https://github.com', 'git:https://mayanksingh-ai1@github.com')
foreach ($t in $targets) {
    $result = cmdkey /delete:$t 2>&1
    Write-Host "Deleted '$t': $result"
}

# Use git credential-manager to erase cached entry
$credInput = "protocol=https`nhost=github.com`n"
$credInput | & "git" "credential-manager" "erase" 2>&1
Write-Host "Credential cache cleared."

# Verify by listing what is left
Write-Host ""
Write-Host "Remaining GitHub entries in credential store:"
cmdkey /list | Select-String "github" -CaseSensitive:$false
