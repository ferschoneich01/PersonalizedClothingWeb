import api from './axiosConfig'

export const getOrders = () => api.get('/orders/')
export const getOrderDetails = () => api.get('/orders/details')
export const getOrdersByUser = (username) => api.get(`/orders/${username}`)
export const getShippings = () => api.get('/orders/shippings')
export const addOrder = (data) => api.post('/orders/add', data)
export const changeOrderStatus = (id_order, status) =>
  api.put('/orders/changeStatus', { id_order, status })
export const uploadVoucher = (id_order, voucher_url) =>
  api.put('/orders/upload-voucher', { id_order, voucher_url })
