import api from './axiosConfig'

export const getItems = () => api.get('/items/')
export const getItemById = (id) => api.get(`/items/${id}`)
export const getItemsByCategory = (category, clasification) =>
  api.get(`/items/category/${category}/${clasification}`)
export const addItem = (data) => api.post('/items/add', data)
export const updateItem = (id, data) => api.put(`/items/update/${id}`, data)
export const deleteItem = (id) => api.delete(`/items/delete/${id}`)
