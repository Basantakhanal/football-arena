
import os
from flask import Flask, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
from extensions import db
from routes import api

load_dotenv()

def create_app():
    app = Flask(__name__)

    database_url = os.getenv("DATABASE_URL")

    if not database_url:
        raise RuntimeError("DATABASE_URL is missing from .env file")

    app.config["SQLALCHEMY_DATABASE_URI"] = database_url
    app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

    CORS(app)
    db.init_app(app)

    app.register_blueprint(api)

    with app.app_context():
        db.create_all()

    @app.route("/")
    def home():
        return jsonify({"message": "Football API is running"})

    return app


app = create_app()

if __name__ == "__main__":
    app.run(debug=True, port=5000)
