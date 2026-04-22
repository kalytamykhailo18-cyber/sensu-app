content = open("/opt/sensu/patches/watch_app.py").read()

marker = "max_age=600,\n)"

handler_code = '''

# CORS headers on 401/403: Starlette HTTPBearer raises 403 before CORSMiddleware wraps it.
from fastapi import Request as _Request
from fastapi.exceptions import HTTPException as _HTTPException
from fastapi.responses import JSONResponse as _JSONResponse

@app.exception_handler(_HTTPException)
async def _cors_http_exc_handler(request: _Request, exc: _HTTPException):
    origin = request.headers.get("origin", "")
    headers = {}
    if origin in _CORS_ORIGINS:
        headers["Access-Control-Allow-Origin"] = origin
        headers["Access-Control-Allow-Credentials"] = "true"
        headers["Vary"] = "Origin"
    if exc.headers:
        headers.update(exc.headers)
    from fastapi.responses import JSONResponse as JR
    return JR(
        status_code=exc.status_code,
        content={"detail": exc.detail},
        headers=headers,
    )
'''

if "_cors_http_exc_handler" in content:
    print("Already patched")
elif marker not in content:
    print("ERROR: marker not found")
else:
    idx = content.index(marker) + len(marker)
    new_content = content[:idx] + handler_code + content[idx:]
    open("/opt/sensu/patches/watch_app.py", "w").write(new_content)
    print("Patched OK")
