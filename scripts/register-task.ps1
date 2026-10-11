# One-time setup: registers a Windows Task Scheduler job that runs
# sync-and-deploy.ps1 once a day while you're logged in. Run this once,
# manually, from an ordinary (non-admin) PowerShell prompt:
#
#   powershell -ExecutionPolicy Bypass -File scripts\register-task.ps1
#
# To change how often it runs, edit $RunTime below and re-run this
# script - it replaces the existing task registration.

$TaskName = 'MotifFarmSorter-SyncAndDeploy'
$RunTime = '22:25'

$ProjectDir = Split-Path -Parent $PSScriptRoot
$ScriptPath = Join-Path $ProjectDir 'scripts\sync-and-deploy.ps1'

$Action = New-ScheduledTaskAction `
    -Execute 'powershell.exe' `
    -Argument "-NoProfile -ExecutionPolicy Bypass -WindowStyle Hidden -File `"$ScriptPath`""

$Trigger = New-ScheduledTaskTrigger -Daily -At $RunTime

$Settings = New-ScheduledTaskSettingsSet `
    -StartWhenAvailable `
    -DontStopOnIdleEnd `
    -ExecutionTimeLimit (New-TimeSpan -Minutes 15)

Register-ScheduledTask `
    -TaskName $TaskName `
    -Action $Action `
    -Trigger $Trigger `
    -Settings $Settings `
    -Description 'Checks TTC addon data for updates and, if changed, rebuilds + commits + pushes motif-farm-sorter (triggering a Vercel auto-deploy).' `
    -Force `
    -ErrorAction Stop

Write-Host "Registered scheduled task '$TaskName' - runs daily at $RunTime while you're logged in."
Write-Host "View/manage it in Task Scheduler (taskschd.msc), or remove it with:"
Write-Host "  Unregister-ScheduledTask -TaskName '$TaskName' -Confirm:`$false"
