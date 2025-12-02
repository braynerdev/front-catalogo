@echo off
echo ========================================
echo   TESTANDO CONEXAO COM A API
echo ========================================
echo.
echo Testando: http://192.168.0.106:7157/api/auth/login
echo.

curl -X POST http://192.168.0.106:7157/api/auth/login -H "Content-Type: application/json" -d "{\"username\":\"test\",\"password\":\"test\"}" -v

echo.
echo ========================================
echo Se aparecer "Connection refused" ou timeout:
echo   - A API nao esta rodando
echo   - A porta esta errada
echo   - O firewall esta bloqueando
echo.
echo Se aparecer erro 400/401/500:
echo   - A API esta OK! O problema e outro
echo ========================================
pause
