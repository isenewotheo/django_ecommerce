<script>
	import {onMount, afterUpdate} from 'svelte'
    export let sidenavState;

    let sideNav;

    $: sidenavState

    afterUpdate(() => {
        if (sidenavState) {
            sideNav.style.left = "0px";
        }else{
            sideNav.style.left = "-1000px";
            // sideNav.style.left = "0px";
        }
    });

</script>

<div bind:this={sideNav} class="sidenav">
    <a href="#/accounts/me"><div class="avatar">I</div></a>
    <ul class="product-categories">
        <a href="#/products/categories/men-clothing">
            <li class="product-category">men clothing</li>
        </a>
        <a href="#/products/categories/women-clothing">
            <li class="product-category">women clothing</li>
        </a>
        <a href="#/products/categories/children-clothing">
            <li class="product-category">children clothing</li>
        </a>
        <a href="#/products/categories/trending">
            <li class="product-category">Trending</li>
        </a>
    </ul>
</div>

<style>
    .product-categories {
        display: flex;
        list-style: none;
        flex-direction: column;
        justify-content: space-around;
        height: 200px;
        /* background-color: gray; */
    }
    .product-categories a {
        text-decoration: none;
        color: white;
    }
    .product-category {
        text-transform: capitalize;
        font-size: .9rem;
        letter-spacing: 1px;
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    }
</style>