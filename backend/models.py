
from extensions import db


class Country(db.Model):
    __tablename__ = "countries"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), unique=True, nullable=False)
    flag_url = db.Column(db.String(255))

    players = db.relationship("Player", backref="country", lazy=True)
    clubs = db.relationship("Club", backref="country", lazy=True)


class Club(db.Model):
    __tablename__ = "clubs"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), unique=True, nullable=False)
    logo_url = db.Column(db.String(255))

    country_id = db.Column(
        db.Integer,
        db.ForeignKey("countries.id")
    )

    players = db.relationship("Player", backref="club", lazy=True)


class Player(db.Model):
    __tablename__ = "players"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    position = db.Column(db.String(50), nullable=False)

    age = db.Column(db.Integer)
    rating = db.Column(db.Float, default=0)

    league = db.Column(db.String(100), default="Other")
    goals = db.Column(db.Integer, default=0)
    assists = db.Column(db.Integer, default=0)
    minutes = db.Column(db.Integer, default=0)

    status = db.Column(db.String(30), default="Active")
    photo_url = db.Column(db.String(255))
    
    country_id = db.Column(
        db.Integer,
        db.ForeignKey("countries.id")
    )

    club_id = db.Column(
        db.Integer,
        db.ForeignKey("clubs.id")
    )

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "position": self.position,
            "age": self.age,
            "rating": self.rating,
            "league": self.league,
            "goals": self.goals,
            "assists": self.assists,
            "minutes": self.minutes,
            "status": self.status,
            "photo_url": self.photo_url,
            "country": self.country.name if self.country else "",
            "country_flag": self.country.flag_url if self.country else "",
            "club": self.club.name if self.club else "",
            "club_logo": self.club.logo_url if self.club else "",
        }
