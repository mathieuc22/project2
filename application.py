import os

from flask import Flask, render_template, session, request, redirect, url_for, flash
from werkzeug.security import generate_password_hash, check_password_hash
from flask_socketio import SocketIO, emit, join_room, leave_room
from flask_session import Session
from flask_sqlalchemy import SQLAlchemy
from flask_login import LoginManager, login_user, logout_user, current_user, login_required
from models import db, User, Room, Message

app = Flask(__name__)
app.config["SECRET_KEY"] = os.getenv("SECRET_KEY")
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///db.sqlite'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

socketio = SocketIO(app)

db.init_app(app)

login_manager = LoginManager()
login_manager.login_view = 'login'
login_manager.init_app(app)

app.config["SESSION_PERMANENT"] = False
app.config["SESSION_TYPE"] = "filesystem"
Session(app)

@login_manager.user_loader
def load_user(user_id):
    # since the user_id is just the primary key of our user table, use it in the query for the user
    return User.query.get(int(user_id))

@app.route("/")
@login_required
def index():
    return render_template("index.html", name=current_user.name)

@app.route('/profile')
@login_required
def profile():
    return render_template('profile.html', name=current_user.name)

@app.route('/login')
def login():
    return render_template('login.html')

@app.route('/login', methods=['POST'])
def login_post():
    email = request.form.get('email')
    password = request.form.get('password')
    remember = True if request.form.get('remember') else False

    user = User.query.filter_by(email=email).first()

    # check if user actually exists
    # take the user supplied password, hash it, and compare it to the hashed password in database
    if not user or not check_password_hash(user.password, password):
        flash('Please check your login details and try again.')
        return redirect(url_for('login')) # if user doesn't exist or password is wrong, reload the page

    # if the above check passes, then we know the user has the right credentials
    login_user(user, remember=remember)
    return redirect(url_for('index'))

@app.route('/signup')
def signup():
    return render_template('signup.html')

@app.route('/signup', methods=['POST'])
def signup_post():
    email = request.form.get('email')
    name = request.form.get('name')
    password = request.form.get('password')

    user = User.query.filter_by(email=email).first() # if this returns a user, then the email already exists in database

    if user: # if a user is found, we want to redirect back to signup page so user can try again
        flash('Email address already exists')
        return redirect(url_for('signup'))

    # create new user with the form data. Hash the password so plaintext version isn't saved.
    new_user = User(email=email, name=name, password=generate_password_hash(password, method='sha256'))

    # add the new user to the database
    db.session.add(new_user)
    db.session.commit()

    return redirect(url_for('login'))

@app.route('/logout')
@login_required
def logout():
    logout_user()
    return redirect(url_for('index'))

@app.route("/test")
def test():
    return render_template("test.html")

@socketio.on('join')
def on_join(data):
    print(f'{data["username"]} with {request.sid} join {data["room"]}')
    room = data["room"]
    if session.get("room") and session.get("room") != room:
        print(f'leave {session["room"]}')
        leave_room(session["room"])
    session["room"]= room
    join_room(room)
    # fill the message history
    room_name = Room.query.filter_by(name=room).first()
    messages = db.session.query(Message, User).join(User, Message.user_id == User.id).filter(Message.room_id == room_name.id).all()
    for message in messages:
        emit("broadcast message", {"username": message.User.name, "msg": message.Message.content})
    
@socketio.on('leave')
def on_leave(data):
    print(f'leave {data}')
    session["username"] = data["username"]
    room= data["room"]
    leave_room(room)

@socketio.on("send message")
def messages(data):
    print(f'send {data}')
    room = data["room"]
    msg = data["msg"]
    
    dbroom = Room.query.filter_by(name=room).first()
    # create new user with the form data. Hash the password so plaintext version isn't saved.
    new_message = Message(content=msg, 
                user_id=current_user.id, 
                room_id=dbroom.id)
    # add the new user to the database
    db.session.add(new_message)
    db.session.commit()
    new_message = Message.query.order_by(Message.id.desc()).first()

    emit("broadcast message", {"username": current_user.name, "msg": msg, "date": new_message.timestamp}, room=room)
