@echo off
echo Installing MCP Tools for Cursor...
echo.

echo Installing Puppeteer MCP Server...
call npx -y @modelcontextprotocol/server-puppeteer --version
echo.

echo Installing Playwright MCP Server...
call npx -y @modelcontextprotocol/server-playwright --version
echo.

echo Installing Memory MCP Server...
call npx -y @modelcontextprotocol/server-memory --version
echo.

echo Installing GitHub MCP Server...
call npx -y @modelcontextprotocol/server-github --version
echo.

echo Installing Filesystem MCP Server...
call npx -y @modelcontextprotocol/server-filesystem --version
echo.

echo MCP Tools Installation Complete!
echo.
echo Please restart Cursor for the changes to take effect.
echo.
pause 