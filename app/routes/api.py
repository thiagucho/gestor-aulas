# app/routes/api.py
from flask import Blueprint, request, jsonify
from app import db
from app.models import Reserva, Aula, Usuario
from datetime import datetime

bp = Blueprint("api", __name__, url_prefix="/api")

def parse_iso(dt_str):
    """
    Parse minimal ISO-like datetime strings from frontend (datetime-local).
    Accepts 'YYYY-MM-DDTHH:MM' or 'YYYY-MM-DDTHH:MM:SS' or full ISO.
    Returns naive datetime (UTC by convention for this prototype).
    """
    try:
        # Python 3.7+: fromisoformat can parse 'YYYY-MM-DDTHH:MM' and 'YYYY-MM-DDTHH:MM:SS'
        return datetime.fromisoformat(dt_str)
    except Exception as e:
        raise ValueError(f"Invalid datetime format: {dt_str}") from e

@bp.route("/reservas", methods=["POST"])
def create_reserva():
    """
    JSON body:
    {
      "aula_id": int,
      "usuario_id": int,
      "inicio": "YYYY-MM-DDTHH:MM",
      "fin":    "YYYY-MM-DDTHH:MM"
    }
    """
    data = request.get_json(silent=True)
    if not data:
        return jsonify({"error": "JSON body required"}), 400

    # required fields
    for k in ("aula_id", "usuario_id", "inicio", "fin"):
        if k not in data:
            return jsonify({"error": f"Missing field: {k}"}), 400

    try:
        aula_id = int(data["aula_id"])
        usuario_id = int(data["usuario_id"])
    except Exception:
        return jsonify({"error": "aula_id and usuario_id must be integers"}), 400

    # parse datetimes
    try:
        inicio = parse_iso(data["inicio"])
        fin = parse_iso(data["fin"])
    except ValueError as e:
        return jsonify({"error": str(e)}), 400

    if inicio >= fin:
        return jsonify({"error": "inicio must be before fin"}), 400

    # check aula and usuario exist
    aula = Aula.query.get(aula_id)
    if not aula:
        return jsonify({"error": "Aula not found"}), 404
    usuario = Usuario.query.get(usuario_id)
    if not usuario:
        return jsonify({"error": "Usuario not found"}), 404

    # Conflict detection:
    # find any existing reserva for same aula where (existing.inicio < fin) and (inicio < existing.fin)
    conflict = Reserva.query.filter(
        Reserva.aula_id == aula_id,
        Reserva.inicio < fin,
        inicio < Reserva.fin
    ).first()

    if conflict:
        return (
            jsonify({
                "error": "conflict",
                "message": "La reserva se solapa con otra existente",
                "conflict_id": conflict.id,
                "conflict_inicio": conflict.inicio.isoformat(),
                "conflict_fin": conflict.fin.isoformat()
            }),
            409
        )

    # create and commit
    reserva = Reserva(aula_id=aula_id, usuario_id=usuario_id, inicio=inicio, fin=fin, estado="pendiente")
    db.session.add(reserva)
    try:
        db.session.commit()
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": "db_error", "message": str(e)}), 500

    return jsonify({
        "id": reserva.id,
        "aula_id": reserva.aula_id,
        "usuario_id": reserva.usuario_id,
        "inicio": reserva.inicio.isoformat(),
        "fin": reserva.fin.isoformat(),
        "estado": reserva.estado
    }), 201
