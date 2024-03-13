# Script
Write-Host "== Switching Directory =="
Set-Location $PSScriptRoot
Set-Location ..

Write-Host "== Authentication =="
Connect-AzAccount -Identity

Write-Host "== Get NPM Authorization Token =="
$npmToken = Get-AzKeyVaultSecret -VaultName 'github-runner-sce-kv' -Name 'sce-build-npmtoken' -AsPlainText

Write-Host "== Get Fontawesome Token =="
$faToken = Get-AzKeyVaultSecret -VaultName 'github-runner-sce-kv' -Name 'sce-build-fontawesome' -AsPlainText

Write-Host "== Setup NPMRC File =="
(Get-Content .npmrc).Replace('__SINEQUA_NPM_TOKEN__', $npmToken) | Set-Content .npmrc
(Get-Content .npmrc).Replace('__FONTAWESOME_NPM_TOKEN__', $faToken) | Set-Content .npmrc
Copy-Item ".npmrc" -Destination "npmrc.dl"

Write-Host "== End SCript =="
exit
