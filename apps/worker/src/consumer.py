from __future__ import annotations

import argparse
import asyncio
from datetime import datetime, timezone

from sqlalchemy import select

from apps.api.src.db.models import AgentRun
from apps.api.src.db.session import dispose_engine, get_session_factory
from apps.api.src.schemas.common import RunStatus
from apps.worker.src.jobs.agent_runs.run_job import run_agent_job


async def process_one() -> bool:
    """Process one pending agent run from the current scaffold.

    The product TODO still calls for a real queue. Until then, this worker
    consumes RECEIVED agent runs directly from the database.
    """
    async with get_session_factory()() as session:
        run = (
            await session.execute(
                select(AgentRun)
                .where(AgentRun.status == RunStatus.RECEIVED.value)
                .order_by(AgentRun.created_at)
                .limit(1)
            )
        ).scalar_one_or_none()
        if run is None:
            return False

        run.status = RunStatus.ROUTED.value
        run.updated_at = datetime.now(timezone.utc)
        await session.commit()

        try:
            await run_agent_job(str(run.id))
        except NotImplementedError:
            run.status = RunStatus.FAILED.value
            run.answer = "Worker job is not implemented yet."
        except Exception as exc:
            run.status = RunStatus.FAILED.value
            run.answer = f"{type(exc).__name__}: {exc}"
        else:
            run.status = RunStatus.COMPLETED.value

        run.updated_at = datetime.now(timezone.utc)
        await session.commit()
        return True


async def run_forever(poll_interval: float) -> None:
    while True:
        if not await process_one():
            await asyncio.sleep(poll_interval)


async def main() -> None:
    parser = argparse.ArgumentParser(description="Run the MyTasco worker consumer.")
    parser.add_argument("--once", action="store_true", help="Process at most one pending run and exit.")
    parser.add_argument("--poll-interval", type=float, default=0.5, help="Seconds to wait when no work is available.")
    args = parser.parse_args()

    try:
        if args.once:
            await process_one()
        else:
            await run_forever(args.poll_interval)
    finally:
        await dispose_engine()


if __name__ == "__main__":
    asyncio.run(main())
