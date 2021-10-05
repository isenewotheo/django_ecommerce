<!-- 
    Currently useless 
    moved the component to the Product component 
    to reduce code
 -->

<script>
    import {onMount, afterUpdate, beforeUpdate} from 'svelte';
    
    let price = 10;
    let quantity = 1;

    let total;
    $: total = price * quantity;
</script>

<div>
    <div class="cart-product">
        <img src="/static/images/gun.jpg" class="cart-product-image" alt="product">
        <div class="product-name bold">this is a superb Gun</div>
        <div class="span">
            <div class="product-price bold">
                Price: ${price}
                <input type="number" name="qantity" id="product-quantity" bind:value={quantity} min="1" max="10" />
            </div>
            <hr/>
            <div class="product-total bold">Total: ${total}</div>
        </div>
        <button class="remove-from-cart bold">x</button>
    </div>
</div>

<style>
    /* .span {
        margin-top: 0px;
        margin-right: 8px;
    }
    #product-quantity {
        width: 44px;
    }
    #product-quantity::-webkit-scrollbar {
        display: none;
    }
    hr {
        margin: 0px;
    }
    .product-name {
        margin-top: 10px;
        padding-right: 4px;
    }
    .cart-product {
        background-color: white;
        min-height: 70px;
        width: 100%;
        position: relative;
        padding: 10px;
        margin: 10px auto;
        box-sizing: border-box;
        display: flex;
        flex-wrap: wrap;
        justify-content: space-between;
        border-radius: 3px;
        text-transform: capitalize;
        box-shadow: 1px 1px 8px rgb(185, 185, 185);
        font-size: .8rem;
    }
    .cart-product-image {
        width: 50px;
        height: 50px;
        display: block;
        border-radius: 3px;
    }
    .remove-from-cart {
        position: absolute;
        width: 20px;
        height: 20px;
        background-color: transparent;
        color: black;
        font-size: .8rem;
        padding-top: 1px;
        right: 0px;
        top: 0px;
        border: none;
        border-radius: 50%;
        transition: all 500ms;
    }
    .remove-from-cart:hover {
        background-color: rgb(167, 165, 165);
    }
    .remove-from-cart:hover::before {
        content: "Remove product";
        display: block;
        position: absolute;
        width: 100px;
        font-family: Helvetica, sans-serif;
        font-weight: lighter;
        font-size: .72rem;
        right: -2px;
        top: -19px;
        padding: 4px;
        background-color: black;
        color: white;
        border-radius: 2px;
    } */
</style>