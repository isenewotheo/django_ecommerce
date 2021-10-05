<script>
    import {onMount, afterUpdate, beforeUpdate} from 'svelte';
    import {addItemToCart, removeItemFromCart} from './cartFunctions.js';
    import Product from './Product.svelte';
    
    let cartProducts = JSON.parse(window.localStorage.getItem("cartProducts")).products;
    
    function handleRemove(event) {
        removeItemFromCart(event.detail);
        cartProducts = JSON.parse(window.localStorage.getItem("cartProducts")).products;
    }
    
</script>


<div class="cart">
    <h1>Cart</h1>
    {#if cartProducts.length == 0}
        <h2>NO STUFF HERE</h2>
    {:else}
        {#each cartProducts as product}
            <Product on:remove="{handleRemove}" cartProductData={product} variant="CartProduct"/>
        {/each}
        <button>Check Out</button>
    {/if}
</div>

<style>
	h1 {
        width: 100%;
        text-align: center;
    }
    button {
        background-color: var(--secondary);
        padding: 10px;
        width: 140px;
        border: none;
        color: white;
        font-weight: 500;
        display: block;
        margin: 40px auto;
    }
</style>