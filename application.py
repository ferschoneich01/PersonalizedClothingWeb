from flask import Flask, render_template, url_for, request, flash, redirect, sessions
from flask_session import Session
from werkzeug.security import check_password_hash, generate_password_hash
from sqlalchemy import create_engine
from sqlalchemy.orm import scoped_session, sessionmaker
from funciones import *
from werkzeug.security import check_password_hash, generate_password_hash
import json

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


@app.route("/userSettings")
@login_required
def userSettings():
    return render_template("userSettings.html", username=session["username"])


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
        session["id_user"] = user[0]["id_user"]
        session["username"] = username
        session["role_user"] = user[0]["role"]
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
        sex = request.form.get("select")

        user = db.execute(
            "SELECT * FROM users u INNER JOIN person p ON u.person = p.id_person WHERE p.cedula = '"+cedula+"' or u.username = '"+username+"'").fetchall()

        if len(user) > 0:
            flash("El usuario ingresado ya existe.")
            return redirect("/register")
        else:
            # Query database for person
            db.execute("INSERT INTO person (cedula,name,lastname,birthday,phone,country,city,sex) VALUES ('"+str(cedula)+"','"+str(name) +
                       "','"+str(lastname)+"','"+str(birthday)+"','"+str(phone)+"','Nicaragua','"+str(city)+"','"+str(sex)+"')")
            db.commit()
            # Query selection id person
            user = db.execute(
                "SELECT * FROM person WHERE cedula = '"+cedula+"'").fetchall()
            # Query database for users
            db.execute("INSERT INTO users (username,password,email,person,role) VALUES ('" +
                       str(username)+"','"+str(password)+"','"+str(email)+"',"+str(user[0]["id_person"])+",2)")
            db.commit()

            flash('¡Cuenta creada exitosamente!')
            # Redirect user to login page
            return redirect("/login")

    else:
        return render_template('register.html')


@app.route("/logout")
@login_required
def logout():
    session.clear()
    carListItems.clear()
    return redirect('/')


@app.route("/adminOrders", methods=["GET", "POST"])
@login_required
def adminOrders():

    if session["role_user"] == 1:
        ordenes = []
        orders = db.execute(
            "Select i.id_item,u.username,i.name,od.color,od.size,p.method,i.price,sh.cost,(i.price+sh.cost),s.status,i.image FROM items i INNER JOIN orderdetails od ON od.item = i.id_item INNER JOIN orders o ON o.id_order = od.id_order INNER JOIN status s on s.id_status = o.id_status INNER JOIN users u on u.id_user = o.id_user INNER JOIN shipping sh on sh.id_order = o.id_order INNER JOIN addres_persons ap on ap.id_address_person = sh.address INNER JOIN paymentmethohds p on  p.id_paymentmethod = o.paymentmethod").fetchall()

        i = 0
        for o in orders:
            ordenes.append([orders[i][0], orders[i][1],
                           orders[i][2], orders[i][3], orders[i][4],
                           orders[i][5], orders[i][6], orders[i][7],
                           orders[i][8], orders[i][9], orders[i][10], (i+1)])
            i += 1

        return render_template('adminOrders.html', username=session["username"], orders=ordenes)
    else:
        return redirect("/")


@app.route("/viewOrders/<id>", methods=["GET", "POST"])
@login_required
def viewOrders(id):
    if request.method == "POST":
        if session["role_user"] == 1:
            ordenes = []
            orders = db.execute(
                "Select i.id_item,u.username,i.name,od.color,od.size,i.image,i.price,sh.cost,(i.price+sh.cost),s.id_status FROM items i INNER JOIN orderdetails od ON od.item = i.id_item INNER JOIN orders o ON o.id_order = od.order INNER JOIN status s on s.id_status = o.id_status INNER JOIN users u on u.id_user = o.id_user INNER JOIN shipping sh on sh.order = o.id_order INNER JOIN addres_persons ap on ap.id_address_person = sh.address").fetchall()

            i = 0
            for o in orders:
                ordenes.append([orders[i][0], orders[i][1],
                               orders[i][2], orders[i][3], orders[i][4],
                               orders[i][5], orders[i][6], orders[i][7],
                               orders[i][8], orders[i][9]])
                i += 1
            return render_template("viewOrder.html", orders=ordenes)
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
            "SELECT * FROM items i").fetchall()
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
            "SELECT * FROM items i").fetchall()
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
        return render_template('lookbook.html', items=listItems, username='null')


@app.route("/items/<item>")
@app.route("/items/category/<clasification>")
@app.route("/items/clasification/<category>")
@app.route("/items/<clasification>/<category>")
def items_selected(item=None, clasification=None, category=None):

    if 'username' in session:
        if item == None and clasification != None and category == None:
            # obtenemos todos los items de la base de datos
            items = db.execute(
                "SELECT * FROM items i INNER JOIN clasification c ON c.id_clasification = i.clasification WHERE i.clasification = "+str(clasification)+"").fetchall()
            # lista de items
            listItems = []
            # indice
            i = 0

            for item in items:
                # agregarmos items a la lista
                listItems.append([items[i][1], items[i][2],
                                 items[i][3], items[i][4], items[i][0]])
                # incremento en 1 del indice
                i += 1

            return render_template('products.html', username=session["username"], items=listItems)
        elif item != None and clasification == None and category == None:

            # obtenemos todos los items de la base de datos
            items = db.execute(
                "SELECT * FROM items i INNER JOIN clasification c ON c.id_clasification = i.clasification WHERE i.id_item = "+str(item)+"").fetchall()
            # lista de items
            listItems = []
            # indice
            i = 0
            # lista de items
            for item in items:
                # agregarmos items a la lista
                listItems.append([items[i][1], items[i][2],
                                 items[i][3], items[i][4], items[i][0]])
                # incremento en 1 del indice
                i += 1

            return render_template('products.html', username=session["username"], items=listItems)
        elif item == None and clasification == None and category != None:
            # obtenemos todos los items de la base de datos
            items = db.execute(
                "SELECT * FROM items i INNER JOIN clasification c ON c.id_clasification = i.clasification  WHERE i.category = "+str(category)+"").fetchall()
            # lista de items
            listItems = []
            # indice
            i = 0
            # lista de items
            for item in items:
                # agregarmos items a la lista
                listItems.append([items[i][1], items[i][2],
                                 items[i][3], items[i][4], items[i][0]])
                # incremento en 1 del indice
                i += 1

            return render_template('products.html', username=session["username"], items=listItems)
        elif item == None and clasification != None and category != None:
            # obtenemos todos los items de la base de datos
            items = db.execute(
                "SELECT * FROM items i WHERE i.category = "+str(category)+" and i.clasification = "+str(clasification)+";").fetchall()
            # lista de items
            listItems = []
            # indice
            i = 0
            # lista de items
            for item in items:
                # agregarmos items a la lista
                listItems.append([items[i][1], items[i][2],
                                 items[i][3], items[i][4], items[i][0]])
                # incremento en 1 del indice
                i += 1

            return render_template('products.html', username=session["username"], items=listItems)
    else:
        if item == None and clasification != None and category == None:
            # obtenemos todos los items de la base de datos
            items = db.execute(
                "SELECT * FROM items i INNER JOIN clasification c ON c.id_clasification = i.clasification WHERE i.clasification = "+str(clasification)+"").fetchall()
            # lista de items
            listItems = []
            # indice
            i = 0

            for item in items:
                # agregarmos items a la lista
                listItems.append([items[i][1], items[i][2],
                                 items[i][3], items[i][4], items[i][0]])
                # incremento en 1 del indice
                i += 1

            return render_template('products.html', username='null', items=listItems)
        elif item != None and clasification == None and category == None:

            # obtenemos todos los items de la base de datos
            items = db.execute(
                "SELECT * FROM items i INNER JOIN clasification c ON c.id_clasification = i.clasification WHERE i.id_item = "+str(item)+"").fetchall()
            # lista de items
            listItems = []
            # indice
            i = 0
            # lista de items
            for item in items:
                # agregarmos items a la lista
                listItems.append(
                    [items[i][1], items[i][2], items[i][3], items[i][4], items[i][0]])
                # incremento en 1 del indice
                i += 1

            return render_template('products.html', username='null', items=listItems)
        elif item == None and clasification == None and category != None:
            # obtenemos todos los items de la base de datos
            items = db.execute(
                "SELECT * FROM items i INNER JOIN clasification c ON c.id_clasification = i.clasification  WHERE i.category = "+str(category)+"").fetchall()
            # lista de items
            listItems = []
            # indice
            i = 0
            # lista de items
            for item in items:
                # agregarmos items a la lista
                listItems.append([items[i][1], items[i][2],
                                 items[i][3], items[i][4], items[i][0]])
                # incremento en 1 del indice
                i += 1

            return render_template('products.html', username='null', items=listItems)
        elif item == None and clasification != None and category != None:
            # obtenemos todos los items de la base de datos
            items = db.execute(
                "SELECT * FROM items i WHERE i.category = "+str(category)+" and i.clasification = "+str(clasification)+";").fetchall()
            # lista de items
            listItems = []
            # indice
            i = 0
            # lista de items
            for item in items:
                # agregarmos items a la lista
                listItems.append([items[i][1], items[i][2],
                                 items[i][3], items[i][4], items[i][0]])
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
            db.execute("INSERT INTO items (name,description,image,price,clasification,category) VALUES ('"+str(name) +
                       "','"+str(description)+"','"+str(urlphoto)+"',"+str(price)+","+str(id_clasification)+","+str(id_category)+")")
            db.commit()

            return redirect('/items')

# AÑADIR AL CARRITO


@app.route("/addToCar/<id>", methods=["POST", "GET"])
@login_required
def addToCar(id):
    if request.method == "POST":
        items = db.execute(
            "SELECT i.name,i.price,i.image FROM items i INNER JOIN clasification c ON c.id_clasification = i.clasification WHERE i.id_item = "+str(id)+"").fetchall()
        # lista de items

        quantity = request.form.get("quantity")
        size = request.form.get("size")
        color = request.form.get("color")
        carListItems.append([items[0][0], float(items[0][1]), float(
            quantity), size, color, items[0][2], len(carListItems), id])

        return redirect("/items/"+id)


@app.route("/car", methods=["POST", "GET"])
@login_required
def car():
    if len(carListItems) == 0:
        Msg = "Agrega un articulo al carrito de compras."
        return render_template("Mensajes.html", Msg=Msg, username=session["username"])
    else:
        Direcciones = []
        Addres = db.execute(
            "SELECT * FROM addres_persons WHERE person = "+str(session["id_user"])+"").fetchall()
        j = 0
        for a in Addres:
            Direcciones.append(
                [Addres[j]["address"], Addres[j]["city"], Addres[j]["id_address_person"]])
            j += 1
        return render_template('car.html', username=session["username"], items=carListItems, direcciones=Direcciones)


@app.route("/deleteToCar/<id>", methods=["POST", "GET"])
@login_required
def deleteToCar(id):
    carListItems.pop(int(id)-1)
    return redirect("/car")


@app.route("/addAddres", methods=["POST", "GET"])
@login_required
def addAddres():
    departamento = request.form.get("city")
    d1 = request.form.get("addres")
    d2 = request.form.get("addres2")
    direccion = d1+" "+d2+""
    if len(departamento) > 0 and len(d1) > 0 and len(d2) > 0:
        db.execute("INSERT INTO addres_persons(address,person,city) VALUES ('" +
                   str(direccion)+"',"+str(session["id_user"])+",'"+str(departamento)+"')")
        db.commit()
    else:
        flash("Rellena todos los campos.")
    return redirect("/car")


@app.route("/buys")
@login_required
def buys():
    buysList = []
    orders = db.execute(
        "Select i.id_item,u.username,i.name,od.color,od.size,p.method,i.price,sh.cost,(i.price+sh.cost),s.status,i.image,ap.address,o.orderdate FROM items i INNER JOIN orderdetails od ON od.item = i.id_item INNER JOIN orders o ON o.id_order = od.id_order INNER JOIN status s on s.id_status = o.id_status INNER JOIN users u on u.id_user = o.id_user INNER JOIN shipping sh on sh.id_order = o.id_order INNER JOIN addres_persons ap on ap.id_address_person = sh.address INNER JOIN paymentmethohds p on  p.id_paymentmethod = o.paymentmethod WHERE u.username = '"+str(session["username"])+"'").fetchall()

    i = 0
    for o in orders:
        buysList.append([orders[i][0], orders[i][1],
                         orders[i][2], orders[i][3], orders[i][4],
                         orders[i][5], orders[i][6], orders[i][7],
                         orders[i][8], orders[i][9], orders[i][10], orders[i][11], (i+1), orders[i][12]])
        i += 1
    if i < 1:
        Msg = "¡Hola! "+session["username"] + \
            " aún no haz comprado un articulo :D"
        return render_template("Mensajes.html", Msg=Msg, username=session["username"])
    else:
        return render_template("buys.html", buys=buysList, username=session["username"])


@app.route("/personalizar")
@login_required
def personalizar():
    return render_template("personalizar.html", username=session["username"])


@app.route("/paymenthMethod/<dir>")
@login_required
def paymenthMethod(dir):
    shippingcost = 70
    # lista de items en el
    total = 0.0
    subtotal = 0.0
    i = 0
    for car in carListItems:
        subtotal += carListItems[i][1] * carListItems[i][2]
        i += 1
        total = subtotal + shippingcost
    Addres = db.execute(
        "SELECT * FROM addres_persons WHERE id_address_person = "+str(dir)+"").fetchall()

    j = 0
    for a in Addres:
        Direccion = Addres[j]["address"]
        Departamento = Addres[j]["city"]
        j += 1

    return render_template("payMethod.html", username=session["username"], total=total, subtotal=subtotal, shippingcost=shippingcost, dir=Direccion, dep=Departamento)


@app.route("/successPay/<det>/<address>")
@login_required
def successPay(det, address):

    # crear una nueva orden
    db.execute("INSERT INTO orders(orderdate,paymentmethod,id_user,id_status) VALUES (current_timestamp,1," +
               str(session["id_user"])+",1)")
    db.commit()

    # obtener el id de la orden que acabamos de insertar
    id_order = db.execute(
        "select id_order from orders o where id_user = "+str(session["id_user"])+" order by orderdate desc limit 1 ").fetchall()
    print(id_order[0][0])
    # insertar cada uno de los items comprados
    for i in carListItems:
        db.execute("INSERT INTO orderdetails(color,size,item,quantity,id_order) VALUES ('" +
                   str(i[4])+"','"+str(i[3])+"',"+str(i[7])+","+str(int(i[2]))+","+str(int(id_order[0][0]))+")")
        db.commit()
    # obtener el id de la dirección a enviar el producto
    id_address = db.execute(
        "select id_address_person from addres_persons where address = '"+str(address)+"'limit 1").fetchall()
    print(id_address[0][0])
    # insertamos un nuevo registro de envio
    db.execute("INSERT INTO shipping(shipdate,cost,id_order,address) VALUES (current_date,70.00," +
               str(id_order[0][0])+","+str(id_address[0][0])+")")
    db.commit()

    # Limpieza del carrito
    carListItems.clear()

    return render_template("successPay.html", username=session["username"], det=det)


if __name__ == "__main__":
    app.run(debug=True)
