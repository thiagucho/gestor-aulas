from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate

db = SQLAlchemy()
migrate = Migrate()

def create_app(config_object="config.Config"):
    app = Flask(__name__, static_folder="static", template_folder="templates")
    app.config.from_object(config_object)

    db.init_app(app)
    migrate.init_app(app, db)

    from . import models
    from .routes.main import bp as main_bp
    app.register_blueprint(main_bp)

    from .routes.api import bp as api_bp
    app.register_blueprint(api_bp)

    from .routes.auth import bp as auth_bp
    app.register_blueprint(auth_bp)

    return app
