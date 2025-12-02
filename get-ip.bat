@echo off
echo ========================================
echo   DESCOBRINDO SEU IP DA REDE LOCAL
echo ========================================
echo.

ipconfig | findstr /i "IPv4"

echo.
echo ========================================
echo COPIE O IP IPv4 acima e cole em:
echo src/config/api.config.ts
echo.
echo Exemplo: 192.168.0.10
echo ========================================
pause
