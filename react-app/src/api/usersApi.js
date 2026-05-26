import api from './axiosConfig'

export const getUser = (username) => api.get(`/users/${username}`)
export const registerUser = (data) => api.post('/users/add', data)
export const updateUser = (id, data) => api.put(`/users/update/${id}`, data)
export const deleteUser = (id) => api.delete(`/users/delete/${id}`)
export const loginUser = (username, password) => api.post('/users/login', { username, password })
export const recoverPassword = (email) => api.post('/users/recover_password', { email })
