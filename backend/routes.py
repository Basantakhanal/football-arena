
from flask import Blueprint, request, jsonify
from sqlalchemy import text
from extensions import db
from models import Player, Country, Club

api = Blueprint("api", __name__, url_prefix="/api")


# ==========================================
# DATABASE HEALTH CHECK
# ==========================================

@api.route("/health", methods=["GET"])
def health():
    try:
        db.session.execute(text("SELECT 1"))

        return jsonify({
            "status": "connected",
            "database": "Supabase PostgreSQL",
            "message": "Database connection successful"
        }), 200

    except Exception as e:
        db.session.rollback()

        return jsonify({
            "status": "error",
            "database": "disconnected",
            "message": str(e)
        }), 500


# ==========================================
# GET ALL PLAYERS
# ==========================================

@api.route("/players", methods=["GET"])
def get_players():
    players = Player.query.order_by(
        Player.id.desc()
    ).all()

    return jsonify([
        player.to_dict() for player in players
    ]), 200


# ==========================================
# GET SINGLE PLAYER
# ==========================================

@api.route("/players/<int:player_id>", methods=["GET"])
def get_player(player_id):
    player = db.session.get(Player, player_id)

    if not player:
        return jsonify({
            "success": False,
            "message": "Player not found"
        }), 404

    return jsonify(player.to_dict()), 200


# ==========================================
# ADD PLAYER
# ==========================================

@api.route("/players", methods=["POST"])
def add_player():
    data = request.get_json() or {}

    try:
        name = (data.get("name") or "").strip()
        position = (data.get("position") or "").strip()

        country_name = (data.get("country") or "").strip()
        club_name = (data.get("club") or "").strip()

        if not name or not position:
            return jsonify({
                "success": False,
                "message": "Name and position are required."
            }), 400

        if not country_name and not data.get("country_id"):
            return jsonify({
                "success": False,
                "message": "Country is required."
            }), 400

        # --------------------------------------
        # FIND OR CREATE COUNTRY
        # --------------------------------------

        country = None

        if data.get("country_id"):
            country = db.session.get(
                Country,
                data["country_id"]
            )

            if not country:
                return jsonify({
                    "success": False,
                    "message": "Country not found."
                }), 400

        elif country_name:
            country = Country.query.filter(
                db.func.lower(Country.name) ==
                country_name.lower()
            ).first()

            if not country:
                country = Country(
                    name=country_name,
                    flag_url=data.get("country_flag", "")
                )

                db.session.add(country)
                db.session.flush()

        # --------------------------------------
        # FIND OR CREATE CLUB
        # --------------------------------------

        club = None

        if data.get("club_id"):
            club = db.session.get(
                Club,
                data["club_id"]
            )

            if not club:
                return jsonify({
                    "success": False,
                    "message": "Club not found."
                }), 400

        elif club_name:
            club = Club.query.filter(
                db.func.lower(Club.name) ==
                club_name.lower()
            ).first()

            if not club:
                club = Club(
                    name=club_name,
                    logo_url=data.get("club_logo", "")
                )

                db.session.add(club)
                db.session.flush()

            elif data.get("club_logo"):
                club.logo_url = data["club_logo"]

        # --------------------------------------
        # CREATE PLAYER
        # --------------------------------------

        player = Player(
            name=name,
            position=position,
            age=data.get("age"),
            rating=data.get("rating") or 0,
            league=data.get("league") or "Other",
            goals=data.get("goals") or 0,
            assists=data.get("assists") or 0,
            minutes=data.get("minutes") or 0,
            status=data.get("status") or "Active",
            photo_url=data.get("photo_url", ""),

            country_id=country.id if country else None,
            club_id=club.id if club else None
        )

        db.session.add(player)
        db.session.commit()

        return jsonify({
            "success": True,
            "message": "Player added successfully",
            "player": player.to_dict()
        }), 201

    except Exception as e:
        db.session.rollback()

        return jsonify({
            "success": False,
            "message": str(e)
        }), 500


# ==========================================
# UPDATE PLAYER
# ==========================================

@api.route("/players/<int:player_id>", methods=["PUT"])
def update_player(player_id):
    player = db.session.get(Player, player_id)

    if not player:
        return jsonify({
            "success": False,
            "message": "Player not found"
        }), 404

    data = request.get_json() or {}

    try:
        # BASIC FIELDS
        fields = [
            "name",
            "position",
            "age",
            "rating",
            "league",
            "goals",
            "assists",
            "minutes",
            "status",
            "photo_url"
        ]

        for field in fields:
            if field in data:
                setattr(player, field, data[field])

        # --------------------------------------
        # UPDATE COUNTRY
        # --------------------------------------

        if "country_id" in data or "country" in data:

            country = None

            if data.get("country_id"):
                country = db.session.get(
                    Country,
                    data["country_id"]
                )

                if not country:
                    return jsonify({
                        "success": False,
                        "message": "Country not found."
                    }), 400

            elif data.get("country"):
                country_name = data["country"].strip()

                country = Country.query.filter(
                    db.func.lower(Country.name) ==
                    country_name.lower()
                ).first()

                if not country:
                    country = Country(
                        name=country_name
                    )

                    db.session.add(country)
                    db.session.flush()

            player.country_id = country.id if country else None

        # --------------------------------------
        # UPDATE CLUB
        # --------------------------------------

        if "club_id" in data or "club" in data:

            club = None

            if data.get("club_id"):
                club = db.session.get(
                    Club,
                    data["club_id"]
                )

                if not club:
                    return jsonify({
                        "success": False,
                        "message": "Club not found."
                    }), 400

            elif data.get("club"):
                club_name = data["club"].strip()

                club = Club.query.filter(
                    db.func.lower(Club.name) ==
                    club_name.lower()
                ).first()

                if not club:
                    club = Club(
                        name=club_name,
                        logo_url=data.get("club_logo", "")
                    )

                    db.session.add(club)
                    db.session.flush()

                elif data.get("club_logo"):
                    club.logo_url = data["club_logo"]

            player.club_id = club.id if club else None

        db.session.commit()

        return jsonify({
            "success": True,
            "message": "Player updated successfully",
            "player": player.to_dict()
        }), 200

    except Exception as e:
        db.session.rollback()

        return jsonify({
            "success": False,
            "message": str(e)
        }), 500


# ==========================================
# DELETE PLAYER
# ==========================================

@api.route("/players/<int:player_id>", methods=["DELETE"])
def delete_player(player_id):
    player = db.session.get(Player, player_id)

    if not player:
        return jsonify({
            "success": False,
            "message": "Player not found"
        }), 404

    try:
        db.session.delete(player)
        db.session.commit()

        return jsonify({
            "success": True,
            "message": "Player deleted successfully"
        }), 200

    except Exception as e:
        db.session.rollback()

        return jsonify({
            "success": False,
            "message": str(e)
        }), 500


# ==========================================
# GET COUNTRIES
# ==========================================

@api.route("/countries", methods=["GET"])
def get_countries():
    countries = Country.query.order_by(
        Country.name
    ).all()

    return jsonify([
        {
            "id": country.id,
            "name": country.name,
            "flag_url": country.flag_url
        }
        for country in countries
    ]), 200


# ==========================================
# GET CLUBS
# ==========================================

@api.route("/clubs", methods=["GET"])
def get_clubs():
    clubs = Club.query.order_by(
        Club.name
    ).all()

    return jsonify([
        {
            "id": club.id,
            "name": club.name,
            "logo_url": club.logo_url,
            "country_id": club.country_id
        }
        for club in clubs
    ]), 200
