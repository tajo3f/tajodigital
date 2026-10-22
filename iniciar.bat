@echo off
setlocal
cd /d "%~dp0"
if not exist .venv (
  echo [TAJO] Criando ambiente virtual...
  python -m venv .venv || goto :error
)
call .venv\Scripts\activate.bat
python -c "import flask, gunicorn" >nul 2>&1
if errorlevel 1 (
  echo [TAJO] Instalando dependencias...
  python -m pip install -r requirements.txt || goto :error
)
echo [TAJO] Iniciando em http://127.0.0.1:5000
start "" http://127.0.0.1:5000
python app.py
goto :eof
:error
echo.
echo Nao foi possivel iniciar. Verifique se Python 3.11+ e internet estao disponiveis para instalar dependencias.
pause
