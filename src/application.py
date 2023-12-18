from flask import Flask, render_template, jsonify, request, flash, redirect, sessions
from flask_session import Session
from werkzeug.security import check_password_hash, generate_password_hash
from sqlalchemy import create_engine
from sqlalchemy.orm import scoped_session, sessionmaker
from funciones import *
from sqlalchemy.sql import text
import uuid
import requests

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

#api url
#api_url='http://127.0.0.1:5000/api'
api_url='https://personalizedclothingapi.fly.dev/api'

@app.route("/")
def index():
    if 'username' in session:
        return render_template("index.html", username=session["username"])
    else:
        return render_template("index.html", username='null')


@app.route("/userSettings", methods=["GET"])
@login_required
def userSettings():
    users = []
    #consulta api
    data = requests.get(api_url+'/users/'+session["username"])
    if data.status_code == 200:
        dataJSON=data.json()
    
        for i in range(len(dataJSON)):
            users.append([dataJSON[i]["id_user"],dataJSON[i]["username"],
                            dataJSON[i]["password"], dataJSON[i]["email"], dataJSON[i]["person"],
                            dataJSON[i]["role"], dataJSON[i]["status_user"]])
            i += 1
    return render_template("userSettings.html", username=session["username"],users=users)


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
        
        #consulta api
        data = requests.get(api_url+'/users/'+username)

        if data.status_code == 200:
            #jsonserializable
            user=data.json()
            # Ensure username exists and password is correct
            if len(user) != 1 or not check_password_hash(user[0]['password'], password):
                flash('Contraseña Incorrecta')
                return redirect("/login")
            
            if user[0]['status_user'] == 2:
                flash('El usuario ingresado no existe.')
                return redirect("/login")

            # Remember which user has logged in
            session["id_user"] = user[0]['id_user']
            session["username"] = username
            session["role_user"] = user[0]['role']

            return redirect('/')
        else:
            return redirect('/login')
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

        data = {
                "username": request.form.get("username"),
                "password": request.form.get("password"),
                "email": request.form.get("email"),
                "cedula":request.form.get("cedula"),
                "name":request.form.get("name"),
                "lastname":request.form.get("lastname"),
                "birthday":request.form.get("birthday"),
                "phone":request.form.get("phone"),
                "city":request.form["city"],
                "sex":request.form["sex"]
                }
        
        #envio de datos a la api
        res = requests.post(api_url+'/users/add', json=data)
        
        if res.status_code != 200:
            flash("El usuario ingresado ya existe.")
            return redirect("/register")
        else:
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


@app.route("/adminAddOrders", methods=["GET", "POST"])
@login_required
def adminAddOrders():
    return render_template("adminAddOrder.html", username=session["username"])

@app.route("/changeStatus/<id_order>/<status>", methods=["GET"])
def changeStatusOrder(id_order,status):
    # User reached route via POST (as by submitting a form via POST)
    data = {
            "id_order": id_order,
            "status": status
            }
    #envio de datos a la api
    res = requests.put(api_url+'/orders/changeStatus', json=data)
    
    if res.status_code != 200:
        flash("la orden no ha sido actualizad.")
        return redirect("/adminOrders")
    else:
        flash('¡Pedido actualizado!')
        # Redirect user to login page
        return redirect("/adminOrders")



@app.route("/adminDelivery", methods=["GET", "POST"])
@login_required
def adminDelivery():
    return render_template("adminDelivery.html", username=session["username"])

@app.route("/adminOrders", methods=["GET", "POST"])
@login_required
def adminOrders():

    if session["role_user"] == 1:
        orders = []
    #consulta api
        data = requests.get(api_url+'/orders/')
        if data.status_code == 200:
            dataJSON=data.json()
        
            for i in range(len(dataJSON)):
                orders.append([dataJSON[i]["id_item"],dataJSON[i]["username"],
                                dataJSON[i]["name"], dataJSON[i]["color"], dataJSON[i]["size"],
                                dataJSON[i]["paymethod"], dataJSON[i]["price"], dataJSON[i]["cost"],
                                dataJSON[i]["totalAmount"], dataJSON[i]["status"], dataJSON[i]["image"], dataJSON[i]["quantityOrders"], dataJSON[i]["id_status"],dataJSON[i]["id_order"]])
                i += 1

            return render_template('adminOrders.html', username=session["username"], orders=orders)
        else:
            Msg = "¡Hola! "+session["username"] + \
                "Hemos tenido un error de conexion con los servicios volveremos cuanto antes no te preocupes :D"
            return render_template("Mensajes.html", Msg=Msg, username=session["username"])

    else:
        return redirect("/")

@app.route("/adminShippings", methods=["GET", "POST"])
@login_required
def adminShippings():

    if session["role_user"] == 1:
        orders = []
    #consulta api
        data = requests.get(api_url+'/orders/shippings')
        if data.status_code == 200:
            dataJSON=data.json()
        
            for i in range(len(dataJSON)):
                orders.append([dataJSON[i]["address"],dataJSON[i]["username"],
                                dataJSON[i]["name"], dataJSON[i]["color"], dataJSON[i]["size"],
                                dataJSON[i]["paymethod"], dataJSON[i]["price"], dataJSON[i]["cost"],
                                dataJSON[i]["totalAmount"], dataJSON[i]["status"], dataJSON[i]["image"], dataJSON[i]["quantityOrders"], dataJSON[i]["id_status"],dataJSON[i]["id_order"]])
                i += 1

            return render_template('adminShippings.html', username=session["username"], orders=orders)
        else:
            Msg = "¡Hola! "+session["username"] + \
                "Hemos tenido un error de conexion con los servicios volveremos cuanto antes no te preocupes :D"
            return render_template("Mensajes.html", Msg=Msg, username=session["username"])

    else:
        return redirect("/")


@app.route("/adminSells", methods=["GET", "POST"])
@login_required
def adminSells():

    if session["role_user"] == 1:
        ordenes = []
        orders = db.execute(text(
            "Select i.id_item,u.username,i.name,od.color,od.size,p.method,i.price,sh.cost,(i.price+sh.cost),s.status,i.image FROM items i INNER JOIN orderdetails od ON od.item = i.id_item INNER JOIN orders o ON o.id_order = od.id_order INNER JOIN status s on s.id_status = o.id_status INNER JOIN users u on u.id_user = o.id_user INNER JOIN shipping sh on sh.id_order = o.id_order INNER JOIN addres_persons ap on ap.id_address_person = sh.address INNER JOIN paymentmethohds p on  p.id_paymentmethod = o.paymentmethod WHERE s.status = 'Entregado'")).fetchall()
        themostrepeat = db.execute(text(
            "Select i.id_item,i.name FROM items i INNER JOIN orderdetails od ON od.item = i.id_item INNER JOIN orders o ON o.id_order = od.id_order INNER JOIN status s on s.id_status = o.id_status INNER JOIN users u on u.id_user = o.id_user INNER JOIN shipping sh on sh.id_order = o.id_order INNER JOIN addres_persons ap on ap.id_address_person = sh.address INNER JOIN paymentmethohds p on  p.id_paymentmethod = o.paymentmethod WHERE s.status = 'Entregado' group by i.id_item,i.name order by i.id_item desc limit 1")).fetchall()

        TotalRecaudado = 0
        i = 0
        for o in orders:
            ordenes.append([orders[i][0], orders[i][1],
                           orders[i][2], orders[i][3], orders[i][4],
                           orders[i][5], orders[i][6], orders[i][7],
                           orders[i][8], orders[i][9], orders[i][10], (i+1)])
            TotalRecaudado += float(orders[i][8])
            i += 1
        TotalRecaudado = "{:,}".format(TotalRecaudado).replace(
            ',', '~').replace('.', ',').replace('~', '.')
        return render_template('adminSells.html', username=session["username"], orders=ordenes, Tot=TotalRecaudado, themost=themostrepeat[0][1])
    else:
        return redirect("/")


@app.route("/viewOrders/<id>", methods=["GET", "POST"])
@login_required
def viewOrders(id):
    if request.method == "POST":
        if session["role_user"] == 1:
            ordenes = []
            orders = db.execute(text(
                "Select i.id_item,u.username,i.name,od.color,od.size,i.image,i.price,sh.cost,(i.price+sh.cost),s.id_status FROM items i INNER JOIN orderdetails od ON od.item = i.id_item INNER JOIN orders o ON o.id_order = od.order INNER JOIN status s on s.id_status = o.id_status INNER JOIN users u on u.id_user = o.id_user INNER JOIN shipping sh on sh.order = o.id_order INNER JOIN addres_persons ap on ap.id_address_person = sh.address")).fetchall()

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
        items = db.execute(text(
            "SELECT * FROM items limit 25")).fetchall()
        # lista de items
        listItems = []
        # indice
        i = 0

        for item in items:
            # agregarmos items a la lista
            listItems.append([items[i][1], items[i][2], items[i][3],
                              items[i][4], items[i][5], items[i][0]])
            # incremento en 1 del indice
            i += 1
        return render_template('lookbook.html', username=session["username"], items=listItems)
    else:
        # obtenemos todos los items de la base de datos
        items = db.execute(text(
            "SELECT * FROM items i")).fetchall()
        # lista de items
        listItems = []
        # indice
        i = 0

        for item in items:
            # agregarmos items a la lista
            listItems.append([items[i][1], items[i][2], items[i][3],
                              items[i][4], items[i][5], items[i][0]])
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
            items = db.execute(text(
                "SELECT * FROM items i INNER JOIN clasification c ON c.id_clasification = i.clasification WHERE i.clasification = "+str(clasification)+"")).fetchall()
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

            return render_template('product.html', username=session["username"], items=listItems)
        elif item != None and clasification == None and category == None:
            # obtenemos todos los items de la base de datos
            items = db.execute(text(
                "SELECT * FROM items i INNER JOIN clasification c ON c.id_clasification = i.clasification WHERE i.id_item = "+str(item)+"")).fetchall()
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

            return render_template('productDetail.html', username=session["username"], items=listItems)
        elif item == None and clasification == None and category != None:
            # obtenemos todos los items de la base de datos
            items = db.execute(text(
                "SELECT * FROM items i INNER JOIN clasification c ON c.id_clasification = i.clasification  WHERE i.category = "+str(category)+"")).fetchall()
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
            items = db.execute(text(
                "SELECT * FROM items i WHERE i.category = "+str(category)+" and i.clasification = "+str(clasification)+";")).fetchall()
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
            items = db.execute(text(
                "SELECT * FROM items i INNER JOIN clasification c ON c.id_clasification = i.clasification WHERE i.clasification = "+str(clasification)+"")).fetchall()
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
            items = db.execute(text(
                "SELECT * FROM items i INNER JOIN clasification c ON c.id_clasification = i.clasification WHERE i.id_item = "+str(item)+"")).fetchall()
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

            return render_template('productDetail.html', username='null', items=listItems)
        elif item == None and clasification == None and category != None:
            # obtenemos todos los items de la base de datos
            items = db.execute(text(
                "SELECT * FROM items i INNER JOIN clasification c ON c.id_clasification = i.clasification  WHERE i.category = "+str(category)+"")).fetchall()
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
            items = db.execute(text(
                "SELECT * FROM items i WHERE i.category = "+str(category)+" and i.clasification = "+str(clasification)+";")).fetchall()
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
            db.execute(text("INSERT INTO items (name,description,image,price,clasification,category) VALUES ('"+str(name) +
                       "','"+str(description)+"','"+str(urlphoto)+"',"+str(price)+","+str(id_clasification)+","+str(id_category)+")"))
            db.commit()

            return redirect('/items')

# AÑADIR AL CARRITO


@app.route("/addToCar/<id>", methods=["POST", "GET"])
@login_required
def addToCar(id):
    if request.method == "POST":
        items = db.execute(text(
            "SELECT i.name,i.price,i.image,i.id_item FROM items i INNER JOIN clasification c ON c.id_clasification = i.clasification WHERE i.id_item = "+str(id)+"")).fetchall()
        # lista de items

        quantity = request.form.get("quantity")
        size = request.form.get("size")
        color = request.form.get("color")

        idcaritem = uuid.uuid4()
        carListItems.append([items[0][0], float(items[0][1]), float(
            quantity), size, color, items[0][2], str(idcaritem)])

        return redirect("/car")


@app.route("/addToCar/personalized/<json>", methods=["POST", "GET"])
@login_required
def addToCarPersonalized(json):
    if request.method == "POST":
        prenda = ""
        color = ""
        orientacion = ""
        cont = 0
        for i in json:
            if i == "-":
                cont += 1
            else:
                if cont == 0:
                    prenda += i
                elif cont == 1:
                    color += i
                elif cont == 2:
                    orientacion += i

        print(prenda+color+orientacion)
        """items = db.execute(
            "SELECT i.name,i.price,i.image FROM items i INNER JOIN clasification c ON c.id_clasification = i.clasification WHERE i.id_item = "+str(id)+"").fetchall()
        #lista de items"""

        quantity = request.form.get("quantity")
        size = request.form.get("size")

        """carListItems.append([items[0][0], float(items[0][1]), float(
            quantity), size, color, items[0][2], len(carListItems), id])"""

        return redirect("/car")


@app.route("/car", methods=["POST", "GET"])
@login_required
def car():
    if len(carListItems) == 0:
        Msg = "Agrega un articulo al carrito de compras."
        return render_template("Mensajes.html", Msg=Msg, username=session["username"])
    else:
        Direcciones = []
        Addres = db.execute(text(
            "SELECT * FROM addres_persons ap inner join person p on p.id_person = ap.person inner join users u on u.person = p.id_person where u.id_user = "+str(session["id_user"])+"")).fetchall()
        j = 0
        for a in Addres:
            Direcciones.append(
                [Addres[j][1], Addres[j][3], Addres[j][0]])
            j += 1

        x = 0
        for i in carListItems:
            print(i)
            print(i[6])
            x += 1
        return render_template('car.html', username=session["username"], items=carListItems, direcciones=Direcciones)


@app.route("/deleteToCar/<id>", methods=["POST", "GET"])
@login_required
def deleteToCar(id):

    j = 0
    for i in carListItems:
        if i[6] == id:
            carListItems.pop(j)
        j += 1

    return redirect("/car")


@app.route("/addAddres", methods=["POST", "GET"])
@login_required
def addAddres():
    departamento = request.form.get("city")
    d1 = request.form.get("addres")
    d2 = request.form.get("addres2")
    direccion = d1+" "+d2+""
    person = db.execute(text(
        "SELECT u.person FROM users u inner join person p on u.person = p.id_person where id_user = "+str(session["id_user"])+"")).fetchall()

    if len(departamento) > 0 and len(d1) > 0 and len(d2) > 0:
        db.execute("INSERT INTO addres_persons(address,person,city) VALUES ('" +
                   str(direccion)+"',"+str(person[0][0])+",'"+str(departamento)+"')")
        db.commit()
    else:
        flash("Rellena todos los campos.")
    return redirect("/car")


@app.route("/buys")
@login_required
def buys():
    buysList = []
    #consulta api
    data = requests.get(api_url+'/orders/'+session["username"])
    if data.status_code == 200:
        dataJSON=data.json()
       
        for i in range(len(dataJSON)):
            buysList.append([dataJSON[i]["addres"], dataJSON[i]["username"],
                            dataJSON[i]["name"], dataJSON[i]["color"], dataJSON[i]["size"],
                            dataJSON[i]["paymethod"], dataJSON[i]["price"], dataJSON[i]["cost"],
                            dataJSON[i]["totalAmount"], dataJSON[i]["status"], dataJSON[i]["image"],dataJSON[i]["addres"], dataJSON[i]["orderdate"], dataJSON[i]["quantityOrders"]])
            
            i += 1
        if len(dataJSON) < 1:
            Msg = "¡Hola! "+session["username"] + \
                " aún no haz comprado un articulo :D"
            return render_template("Mensajes.html", Msg=Msg, username=session["username"])
        else:
            return render_template("buys.html", buys=buysList, username=session["username"])
    else:
        Msg = "¡Hola! "+session["username"] + \
                "Hemos tenido un error de conexion con los servicios volveremos cuanto antes no te preocupes :D"
        return render_template("Mensajes.html", Msg=Msg, username=session["username"])


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
    Addres = db.execute(text(
        "SELECT * FROM addres_persons WHERE id_address_person = "+str(dir)+"")).fetchall()

    j = 0
    for a in Addres:
        Direccion = Addres[j][1]
        Departamento = Addres[j][3]
        j += 1

    return render_template("payMethod.html", username=session["username"], total=total, subtotal=subtotal, shippingcost=shippingcost, dir=Direccion, dep=Departamento)


@app.route("/successPay/<det>/<address>")
@login_required
def successPay(det, address):

    data = {
            "username": session["username"],
            "carListItems": carListItems,
            "address": address,
            }

    #envio de datos a la api
    res = requests.post(api_url+'/orders/add', json=data)
    # Limpieza del carrito
    carListItems.clear()

    return render_template("successPay.html", username=session["username"], det=det)


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8080, debug=True)
