import os
from celery import Celery

# Helper to get env vars safely
def get_env(key, default):
    return os.environ.get(key, default)

REDIS_HOST = get_env("REDIS_HOST", "redis")
REDIS_PORT = get_env("REDIS_PORT", "6379")
REDIS_PASSWORD = get_env("REDIS_PASSWORD", "changeme")
BROKER_URL = f"redis://:{REDIS_PASSWORD}@{REDIS_HOST}:{REDIS_PORT}/0"
BACKEND_URL = f"redis://:{REDIS_PASSWORD}@{REDIS_HOST}:{REDIS_PORT}/0"

celery_app = Celery(
    "meshrf_worker",
    broker=BROKER_URL,
    backend=BACKEND_URL,
    include=["tasks.viewshed", "tasks.optimize"] # Pre-load modules
)

celery_app.conf.update(
    task_serializer="json",
    result_serializer="json",
    accept_content=["json"],
    worker_prefetch_multiplier=1, # Important for CPU-bound tasks
    task_acks_late=True,
)
