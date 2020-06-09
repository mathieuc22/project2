from application import app

app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///db.sqlite'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

from models import db, User, Room, Message

db.init_app(app)
with app.app_context():
    db.create_all()
    print(Room.query.all())
    print(Message.query.all())

