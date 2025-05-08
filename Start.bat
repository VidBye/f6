@echo off
setlocal

rem Store current directory
set "CURRENT_DIR=%cd%"

rem Navigate to parent directory
cd ..
set "PARENT_DIR=%cd%"

rem Check if venv directory exists in parent directory
if not exist "%PARENT_DIR%\venv" (
    echo Virtual environment not found. Creating one in parent directory...
    python -m venv "%PARENT_DIR%\venv"
    if errorlevel 1 (
        echo Failed to create virtual environment.
        cd "%CURRENT_DIR%"
        exit /b 1
    )
    echo Virtual environment created successfully in parent directory.
)

rem Return to original directory
cd "%CURRENT_DIR%"

rem Activate venv from parent directory
call "%PARENT_DIR%\venv\Scripts\activate"

echo Virtual environment is now active.
echo Type 'deactivate' to exit the virtual environment.

rem Keep the window open
cmd /k