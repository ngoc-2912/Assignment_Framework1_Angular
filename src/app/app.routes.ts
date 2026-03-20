import { Routes } from '@angular/router';

export const routes: Routes = [
	// ===== CLIENT =====
	{
		path: '',
		loadComponent: () =>
			import('./layouts/client-layout/client-layout').then(m => m.ClientLayout),
		children: [
			{
				path: '',
				loadComponent: () =>
					import('./pages/client/home-page/home-page').then(m => m.HomePage),
			},
			{
				path: 'shop',
				loadComponent: () =>
					import('./pages/client/shop-page/shop-page').then(m => m.ShopPage),
			},
			{
				path: 'shop/:slug',
				loadComponent: () =>
					import('./pages/client/product-detail-page/product-detail-page')
						.then(m => m.ProductDetailPage),
			},
			{
				path: 'cart',
				loadComponent: () =>
					import('./pages/client/cart-page/cart-page').then(m => m.CartPage),
			},
			{
				path: 'checkout',
				loadComponent: () =>
					import('./pages/client/checkout-page/checkout-page')
						.then(m => m.CheckoutPage),
			},
			{
				path: 'login',
				loadComponent: () =>
					import('./pages/client/login-page/login-page').then(m => m.LoginPage),
			},
			{
				path: 'register',
				loadComponent: () =>
					import('./pages/client/register-page/register-page')
						.then(m => m.RegisterPage),
			},
			{
				path: 'about',
				loadComponent: () =>
					import('./pages/client/about-page/about-page').then(m => m.AboutPage),
			},
			{
				path: 'profile',
				loadComponent: () =>
					import('./pages/client/profile-page/profile-page').then(m => m.ProfilePage),
			},
		],
	},

	// ===== ADMIN =====
	{
		path: 'admin',
		loadComponent: () =>
			import('./layouts/admin-layout/admin-layout').then(m => m.AdminLayout),
		children: [
			{
				path: '',
				redirectTo: 'dashboard',
				pathMatch: 'full',
			},
			{
				path: 'dashboard',
				loadComponent: () =>
					import('./pages/admin/dashboard/dashboard').then(m => m.Dashboard),
			},
			// CATEGORY
			{
				path: 'categories',
				loadComponent: () =>
					import('./pages/admin/category-page/category-page').then(m => m.CategoryPage),
			},
			{
				path: 'category-create',
				loadComponent: () =>
					import('./pages/admin/category-create/category-create').then(m => m.CategoryCreate),
			},
			{
				path: 'category-edit/:id',
				loadComponent: () =>
					import('./pages/admin/category-edit/category-edit').then(m => m.CategoryEdit),

			},


			// PRODUCT
			{
				path: 'products',
				loadComponent: () =>
					import('./pages/admin/product-page/product-page').then(m => m.ProductPage),
			},
			{
				path: 'product-create',
				loadComponent: () =>
					import('./pages/admin/product-create/product-create').then(m => m.ProductCreate),
			},
			{
				path: 'product-edit/:id',
				loadComponent: () =>
					import('./pages/admin/product-edit/product-edit').then(m => m.ProductEdit),
			},


			// ORDER
			{
				path: 'orders',
				loadComponent: () =>
					import('./pages/admin/order-page/order-page').then(m => m.OrderPage),
			},
			{
				path: 'order-detail/:id',
				loadComponent: () =>
					import('./pages/admin/order-detail/order-detail').then(m => m.OrderDetail),
			},

			// USER
			{
				path: 'users',
				loadComponent: () =>
					import('./pages/admin/user-page/user-page').then(m => m.UserPage),
			},
			{
				path: 'user-detail/:id',
				loadComponent: () =>
					import('./pages/admin/user-detail/user-detail').then(m => m.UserDetail),
			}
		],
	},

	// ===== NOT FOUND =====
	{
		path: '**',
		redirectTo: '',
	},
];