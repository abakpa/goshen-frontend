import apiClient from './client.js';

const unwrap = (response) => response.data.data;

export const api = {
  dashboard: {
    owner: (params) => apiClient.get('/dashboard/owner', { params }).then(unwrap)
  },
  stores: {
    list: (params) => apiClient.get('/stores', { params }).then(unwrap),
    get: (id) => apiClient.get(`/stores/${id}`).then(unwrap),
    create: (payload) => apiClient.post('/stores', payload).then(unwrap),
    update: (id, payload) => apiClient.patch(`/stores/${id}`, payload).then(unwrap)
  },
  products: {
    list: (params) => apiClient.get('/products', { params }).then(unwrap),
    create: (payload) => apiClient.post('/products', payload).then(unwrap),
    createVariation: (payload) => apiClient.post('/products/variations', payload).then(unwrap),
    lookupBarcode: (barcode) => apiClient.get(`/products/barcode/${barcode}`).then(unwrap)
  },
  sales: {
    list: (params) => apiClient.get('/sales', { params }).then(unwrap),
    get: (id) => apiClient.get(`/sales/${id}`).then(unwrap),
    create: (payload) => apiClient.post('/sales', payload).then(unwrap),
    approve: (id) => apiClient.patch(`/sales/${id}/approve`).then(unwrap),
    reject: (id, payload) => apiClient.patch(`/sales/${id}/reject`, payload).then(unwrap),
    receipt: (id) => apiClient.get(`/sales/${id}/receipt`).then(unwrap),
    reprintReceipt: (id) => apiClient.patch(`/sales/${id}/receipt/reprint`).then(unwrap)
  },
  categories: {
    list: (params) => apiClient.get('/categories', { params }).then(unwrap),
    create: (payload) => apiClient.post('/categories', payload).then(unwrap)
  },
  inventory: {
    list: (params) => apiClient.get('/inventory', { params }).then(unwrap),
    receive: (payload) => apiClient.post('/inventory/receive', payload).then(unwrap),
    adjust: (payload) => apiClient.post('/inventory/adjust', payload).then(unwrap)
  },
  stockTransfers: {
    list: (params) => apiClient.get('/stock-transfers', { params }).then(unwrap),
    create: (payload) => apiClient.post('/stock-transfers', payload).then(unwrap),
    approve: (id) => apiClient.patch(`/stock-transfers/${id}/approve`).then(unwrap),
    reject: (id) => apiClient.patch(`/stock-transfers/${id}/reject`).then(unwrap),
    dispatch: (id) => apiClient.patch(`/stock-transfers/${id}/dispatch`).then(unwrap),
    receive: (id, payload) => apiClient.patch(`/stock-transfers/${id}/receive`, payload).then(unwrap)
  },
  customers: {
    list: (params) => apiClient.get('/customers', { params }).then(unwrap),
    create: (payload) => apiClient.post('/customers', payload).then(unwrap),
    history: (id) => apiClient.get(`/customers/${id}/history`).then(unwrap)
  },
  onlineOrders: {
    list: (params) => apiClient.get('/online-orders', { params }).then(unwrap),
    create: (payload) => apiClient.post('/online-orders', payload).then(unwrap),
    updateStatus: (id, payload) => apiClient.patch(`/online-orders/${id}/status`, payload).then(unwrap)
  },
  salesChannels: {
    list: (params) => apiClient.get('/sales-channels', { params }).then(unwrap),
    create: (payload) => apiClient.post('/sales-channels', payload).then(unwrap)
  },
  settings: {
    business: () => apiClient.get('/settings/business').then(unwrap),
    updateBusiness: (payload) => apiClient.patch('/settings/business', payload).then(unwrap),
    updateReceipt: (payload) => apiClient.patch('/settings/receipt', payload).then(unwrap)
  },
  credit: {
    sales: (params) => apiClient.get('/credit-sales', { params }).then(unwrap),
    createSale: (payload) => apiClient.post('/credit-sales', payload).then(unwrap),
    debtors: () => apiClient.get('/credit-sales/debtors').then(unwrap),
    recordPayment: (payload) => apiClient.post('/credit-payments', payload).then(unwrap)
  },
  expenses: {
    list: (params) => apiClient.get('/expenses', { params }).then(unwrap),
    create: (payload) => apiClient.post('/expenses', payload).then(unwrap)
  },
  returns: {
    list: (params) => apiClient.get('/returns', { params }).then(unwrap),
    create: (payload) => apiClient.post('/returns', payload).then(unwrap)
  },
  refunds: {
    list: (params) => apiClient.get('/refunds', { params }).then(unwrap),
    create: (payload) => apiClient.post('/refunds', payload).then(unwrap),
    approve: (id) => apiClient.patch(`/refunds/${id}/approve`).then(unwrap)
  },
  shifts: {
    list: (params) => apiClient.get('/shifts', { params }).then(unwrap),
    open: (payload) => apiClient.post('/shifts/open', payload).then(unwrap),
    close: (id, payload) => apiClient.patch(`/shifts/${id}/close`, payload).then(unwrap)
  },
  staff: {
    list: (params) => apiClient.get('/users', { params }).then(unwrap),
    create: (payload) => apiClient.post('/users', payload).then(unwrap),
    roles: (params) => apiClient.get('/roles', { params }).then(unwrap),
    getRole: (id) => apiClient.get(`/roles/${id}`).then(unwrap),
    createRole: (payload) => apiClient.post('/roles', payload).then(unwrap),
    updateRole: (id, payload) => apiClient.patch(`/roles/${id}`, payload).then(unwrap),
    permissions: () => apiClient.get('/permissions').then(unwrap)
  },
  reports: {
    sales: (params) => apiClient.get('/reports/sales', { params }).then(unwrap),
    inventory: (params) => apiClient.get('/reports/inventory', { params }).then(unwrap),
    expenses: (params) => apiClient.get('/reports/expenses', { params }).then(unwrap),
    credit: (params) => apiClient.get('/reports/credit', { params }).then(unwrap)
  }
};
