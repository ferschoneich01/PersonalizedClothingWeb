import api from './axiosConfig'

export const getItems = () => api.get('/items/')
export const getItemById = (id) => api.get(`/items/${id}`)
export const getItemsByCategory = (category, clasification) =>
  api.get(`/items/category/${category}/${clasification}`)
export const getItemsByCategoryOnly = (category) =>
  api.get(`/items/category/${category}`)
export const getItemsByClasificationOnly = (clasification) =>
  api.get(`/items/clasification/${clasification}`)
export const addItem = (data) => api.post('/items/add', data)
export const updateItem = (id, data) => api.put(`/items/update/${id}`, data)
export const deleteItem = (id) => api.delete(`/items/delete/${id}`)

// Categorías dinámicas (clasification)
export const getCategories = () => api.get('/items/categories')
export const addCategory = (data) => api.post('/items/categories/add', data)
export const updateCategory = (id, data) => api.put(`/items/categories/update/${id}`, data)
export const deleteCategory = (id) => api.delete(`/items/categories/delete/${id}`)
