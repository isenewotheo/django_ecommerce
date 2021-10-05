import Products from './components/Products.svelte'; 
import Cart from './components/Cart.svelte';
import Categories from './components/Categories.svelte';
import ProductDetails from './components/ProductDetails.svelte';
import Home from './components/Home.svelte';
import LoginForm from './components/LoginForm.svelte';
import SignUpForm from './components/SignUpForm.svelte';
import MyAccount from './components/MyAccount.svelte';
import Four0Four from './components/Four0Four.svelte';

const routes = {
    "/": Home,
    "/accounts/me": MyAccount,
    "/accounts/auth/login": LoginForm,
    "/accounts/auth/signup": SignUpForm,
    "/products/": Products,
    "/products/categories/men-clothing/": Categories,
    "/products/categories/women-clothing/": Categories,
    "/products/categories/children-clothing/": Categories,
    "/products/categories/trending/": Categories,
    "/products/:id": ProductDetails,
    "/cart": Cart,
    "*": Four0Four
}

export default routes;