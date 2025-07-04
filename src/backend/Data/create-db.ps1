# This script simplifies the creation of a LocalDB database for IT-Ticket.
# For automation purposes there are exit codes. 
# To run this script WITHOUT confirmation, use the -Force parameter.

$databaseName = "IT-Ticket-db"
$scriptDirectory = Split-Path -Path $MyInvocation.MyCommand.Definition

# Request user confirmation before proceeding
Write-Host "Do you want to create the MDF database in the following location? (This program is laied out that the database file is called 'IT-Ticket-db.mdf' and is stored under /Data/IT-Ticket-db.mdf)"

Write-Host $scriptDirectory -ForegroundColor Yellow

$confirmation = Read-Host "Type 'yes' or 'y' to proceed, or anything else to abort"

# Skip confirmation if the Force parameter is used
if ($PSBoundParameters.ContainsKey('Force') -or $PSBoundParameters.ContainsKey('force') -or $PSBoundParameters.ContainsKey('f') -or $PSBoundParameters.ContainsKey('F')) {
    $confirmation = "yes"
}

# Check user confirmation
if ($confirmation.ToLower() -ne "yes" -and $confirmation.ToLower() -ne "y") {
    Write-Host "Operation aborted by the user." -ForegroundColor Red
    exit 1
}

# Build the full file paths
$mdfPath = Join-Path -Path $scriptDirectory -ChildPath "${databaseName}.mdf"
$ldfPath = Join-Path -Path $scriptDirectory -ChildPath "${databaseName}_log.ldf"

# Check if MDF or LDF file already exists
if (Test-Path $mdfPath) {
    Write-Host "The MDF file already exists. Please choose a different name." -ForegroundColor Red
    exit 2
}
if (Test-Path $ldfPath) {
    Write-Host "The LDF file already exists. Please choose a different name." -ForegroundColor Red
    exit 3
}

# Prepare the SQL command to create the database
$sql = @"
CREATE DATABASE [$databaseName]
ON (
    NAME = '${databaseName}_Data',
    FILENAME = '$mdfPath',
    SIZE = 5MB,
    MAXSIZE = 100MB,
    FILEGROWTH = 5MB
)
LOG ON (
    NAME = '${databaseName}_Log',
    FILENAME = '$ldfPath',
    SIZE = 1MB,
    MAXSIZE = 25MB,
    FILEGROWTH = 5MB
);
"@

# Execute the SQL command using sqlcmd
# Attention: Ensure that sqlcmd is installed and available in your PATH
sqlcmd -S "np:\\.\pipe\LOCALDB#45FD8BA4\tsql\query" -Q $sql

# Check if the command was successful
if ($LASTEXITCODE -eq 0) {
    Write-Host "Database $databaseName created successfully." -ForegroundColor Green
    exit 0
} else {
    Write-Host "Failed to create database $databaseName." -ForegroundColor Red
    exit 4
}