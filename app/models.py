from . import db
from datetime import datetime
from werkzeug.security import generate_password_hash, check_password_hash
from app import db

class Usuario(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    nombre = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(128))
    rol = db.Column(db.String(20), default="alumno")  # 'admin' o 'alumno'

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

    def __repr__(self):
        return f"<Usuario {self.nombre} ({self.rol})>"


class Aula(db.Model):
    __tablename__ = "aula"
    id = db.Column(db.Integer, primary_key=True)
    nombre = db.Column(db.String(50), nullable=False)
    capacidad = db.Column(db.Integer, default=30)
    ubicacion = db.Column(db.String(120))

    def __repr__(self):
        return f"<Aula {self.id} {self.nombre}>"

class Reserva(db.Model):
    __tablename__ = "reserva"
    id = db.Column(db.Integer, primary_key=True)
    aula_id = db.Column(db.Integer, db.ForeignKey("aula.id"), nullable=False)
    usuario_id = db.Column(db.Integer, db.ForeignKey("usuario.id"), nullable=False)
    inicio = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    fin = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    estado = db.Column(db.String(20), default="pendiente")

    aula = db.relationship("Aula", backref=db.backref("reservas", lazy="dynamic"))
    usuario = db.relationship("Usuario", backref=db.backref("reservas", lazy="dynamic"))

    def __repr__(self):
        return f"<Reserva {self.id} aula={self.aula_id} user={self.usuario_id}>"
