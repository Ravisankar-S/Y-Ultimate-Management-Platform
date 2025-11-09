from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from loguru import logger
import time


class LoggingMiddleware(BaseHTTPMiddleware):
    """Middleware to log all HTTP requests with timing and cache invalidation detection."""
    
    async def dispatch(self, request: Request, call_next):
        start_time = time.time()
        
        response = await call_next(request)
        
        duration = time.time() - start_time
        
        # Detect cache invalidation operations
        cache_indicators = ["POST", "PUT", "PATCH", "DELETE"]
        cache_paths = ["/tournaments", "/teams", "/matches", "/spirit"]
        
        is_mutation = request.method in cache_indicators
        affects_cache = any(path in str(request.url.path) for path in cache_paths)
        
        if is_mutation and affects_cache:
            logger.info(
                f"{request.method} {request.url.path} | Status: {response.status_code} | "
                f"Duration: {duration:.3f}s | Cache: likely invalidated"
            )
        else:
            logger.info(
                f"{request.method} {request.url.path} | Status: {response.status_code} | "
                f"Duration: {duration:.3f}s"
            )
        
        return response
