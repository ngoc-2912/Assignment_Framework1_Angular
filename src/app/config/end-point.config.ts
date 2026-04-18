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
        update: '/orders',
        myOrders: '/orders/my-orders'
    },
    user: {
        list: '/users/list',
        detail: '/users',
        update: '/users',
         profile: '/users/profile',
    changePassword: '/users/change-password'
    }
}