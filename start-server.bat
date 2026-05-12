@echo off
cd /d "%~dp0"

echo Starting MongoDB...
net start MongoDB >nul 2>&1

echo Starting Node server...
echo.
echo Open this in your browser:
echo http://localhost:3000/HTML/personal_expense.html
echo.
npm start
