import { Routes } from '@angular/router';
import { authGuard } from './auth/auth.guard';
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
				path: 'shop/:name',
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
				canActivate: [authGuard],
			},
			// CATEGORY
			{
				path: 'categories',
				loadComponent: () =>
					import('./pages/admin/category-page/category-page').then(m => m.CategoryPage),
				canActivate: [authGuard],
			},
			{
				path: 'category-create',
				loadComponent: () =>
					import('./pages/admin/category-create/category-create').then(m => m.CategoryCreate),
				canActivate: [authGuard],
			},
			{
				path: 'category-edit/:id',
				loadComponent: () =>
					import('./pages/admin/category-edit/category-edit').then(m => m.CategoryEdit),
				canActivate: [authGuard],
			},


			// PRODUCT
			{
				path: 'products',
				loadComponent: () =>
					import('./pages/admin/product-page/product-page').then(m => m.ProductPage),
				canActivate: [authGuard],
			},
			{
				path: 'product-create',
				loadComponent: () =>
					import('./pages/admin/product-create/product-create').then(m => m.ProductCreate),
				canActivate: [authGuard],
			},
			{
				path: 'product-edit/:id',
				loadComponent: () =>
					import('./pages/admin/product-edit/product-edit').then(m => m.ProductEdit),
				canActivate: [authGuard],
			},


			// ORDER
			{
				path: 'orders',
				loadComponent: () =>
					import('./pages/admin/order-page/order-page').then(m => m.OrderPage),
				canActivate: [authGuard],
			},
			{
				path: 'order-detail/:id',
				loadComponent: () =>
					import('./pages/admin/order-detail/order-detail').then(m => m.OrderDetail),
				canActivate: [authGuard],
			},

			// USER
			{
				path: 'users',
				loadComponent: () =>
					import('./pages/admin/user-page/user-page').then(m => m.UserPage),
				canActivate: [authGuard],
			},
			{
				path: 'user-detail/:id',
				loadComponent: () =>
					import('./pages/admin/user-detail/user-detail').then(m => m.UserDetail),
				canActivate: [authGuard],
			},
			{
				path: 'register-admin',
				loadComponent: () =>
					import('./pages/admin/register-admin/register-admin').then(m => m.RegisterAdmin),
				canActivate: [authGuard],
			}
		],
	},

	// ===== NOT FOUND =====
	{
		path: '**',
		redirectTo: '',
	},
];