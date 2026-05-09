"""Redis cache client."""
import json
from typing import Any, Optional, Union
from datetime import timedelta

import redis.asyncio as redis

from app.config import settings


class RedisCache:
    """Redis cache wrapper."""
    
    def __init__(self):
        self._redis: Optional[redis.Redis] = None
    
    async def connect(self):
        """Connect to Redis."""
        if self._redis is None:
            self._redis = redis.from_url(
                str(settings.redis_url),
                decode_responses=True
            )
    
    async def disconnect(self):
        """Disconnect from Redis."""
        if self._redis:
            await self._redis.close()
            self._redis = None
    
    async def get(self, key: str) -> Optional[Any]:
        """Get value from cache."""
        await self.connect()
        value = await self._redis.get(key)
        if value is None:
            return None
        try:
            return json.loads(value)
        except json.JSONDecodeError:
            return value
    
    async def set(
        self, 
        key: str, 
        value: Any, 
        expire: Optional[Union[int, timedelta]] = None
    ) -> bool:
        """Set value in cache."""
        await self.connect()
        if not isinstance(value, (str, bytes)):
            value = json.dumps(value)
        return await self._redis.set(key, value, ex=expire)
    
    async def delete(self, key: str) -> bool:
        """Delete key from cache."""
        await self.connect()
        return bool(await self._redis.delete(key))
    
    async def exists(self, key: str) -> bool:
        """Check if key exists."""
        await self.connect()
        return bool(await self._redis.exists(key))
    
    async def expire(self, key: str, seconds: int) -> bool:
        """Set expiration on key."""
        await self.connect()
        return await self._redis.expire(key, seconds)
    
    async def ttl(self, key: str) -> int:
        """Get remaining TTL for key."""
        await self.connect()
        return await self._redis.ttl(key)
    
    async def incr(self, key: str) -> int:
        """Increment value."""
        await self.connect()
        return await self._redis.incr(key)
    
    async def decr(self, key: str) -> int:
        """Decrement value."""
        await self.connect()
        return await self._redis.decr(key)
    
    async def zadd(self, key: str, mapping: dict) -> int:
        """Add to sorted set."""
        await self.connect()
        return await self._redis.zadd(key, mapping)
    
    async def zrevrange(self, key: str, start: int, end: int, withscores: bool = False):
        """Get range from sorted set (high to low)."""
        await self.connect()
        return await self._redis.zrevrange(key, start, end, withscores=withscores)
    
    async def zrank(self, key: str, member: str) -> Optional[int]:
        """Get rank in sorted set."""
        await self.connect()
        return await self._redis.zrank(key, member)
    
    async def hset(self, key: str, field: str, value: Any) -> int:
        """Set hash field."""
        await self.connect()
        if not isinstance(value, str):
            value = json.dumps(value)
        return await self._redis.hset(key, field, value)
    
    async def hget(self, key: str, field: str) -> Optional[Any]:
        """Get hash field."""
        await self.connect()
        value = await self._redis.hget(key, field)
        if value is None:
            return None
        try:
            return json.loads(value)
        except json.JSONDecodeError:
            return value
    
    async def hgetall(self, key: str) -> dict:
        """Get all hash fields."""
        await self.connect()
        data = await self._redis.hgetall(key)
        result = {}
        for field, value in data.items():
            try:
                result[field] = json.loads(value)
            except json.JSONDecodeError:
                result[field] = value
        return result


# Global Redis client instance
redis_client = RedisCache()
