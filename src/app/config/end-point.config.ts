const BASE_URL = 'http://localhost:3000';
export const API_ENDPOINT = {
  auth: {
    login: '/users/login',
    register: '/users/register',
    registerAdmin: '/users/register-admin',
    checkEmail: '/users/check-email',
  },
  category: {
    list: '/categories/list',
    add: '/categories/add',
    delete: '/categories',
    edit: '/categories',
  },
  product: {
    list: '/products/list',
    add: '/products/add',
    delete: '/products',
    edit: '/products',
  },
  variant: {
    list: '/variants/list',
    add: '/variants/add',
    edit: '/variants',
    delete: '/variants',
  },
  order: {
    list: '/orders/list',
    detail: '/orders',
    add: '/orders/add',
    update: '/orders',
    myOrders: '/orders/list',
  },
  user: {
    list: '/users/list',
    detail: '/users',
    update: '/users',
    profile: '/users/profile',
    changePassword: '/users/change-password',
    getMe: '/users/me',
  },
  orderDetail: {
    list: '/orderdetails/list',
    detail: '/orderdetails',
    add: '/orderdetails/add',
    edit: '/orderdetails',
    delete: '/orderdetails',
  },
  cart: {
    list: '/carts/list',
    add: '/carts/add',
    detail: '/carts',
    delete: '/carts',
  },
  cartItem: {
    list: '/cart-items/list',
    add: '/cart-items/add',
    edit: '/cart-items',
    delete: '/cart-items',
  },
};
