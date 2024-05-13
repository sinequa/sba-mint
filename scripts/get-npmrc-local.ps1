# Global variables
$binStAccount    = "stsnqa"
$binStContainer  = "bin"
$npmrcBlob       = "WPSBUILD/npmrc.txt"

# Script
Write-Host "== Switching directory"
cd $PSScriptRoot
cd ..

Write-Host "== Login in"
$r = az login --identity --allow-no-subscriptions

Write-Host "== Downloading blob"
del -Force npmrc.dl
az storage blob download --account-name $binStAccount -c $binStContainer -n $npmrcBlob --auth-mode login -f npmrc.dl --no-progress
copy npmrc.dl .npmrc

Write-Host "== End"
exit