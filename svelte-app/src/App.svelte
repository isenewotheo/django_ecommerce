<script>
	import {onMount, afterUpdate, beforeUpdate} from 'svelte';
	import Store from './components/store.js';
	import Router from 'svelte-spa-router';
	import routes from './routes';
	import Header from './components/Header.svelte';
	import Sidenav from './components/Sidenav.svelte';
	import Products from './components/Products.svelte';
	import baseURL from './components/baseurl.js';
	
	let sidenavState = false;


    function postitionSidenav() {
        if (window.innerWidth >= 700) {
			setTimeout(() => {
				sidenavState = true;
			}, 3);
        }else {
            sidenavState = false;
        }
	}

	function verifyHash() {
        if (window.innerWidth <= 700) {
			if (sidenavState) {
				sidenavState = false
			}
		}
		window.scrollTo(0, 0)
	}
    
    onMount(() => {
		postitionSidenav();
		// this initializes the cart products list in the localstorage
		if (window.localStorage.getItem("cartProducts") == null) {
			let d = {
				products: []
			}
			window.localStorage.setItem("cartProducts", JSON.stringify(d))
		}

		// intialize cartCount
		Store.cartCount.update(preValue => {
            return JSON.parse(window.localStorage.getItem("cartProducts")).products.length;
		});
		// Get user details
		fetch(baseURL + "/api/accounts/me/", {
			credentials: "include",
		})
		.then(res => {
				if(res.ok){
					return  res.json();
				}
				throw new Error("There was an error")
		})
		.then(data => {
			if (data.id === null) {
				Store.userExist.update(preValue => false);
			} else {
				Store.userExist.update(preValue => true);
				Store.user.update(preValue => data);
			}
		})
		.catch(err => console.log(err))
	});
	afterUpdate(() => {
		window.addEventListener("resize", postitionSidenav);
		window.addEventListener("hashchange", verifyHash)
	});
	beforeUpdate(() => {
		window.removeEventListener("resize", postitionSidenav)
		window.removeEventListener("hashchange", verifyHash)
	});
	
    function toggleSidenav() {
        sidenavState = !sidenavState;
    }
	
</script>

<Header {toggleSidenav} ></Header>
<Sidenav {sidenavState}/>
<main>
	<div class="main">
		<Router {routes} />
	</div>
</main>

<style>
	
</style>