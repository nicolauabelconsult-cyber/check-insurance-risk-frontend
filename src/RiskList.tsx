# app/routers/risks.py
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from ..db import get_db
from ..deps import require_perm
from ..models import Risk, UserRole
from ..schemas import RiskOut

router = APIRouter(prefix="/risks", tags=["risks"])


@router.get("", response_model=list[RiskOut])
def list_risks(db: Session = Depends(get_db), u=Depends(require_perm("risk:read"))):
    q = db.query(Risk)

    # scoping: clientes só veem a sua entidade
    if u.role not in (UserRole.SUPER_ADMIN, UserRole.ADMIN):
        q = q.filter(Risk.entity_id == u.entity_id)

    rows = q.order_by(Risk.created_at.desc()).all()

    def pick(r, *names, default=None):
        for n in names:
            if hasattr(r, n):
                return getattr(r, n)
        return default

    return [
        RiskOut(
            id=pick(r, "id"),
            entity_id=pick(r, "entity_id"),
            # ✅ aqui está o fix: tenta vários nomes
            name=pick(r, "name", "full_name", "person_name", "candidate_name"),
            bi=pick(r, "bi", "bi_number", "id_bi"),
            passport=pick(r, "passport", "passport_number", "id_passport"),
            nationality=pick(r, "nationality", "country", "citizenship"),
            score=pick(r, "score"),
            summary=pick(r, "summary"),
            matches=pick(r, "matches", default=[]) or [],
            status=pick(r, "status"),
        )
        for r in rows
    ]
