import openstack

conn = openstack.connect(clouds='openstack')

for server in conn.compute.servers():
    print(server.to_dict())
