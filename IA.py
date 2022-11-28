# MODULO DE INTELIGENCIA ARTIFICIAL
# Importamos librerias a utilizar
import os
from sqlalchemy import create_engine
from sqlalchemy.orm import scoped_session, sessionmaker
import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LogisticRegression
from sklearn.svm import SVC
import xlsxwriter

# Set up database
engine = create_engine(
    "postgresql://kohzfmcjsdiofe:0759fd1ec18c076fe9ccbb697567d68e722ee9ddcab6ef35e97c031f5dc3b757@ec2-34-231-42-166.compute-1.amazonaws.com:5432/d9idrg58i1672b")
db = scoped_session(sessionmaker(bind=engine))

# Lista de ordenes
ordenes = []

# Consultamos la base de datos para obtener las ordenes
orders = db.execute(
    "Select i.id_item,u.username,i.name,od.color,od.size,p.method,i.price,sh.cost,(i.price+sh.cost),s.status,i.image FROM items i INNER JOIN orderdetails od ON od.item = i.id_item INNER JOIN orders o ON o.id_order = od.id_order INNER JOIN status s on s.id_status = o.id_status INNER JOIN users u on u.id_user = o.id_user INNER JOIN shipping sh on sh.id_order = o.id_order INNER JOIN addres_persons ap on ap.id_address_person = sh.address INNER JOIN paymentmethohds p on  p.id_paymentmethod = o.paymentmethod WHERE s.status = 'Entregado'").fetchall()


i = 0
for o in orders:

    ordenes.append([orders[i][0], orders[i][1],
                    orders[i][2], orders[i][3], orders[i][4],
                    orders[i][5], orders[i][6], orders[i][7],
                    orders[i][8], orders[i][9], orders[i][10], (i+1)])
    # print(o)
    i += 1

orders_array = np.asarray(ordenes)
print(orders_array)
"""archivo = xlsxwriter.Workbook('dataset.xlsx')
hoja = archivo.add_worksheet()
for i in range(len(orders_array)):
    hoja.write(0, i, orders_array[i])
archivo.close()"""
