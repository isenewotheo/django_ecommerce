<script>
	import {onMount, afterUpdate, beforeUpdate} from 'svelte';
	import Header from './Header.svelte';
	import Sidenav from './Sidenav.svelte';
	import Products from './Products.svelte';


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
    
    onMount(() => {
		postitionSidenav()
	});
	afterUpdate(() => {
		window.addEventListener("resize", postitionSidenav);
	});
	beforeUpdate(() => {
		window.removeEventListener("resize", postitionSidenav)
	});
	
    function toggleSidenav() {
        sidenavState = !sidenavState;
    }
	
</script>

<div>
	<Products />
</div>

<style>
	
</style>