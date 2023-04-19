from functools import wraps
from flask import Flask, session, render_template, url_for, request, flash, redirect
from flask_session import Session
from sqlalchemy import create_engine
from sqlalchemy.orm import scoped_session, sessionmaker
import os
import urllib.request


app = Flask(__name__)
# Set up database
app.config["SESSION_PERMANENT"] = False
app.config["SESSION_TYPE"] = "filesystem"
Session(app)
engine = create_engine(os.getenv("DATABASE_URL"))
db = scoped_session(sessionmaker(bind=engine))


def login_required(f):
    """
    Decorate routes to require login.
    http://flask.pocoo.org/docs/0.12/patterns/viewdecorators/
    """
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if session.get("id_user") is None:
            return redirect("/login")
        return f(*args, **kwargs)
    return decorated_function


def limpiarString(c):
    cad2 = ""
    # i = 0
    for cad in c:
        if cad == "[" or cad == "]" or cad == "(" or cad == ")" or cad == "," or cad == "%" or cad == "\'":
            cad == ""
        else:
            cad2 = cad2+cad
    return cad2
