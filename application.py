import os

from flask import Flask, render_template, session, request
from flask_socketio import SocketIO, emit, join_room, leave_room
from flask_session import Session

app = Flask(__name__)
app.config["SECRET_KEY"] = os.getenv("SECRET_KEY")
socketio = SocketIO(app)

app.config["SESSION_PERMANENT"] = False
app.config["SESSION_TYPE"] = "filesystem"
Session(app)

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/test")
def test():
    return render_template("test.html")

@socketio.on('join')
def on_join(data):
    print(f'join {data} {request.sid}')
    session["username"] = data["username"]
    room = data["room"]
    print(f'Session room:{session.get("room")} vs joining room:{room}')
    if session.get("room") and session.get("room") != room:
        print(f'leave {session["room"]}')
        leave_room(session["room"])
    session["room"]= room
    join_room(room)

@socketio.on('leave')
def on_leave(data):
    print(f'leave {data}')
    session["username"] = data["username"]
    room= data["room"]
    leave_room(room)

@socketio.on("send message")
def messages(data):
    print(f'send {data}')
    username = session.get("username")
    room = data["room"]
    msg = data["msg"]
    emit("broadcast message", {"username": username, "msg": msg}, room=room)
