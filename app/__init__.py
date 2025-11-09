# app/__init__.py
from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate

db = SQLAlchemy()
migrate = Migrate()

def create_app(config_object="config.Config"):
    app = Flask(__name__, static_folder="static", template_folder="templates")
    app.config.from_object(config_object)

    # inicializar extensiones
    db.init_app(app)
    migrate.init_app(app, db)

    # IMPORTAR MODELOS AQUÍ para que Alembic los vea en autogenerate
    # <-- añade esta línea:
    from . import models

    # registrar blueprints
    from .routes.main import bp as main_bp
    app.register_blueprint(main_bp)

    from .routes.api import bp as api_bp
    app.register_blueprint(api_bp)

    return app
