# app/routes/main.py  (sustituir/añadir)
from flask import Blueprint, render_template, jsonify
from app.models import Aula, Reserva
from flask import session, redirect, url_for, render_template, request
from app import app, db

def solo_admin():
    return session.get("user_role") == "admin"

@app.route("/panel")
def panel_admin():
    if not solo_admin():
        return redirect(url_for("auth.login"))
    return render_template("panel.html")


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


bp = Blueprint("main", __name__)

# Función de seguridad
def solo_admin():
    return session.get("user_role") == "admin"

@bp.route("/panel-admin")
def panel_admin():
    # si no es admin, lo echamos al login
    if not solo_admin():
        return redirect(url_for("auth.login"))
    
    reservas = Reserva.query.order_by(Reserva.id.desc()).all()
    aulas = Aula.query.all()
    return render_template("panel-admin.html", reservas=reservas, aulas=aulas)

@bp.route("/panel-admin/aprobar/<int:id>", methods=["POST"])
def aprobar_reserva(id):
    if not solo_admin():
        return redirect(url_for("auth.login"))
    reserva = Reserva.query.get_or_404(id)
    reserva.estado = "aprobada"
    db.session.commit()
    return redirect(url_for("main.panel_admin"))

@bp.route("/panel-admin/rechazar/<int:id>", methods=["POST"])
def rechazar_reserva(id):
    if not solo_admin():
        return redirect(url_for("auth.login"))
    reserva = Reserva.query.get_or_404(id)
    reserva.estado = "rechazada"
    db.session.commit()
    return redirect(url_for("main.panel_admin"))

@bp.route("/panel-admin/crear-aula", methods=["POST"])
def crear_aula():
    if not solo_admin():
        return redirect(url_for("auth.login"))
    nombre = request.form.get("nombre")
    capacidad = request.form.get("capacidad")
    nueva = Aula(nombre=nombre, capacidad=capacidad)
    db.session.add(nueva)
    db.session.commit()
    return redirect(url_for("main.panel_admin"))

@bp.route("/panel-admin/borrar-aula/<int:id>", methods=["POST"])
def borrar_aula(id):
    if not solo_admin():
        return redirect(url_for("auth.login"))
    aula = Aula.query.get_or_404(id)
    db.session.delete(aula)
    db.session.commit()
    return redirect(url_for("main.panel_admin"))

