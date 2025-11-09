# app/routes/main.py  (sustituir/añadir)
from flask import Blueprint, render_template, jsonify
from app.models import Aula

bp = Blueprint("main", __name__)

@bp.route("/")
def index():
    return render_template("index.html", title="Gestor de Aulas")

@bp.route("/ping")
def ping():
    return jsonify(status="ok", who="backend")

@bp.route("/aulas")
def aulas():
    list_aulas = Aula.query.all()
    data = [{"id": a.id, "nombre": a.nombre, "capacidad": a.capacidad, "ubicacion": a.ubicacion} for a in list_aulas]
    return jsonify(data)
