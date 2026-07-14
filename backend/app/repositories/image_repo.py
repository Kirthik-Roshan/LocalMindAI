"""Image record repository."""

from __future__ import annotations

from app.db.models import ImageRecord
from app.repositories.base import BaseRepository


class ImageRepository(BaseRepository[ImageRecord]):
    model = ImageRecord
