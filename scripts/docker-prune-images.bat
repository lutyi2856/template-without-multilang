@echo off
chcp 65001 >nul
echo Deleting unused Docker images...
docker image prune -a -f
echo.
echo Done. Check free space on C:
pause
