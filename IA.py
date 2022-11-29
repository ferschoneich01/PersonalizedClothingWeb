# MODULO DE INTELIGENCIA ARTIFICIAL
# openpyxl
# Importamos librerias a utilizar
import os
from sqlalchemy import create_engine
from sqlalchemy.orm import scoped_session, sessionmaker
import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LogisticRegression
from sklearn.svm import SVC
from sklearn.neighbors import KNeighborsClassifier

# codigo para obtener datos de la base de datos
"""
# Set up database
engine = create_engine(
    "postgresql://kohzfmcjsdiofe:0759fd1ec18c076fe9ccbb697567d68e722ee9ddcab6ef35e97c031f5dc3b757@ec2-34-231-42-166.compute-1.amazonaws.com:5432/d9idrg58i1672b")
db = scoped_session(sessionmaker(bind=engine))

# Lista de ordenes
ordenes = []

# Consultamos la base de datos para obtener las ordenes
orders = db.execute(
    "Select i.id_item,i.name,od.color,od.size,o.orderdate FROM items i INNER JOIN orderdetails od ON od.item = i.id_item INNER JOIN orders o ON o.id_order = od.id_order INNER JOIN status s on s.id_status = o.id_status INNER JOIN users u on u.id_user = o.id_user INNER JOIN shipping sh on sh.id_order = o.id_order INNER JOIN addres_persons ap on ap.id_address_person = sh.address INNER JOIN paymentmethohds p on  p.id_paymentmethod = o.paymentmethod WHERE s.status = 'Entregado'").fetchall()

# Rellenamos la lista con los resultados de la consulta
i = 0
for o in orders:

    ordenes.append([orders[i][0], orders[i][1],
                    orders[i][2], orders[i][3], orders[i][4]])
    print(str(orders[i][0])+',"'+str(orders[i][1])+'","'+str(orders[i][2]) +
          '","'+str(orders[i][3])+'",'+str(orders[i][4]))
    i += 1

# Pasamos los datos a un archivo de excel
##data = pd.DataFrame(ordenes)
# data.to_excel('dataset.xlsx')
"""

df_test = pd.read_csv('test_products.csv', header=0)
df_train = pd.read_csv('train_products.csv', header=0)

# Vericamos cantidad de datos que hay en el dataset
print('Cantidad de datos: ')
print(df_train.shape)
print(df_train.shape)
print(df_test.shape)
print(df_test.shape)
# Verificamos los tipos de datos contenidos en el dataset
print('Tipos de datos: ')
print(df_train.info)
print(df_train.info)
print(df_test.info)
print(df_test.info)
# verificamos los datos faltantes de los dataset
print('Datos faltantes: ')
print(pd.isnull(df_train).sum())
print(pd.isnull(df_test).sum())
print('')
# verificamos estadisticas del dataset
print('Estadisticas del dataset: ')
print(df_train.describe())
print(df_test.describe())

# Cambiamos los datos de color a número
df_train['color'].replace(['Negro', 'Blanco', 'Rosado', 'Gris', 'Azul'], [
                          0, 1, 2, 3, 4], inplace=True)
df_test['color'].replace(['Negro', 'Blanco', 'Rosado', 'Gris', 'Azul'], [
    0, 1, 2, 3, 4], inplace=True)
# Cambiamos los datos de tallas a números
df_train['talla'].replace(['XS', 'S', 'M', 'L', 'XL'], [
                          0, 1, 2, 3, 4], inplace=True)
df_test['talla'].replace(['XS', 'S', 'M', 'L', 'XL'], [
    0, 1, 2, 3, 4], inplace=True)
# Eliminamos las columnas que no son necesarias para el analisis
df_train = df_train.drop(['id', 'producto', 'fecha'], axis=1)
df_test = df_test.drop(['producto', 'fecha'], axis=1)
# Eliminamos columnas con datos perdidos
df_train.dropna(axis=0, how='any', inplace=True)
df_test.dropna(axis=0, how='any', inplace=True)
# Verificamos datos
print(pd.isnull(df_train).sum())
print(df_train.shape)
print(df_train.head)
print(pd.isnull(df_test).sum())
print(df_test.shape)
print(df_test.head)

# MACHINE LEARNING
# Ahora en esta parte comenzamos a impleamentar los algoritmos
# de Maniche Learning como: Algoritmo de Regresion Logística, Vectores de soporte, Vecinos más cercanos.

# Separamos las columnas con la información de las prendas
X = np.array(df_train.drop(['color']), 1)
Y = np.array(df_train['color'])

# Separamos los datos de 'train' en entrenamiento y prueba para probar los algoritmos
X_train, X_test, Y_train, Y_test = train_test_split(X, Y, test_size=0.2)

# Regresion Logística
Logreg = LogisticRegression()
Logreg.fit(X_train, Y_train)
Y_pred = Logreg.predict(X_test)
print('Precisión Regresión Logística: ')
print(Logreg.score(X_train, Y_train))

# Support vector Machines
svc = SVC()
svc.fit(X_train, Y_train)
Y_pred = svc.predict(X_test)
print('Precisión Soporte de vectores: ')
print(svc.score(X_train, Y_train))

# K neighbors vecinos más cercanos
knn = KNeighborsClassifier(n_neighbors=3)
knn.fot(X_train, Y_train)
Y_pred = knn.predict(X_test)
print('Precisión Vecinos más Cercanos: ')
print(knn.score(X_train, Y_train))
