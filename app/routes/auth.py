from flask import Blueprint, render_template, request, redirect, url_for, session, flash
from app.models import Usuario
from app import db

bp = Blueprint("auth", __name__)

@bp.route("/login", methods=["GET", "POST"])
def login():
    if request.method == "POST":
        email = request.form.get("email")
        password = request.form.get("password")
        user = Usuario.query.filter_by(email=email).first()
        if user and user.check_password(password):
            session["user_id"] = user.id
            session["user_role"] = user.rol
            flash("Sesión iniciada correctamente", "success")
            return redirect(url_for("main.index"))
        flash("Correo o contraseña incorrectos", "error")
    return render_template("login.html")

@bp.route("/logout")
def logout():
    session.clear()
    flash("Sesión cerrada", "info")
    return redirect(url_for("auth.login"))
