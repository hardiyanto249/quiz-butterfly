@echo off
echo Starting Quiz Butterfly Application...
echo.

echo Step 1: Starting Backend Server...
start cmd /k "cd backend && go run ."

timeout /t 3 /nobreak > nul

echo Step 2: Starting Frontend Server...
start cmd /k "npm run dev"

echo.
echo Application started successfully!
echo - Backend API: http://localhost:8080
echo - Frontend App: http://localhost:5173
echo.
echo Press any key to close this window...
pause > nul