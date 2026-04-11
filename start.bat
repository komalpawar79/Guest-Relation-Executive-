@echo off
REM Start MongoDB (if installed locally)
echo Starting MongoDB...
REM mongod.exe

REM Start Backend
echo Starting Backend Server...
cd backend
call npm install
start cmd /k npm run dev

REM Wait for backend to start
timeout /t 3

REM Start Frontend
echo Starting Frontend Development Server...
cd ..\frontend
call npm install
start cmd /k npm run dev

echo Both servers started!
pause
