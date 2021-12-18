from flask import Flask, render_template, url_for, request, flash, redirect, session
from flask_session import Session
from werkzeug.security import check_password_hash, generate_password_hash
from sqlalchemy import create_engine
from sqlalchemy.orm import scoped_session, sessionmaker
from funciones import *
from werkzeug.security import check_password_hash, generate_password_hash


app = Flask(__name__)

# Check for environment variable
if not os.getenv("DATABASE_URL"):
    raise RuntimeError("DATABASE_URL is not set")

# Configure session to use filesystem
app.config["SESSION_PERMANENT"] = False
app.config["SESSION_TYPE"] = "filesystem"
Session(app)

# Set up database
engine = create_engine(os.getenv("DATABASE_URL"))
db = scoped_session(sessionmaker(bind=engine))
carListItems = []

@app.route("/")
def index():
    if 'username' in session:
        return render_template("index.html", username=session["username"])
    else:
        return render_template("index.html", username='null')


@app.route("/login", methods=["POST", "GET"])
def login():
    if request.method == "POST":
        username = request.form.get("username")
        password = request.form.get("password")

        if not request.form.get("username"):
            flash('Ingrese un nombre de usuario')
            return redirect("/login")

        # Ensure password was submitted
        elif not request.form.get("password"):
            flash('Ingrese una contraseña')
            return redirect("/login")

        user = db.execute(
            "SELECT * FROM users WHERE username = '"+str(username)+"'").fetchall()

        # Ensure username exists and password is correct
        if len(user) != 1 or not check_password_hash(user[0]["password"], password):
            flash('Contraseña Incorrecta')
            return redirect("/login")

        # Remember which user has logged in
        session["id_user"] = user[0]["id_users"]
        session["username"] = username
        session["role_user"] = user[0]["id_rol"]
        return redirect('/')
    else:
        return render_template("login.html")


@app.route("/register", methods=["POST", "GET"])
def register():
    # User reached route via POST (as by submitting a form via POST)
    if request.method == "POST":

        # Ensure username was submitted
        if not request.form.get("username"):
            flash("Ingrese un nombre de usuario")
            return redirect("/register")

        # Ensure password was submitted
        elif not request.form.get("password"):
            flash("Ingrese una contraseña")
            return redirect("/register")

        elif not request.form.get("email"):
            flash("Ingrese un correo")
            return redirect("/register")

        elif not request.form.get("cedula"):
            flash("Ingrese una cedula")

        elif not request.form.get("name"):
            flash("Ingrese su nombre")
            return redirect("/register")

        elif not request.form.get("lastname"):
            flash("Ingrese su apellido")
            return redirect("/register")

        elif not request.form.get("birthday"):
            flash("Ingrese su fecha de cumpleaños")
            return redirect("/register")

        elif not request.form.get("phone"):
            flash("Ingrese su numero de celular")
            return redirect("/register")

        elif not request.form.get("city"):
            flash("Ingrese un departamento")
            return redirect("/register")

        elif not request.form.get("postalcode"):
            flash("Ingrese su codigopostal")
            return redirect("/register")

        # datos persona
        username = request.form.get("username")
        password = generate_password_hash(request.form.get("password"))
        email = request.form.get("email")
        cedula = request.form.get("cedula")
        name = request.form.get("name")
        lastname = request.form.get("lastname")
        birthday = request.form.get("birthday")
        phone = request.form.get("phone")
        city = request.form.get("city")
        postalcode = request.form.get("postalcode")
        sex = request.form.get("select")

        user = db.execute(
            "SELECT * FROM users u INNER JOIN person p ON u.id_person = p.id_person WHERE p.cedula = '"+cedula+"' or u.username = '"+username+"'").fetchall()

        if user != None:
            flash("El usuario ingresado ya existe.")
            return redirect("/register")
        else:
            # Query database for person
            db.execute("INSERT INTO person (cedula,name,lastname,birthday,phone,country,city,postalcode,sex) VALUES ('"+str(cedula)+"','"+str(name) +
                    "','"+str(lastname)+"','"+str(birthday)+"','"+str(phone)+"','Nicaragua','"+str(city)+"','"+str(postalcode)+"','"+str(sex)+"')")
            db.commit()
            # Query selection id person
            user = db.execute(
                "SELECT * FROM person WHERE cedula = '"+cedula+"'").fetchall()
            # Query database for users
            db.execute("INSERT INTO users (username,password,email,id_person,id_rol) VALUES ('" +
                    str(username)+"','"+str(password)+"','"+str(email)+"',"+str(user[0]["id_person"])+",2)")
            db.commit()
            # Redirect user to home page
            return redirect("/login")
        
    else:
        return render_template('register.html')


@app.route("/logout")
@login_required
def logout():
    session.clear()
    return redirect('/')


@app.route("/adminOrders", methods=["GET", "POST"])
@login_required
def adminOrders():
    if request.method == "POST":
        if session["role_user"] == 1:
            ordenes = []
            orders = db.execute(
                "SELECT u.username,pm.method,sum(i.price * id.quantity),sh.cost,sum(i.price * id.quantity)*sh.cost FROM shipping sh INNER JOIN orders o ON sh.id_order = o.id_order INNER JOIN itemsdetail id ON o.id_order = o.id_order INNER JOIN paymentmethod pm ON  pm.id_paymentmethod = o.id_paymentmethod INNER JOIN items i ON i.id_item = id.id_item INNER JOIN users u ON u.id_users = o.id_user WHERE status = 'earring ' GROUP BY u.username,pm.method,sh.cost").fetchall()
            i = 0
            for o in orders:
                ordenes.append([orders[i][0],orders[i][1],orders[i][2],orders[i][3],orders[i][4]])
                i += 1

            return render_template('adminOrders.html', username=session["username"],orders=ordenes)
        else:
            return redirect("/")
    else:
        if session["role_user"] == 1:
            return render_template('adminOrders.html', username=session["username"])
        else:
            return redirect("/")
    
@app.route("/viewOrders/<id>", methods=["GET", "POST"])
@login_required
def viewOrders(id):
    if request.method == "POST":
        if session["role_user"] == 1:
            ordenes = []
            orders = db.execute("Select i.id_item,i.price,id.size,id.color,i.image FROM items i INNER JOIN itemsdetail id ON id.id_item = i.id_item INNER JOIN orders o ON o.id_order = id.id_order  WHERE o.id_order = "+str(id)+"").fetchall()
            user = db.execute("Select * FROM users u INNER JOIN orders o ON o.id_user = u.id_user WHERE o.id_order = "+str(id)+"").fetchall()
            i = 0
            for o in orders:
                ordenes.append([orders[i][0],orders[i][1],orders[i][2],orders[i][3],orders[i][4]])
                i += 1
            return render_template("viewOrder.html",orders=ordenes,user_order=user[0]["username"])
        else:
            return redirect("/")    


@app.route("/adminAddItem", methods=["GET", "POST"])
@login_required
def adminAddItem():
    if session["role_user"] == 1:
        return render_template('adminAddItems.html', username=session["username"])
    else:
        return redirect("/")


@app.route("/items", methods=["GET", "POST"])
def items():

    if 'username' in session:
        # obtenemos todos los items de la base de datos
        items = db.execute(
            "SELECT * FROM items i INNER JOIN clasification c ON c.id_clasification = i.id_clasification").fetchall()
        # lista de items
        listItems = []
        # indice
        i = 0

        for item in items:
            # agregarmos items a la lista
            listItems.append([items[i]["name"], items[i]["description"], items[i]["image"],
                            items[i]["price"], items[i]["clasification"], items[i]["id_item"]])
            # incremento en 1 del indice
            i += 1

            return render_template('lookbook.html', username=session["username"], items=listItems)
    else:
        # obtenemos todos los items de la base de datos
        items = db.execute(
            "SELECT * FROM items i INNER JOIN clasification c ON c.id_clasification = i.id_clasification").fetchall()
        # lista de items
        listItems = []
        # indice
        i = 0

        for item in items:
            # agregarmos items a la lista
            listItems.append([items[i]["name"], items[i]["description"], items[i]["image"],
                            items[i]["price"], items[i]["clasification"], items[i]["id_item"]])
            # incremento en 1 del indice
            i += 1
        return render_template('lookbook.html', items=listItems,username='null')



@app.route("/items/<item>")
@app.route("/items/category/<clasification>")
@app.route("/items/clasification/<category>")
@app.route("/items/<clasification>/<category>")
def items_selected(item=None,clasification=None,category=None):

    if 'username' in session:
        if item == None and clasification != None and category == None:
            # obtenemos todos los items de la base de datos
            items = db.execute(
                "SELECT * FROM items i INNER JOIN clasification c ON c.id_clasification = i.id_clasification WHERE i.id_clasification = "+str(clasification)+"").fetchall()
            # lista de items
            listItems = []
            # indice
            i = 0

            for item in items:
                # agregarmos items a la lista
                listItems.append([items[i]["name"], items[i]["description"], items[i]["image"],
                                items[i]["price"],items[i]["id_item"]])
                # incremento en 1 del indice
                i += 1

            return render_template('products.html', username=session["username"], items=listItems)
        elif item != None and clasification == None and category == None:

            # obtenemos todos los items de la base de datos
            items = db.execute(
                "SELECT * FROM items i INNER JOIN clasification c ON c.id_clasification = i.id_clasification WHERE i.id_item = "+str(item)+"").fetchall()
            # lista de items
            listItems = []
            # indice
            i = 0
            # lista de items
            for item in items:
                #price = round(float(items[i]["price"])/35.25,2)
                # agregarmos items a la lista
                listItems.append([items[i]["name"], items[i]["description"], items[i]["image"],items[i]["price"],items[i]["id_item"]])
                # incremento en 1 del indice
                i += 1

            return render_template('products.html', username=session["username"], items=listItems)
        elif item == None and clasification == None and category != None:
            # obtenemos todos los items de la base de datos
            items = db.execute(
                "SELECT * FROM items i INNER JOIN clasification c ON c.id_clasification = i.id_clasification  WHERE i.id_category = "+str(category)+"").fetchall()
            # lista de items
            listItems = []
            # indice
            i = 0
            # lista de items
            for item in items:
                # agregarmos items a la lista
                listItems.append([items[i]["name"], items[i]["description"], items[i]["image"],
                                items[i]["price"],items[i]["id_item"]])
                # incremento en 1 del indice
                i += 1

            return render_template('products.html', username=session["username"], items=listItems)
        elif item == None and clasification != None and category != None:
            # obtenemos todos los items de la base de datos
            items = db.execute(
                "SELECT * FROM items i WHERE i.id_category = "+str(category)+" and i.id_clasification = "+str(clasification)+";").fetchall()
            # lista de items
            listItems = []
            # indice
            i = 0
            # lista de items
            for item in items:
                # agregarmos items a la lista
                listItems.append([items[i]["name"], items[i]["description"], items[i]["image"],
                                items[i]["price"],items[i]["id_item"]])
                # incremento en 1 del indice
                i += 1

            return render_template('products.html', username=session["username"], items=listItems)
    else:
        if item == None and clasification != None and category == None:
            # obtenemos todos los items de la base de datos
            items = db.execute(
                "SELECT * FROM items i INNER JOIN clasification c ON c.id_clasification = i.id_clasification WHERE i.id_clasification = "+str(clasification)+"").fetchall()
            # lista de items
            listItems = []
            # indice
            i = 0

            for item in items:
                # agregarmos items a la lista
                listItems.append([items[i]["name"], items[i]["description"], items[i]["image"],
                                items[i]["price"],items[i]["id_item"]])
                # incremento en 1 del indice
                i += 1

            return render_template('products.html', username='null', items=listItems)
        elif item != None and clasification == None and category == None:

            # obtenemos todos los items de la base de datos
            items = db.execute(
                "SELECT * FROM items i INNER JOIN clasification c ON c.id_clasification = i.id_clasification WHERE i.id_item = "+str(item)+"").fetchall()
            # lista de items
            listItems = []
            # indice
            i = 0
            # lista de items
            for item in items:
                # agregarmos items a la lista
                listItems.append([items[i]["name"], items[i]["description"], items[i]["image"],
                                items[i]["price"],items[i]["id_item"]])
                # incremento en 1 del indice
                i += 1

            return render_template('products.html', username='null', items=listItems)
        elif item == None and clasification == None and category != None:
            # obtenemos todos los items de la base de datos
            items = db.execute(
                "SELECT * FROM items i INNER JOIN clasification c ON c.id_clasification = i.id_clasification  WHERE i.id_category = "+str(category)+"").fetchall()
            # lista de items
            listItems = []
            # indice
            i = 0
            # lista de items
            for item in items:
                # agregarmos items a la lista
                listItems.append([items[i]["name"], items[i]["description"], items[i]["image"],
                                items[i]["price"],items[i]["id_item"]])
                # incremento en 1 del indice
                i += 1

            return render_template('products.html', username='null', items=listItems)
        elif item == None and clasification != None and category != None:
            # obtenemos todos los items de la base de datos
            items = db.execute(
                "SELECT * FROM items i WHERE i.id_category = "+str(category)+" and i.id_clasification = "+str(clasification)+";").fetchall()
            # lista de items
            listItems = []
            # indice
            i = 0
            # lista de items
            for item in items:
                # agregarmos items a la lista
                listItems.append([items[i]["name"], items[i]["description"], items[i]["image"],
                                items[i]["price"],items[i]["id_item"]])
                # incremento en 1 del indice
                i += 1

            return render_template('products.html', username='null', items=listItems)


@app.route("/addItem", methods=["POST", "GET"])
@login_required
def addItem():
    if request.method == "POST":

        if not request.form.get("name"):
            flash('Inserte un nombre de item.')
            return redirect('/adminAddItem')
        elif not request.form.get("price"):
            flash('Inserte un precio de item.')
            return redirect('/adminAddItem')
        elif not request.form.get("category"):
            flash('Elija una categoria.')
            return redirect('/adminAddItem')
        elif not request.form.get("urlphoto"):
            flash('Escoja una foto o inserte link.')
            return redirect('/adminAddItem')
        elif not request.form.get("clasification"):
            flash('Elija una clasification de item.')
            return redirect('/adminAddItem')
        else:
            request.form.get("name")
            name = request.form.get("name")
            price = request.form.get("price")
            id_category = request.form.get("category")
            description = request.form.get("description")
            urlphoto = request.form.get("urlphoto")
            id_clasification = request.form.get("clasification")

            # Query database for items
            db.execute("INSERT INTO items (name,description,image,price,id_clasification,id_category) VALUES ('"+str(name) +
                       "','"+str(description)+"','"+str(urlphoto)+"',"+str(price)+","+str(id_clasification)+","+str(id_category)+")")
            db.commit()

            return redirect('/items')

#PAGOS Y AÑADIR AL CARRITO
@app.route("/addToCar/<id>", methods=["POST", "GET"])
@login_required
def addToCar(id):
    if request.method == "POST":
        items = db.execute(
            "SELECT * FROM items i INNER JOIN clasification c ON c.id_clasification = i.id_clasification WHERE i.id_item = "+str(id)+"").fetchall()
        # lista de items
        
        quantity = request.form.get("quantity")
        size = request.form.get("size")
        carListItems.append([items[0]["name"],float(items[0]["price"]),float(quantity),size,items[0]["image"]])

        return redirect("/items/"+id)

@app.route("/car", methods=["POST", "GET"])
@login_required
def car():
    
    if len(carListItems) == 0:
        return "no hay articulos añadidos"
    else:
        # obtenemos todos los items de la base de datos
        total = 0.0
        i=0
        for car in carListItems:
            total += carListItems[i][1] * carListItems[i][2]
            i += 1     

        return render_template('car.html', user_order=session[0]["username"], items=carListItems,total=total,subtotal=total)
    
        
