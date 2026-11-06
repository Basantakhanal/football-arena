from app import app
from extensions import db
from models import Country, Club, Player

def seed_database():
    with app.app_context():
        print("Clearing existing database records...")
        db.drop_all()
        db.create_all()

        print("Seeding countries...")
        argentina = Country(name="Argentina")
        france = Country(name="France")
        portugal = Country(name="Portugal")
        brazil = Country(name="Brazil")
        
        db.session.add_all([argentina, france, portugal, brazil])
        db.session.commit()

        print("Seeding clubs...")
        inter_miami = Club(name="Inter Miami", country_id=argentina.id)
        real_madrid = Club(name="Real Madrid", country_id=france.id)
        psg = Club(name="Paris Saint-Germain", country_id=france.id)
        al_nassr = Club(name="Al Nassr", country_id=portugal.id)

        db.session.add_all([inter_miami, real_madrid, psg, al_nassr])
        db.session.commit()

        print("Seeding players...")
        players = [
            Player(name="Lionel Messi", position="Forward", goals=821, assists=361, country_id=argentina.id, club_id=inter_miami.id),
            Player(name="Kylian Mbappé", position="Forward", goals=300, assists=130, country_id=france.id, club_id=real_madrid.id),
            Player(name="Cristiano Ronaldo", position="Forward", goals=850, assists=236, country_id=portugal.id, club_id=al_nassr.id),
            Player(name="Vinícius Júnior", position="Forward", goals=95, assists=75, country_id=brazil.id, club_id=real_madrid.id),
            Player(name="N'Golo Kanté", position="Midfielder", goals=20, assists=25, country_id=france.id, club_id=psg.id)
        ]

        db.session.add_all(players)
        db.session.commit()

        print("Database seeded successfully! ⚽")

if __name__ == "__main__":
    seed_database()