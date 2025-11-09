# seed.py
from app import create_app, db
from app.models import Usuario, Aula, Reserva
from datetime import datetime, timedelta

app = create_app()
app.app_context().push()

# limpiar (opcional, útil en dev)
# db.drop_all()
# db.create_all()

# comprobar si ya hay datos
if Usuario.query.first() or Aula.query.first():
    print("La base ya tiene datos; saliendo.")
else:
    # usuarios de ejemplo
    u1 = Usuario(nombre="Thiagucho", email="thiagucho@example.com", rol="admin")
    u2 = Usuario(nombre="Caff", email="caff@example.com", rol="docente")
    db.session.add_all([u1, u2])
    db.session.flush()  # para tener ids

    # aulas de ejemplo
    a1 = Aula(nombre="A101", capacidad=30, ubicacion="Edificio Central - Piso 1")
    a2 = Aula(nombre="B202", capacidad=20, ubicacion="Edificio Laboratorio - Piso 2")
    db.session.add_all([a1, a2])
    db.session.commit()

    # reservas de ejemplo (mañana y en 2 horas)
    inicio = datetime.utcnow() + timedelta(days=1, hours=9)
    fin = inicio + timedelta(hours=2)
    r1 = Reserva(aula_id=a1.id, usuario_id=u2.id, inicio=inicio, fin=fin, estado="confirmada")
    db.session.add(r1)
    db.session.commit()

    print("Seed completado: usuarios, aulas y 1 reserva.")
