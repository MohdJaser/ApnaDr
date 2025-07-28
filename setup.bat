@echo off
echo ========================================
echo    MediReach Backend Setup
echo ========================================
echo.

echo Installing Node.js dependencies...
npm install

echo.
echo ========================================
echo    Starting MediReach Backend Server
echo ========================================
echo.
echo Server will be available at: http://localhost:3000
echo API Documentation: http://localhost:3000/api/health
echo.
echo Press Ctrl+C to stop the server
echo.

npm start 