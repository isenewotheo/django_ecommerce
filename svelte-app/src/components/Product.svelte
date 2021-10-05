<script>
    import {onMount, afterUpdate, beforeUpdate, createEventDispatcher} from 'svelte';
    import {addItemToCart} from './cartFunctions.js';
    import baseurl from './baseurl.js';

    const dispatch = createEventDispatcher();
    
    
    export let variant = "Product";

    export let productData = {}
    export let relatedProductData = {}
    export let cartProductData = {}

    // for cartProduct
    let price = cartProductData.price;
    let quantity = 1;
    let total;
    $: total = price * quantity;
</script>

{#if variant == "CartProduct"}
    <div class="cart-product">
        <img src="{cartProductData.img_url}" class="cart-product-image" alt="product">
        <div class="product-name bold">{cartProductData.name}</div>
        <div class="span">
            <div class="product-price bold">
                Price: ${price}
                <input type="number" name="qantity" id="product-quantity" bind:value={quantity} min="1" max="10" />
            </div>
            <hr/>
            <div class="product-total bold">Total: ${total}</div>
        </div>
        <button  on:click={() => dispatch("remove", cartProductData.id)} class="remove-from-cart bold">x</button>
    </div>
{:else if variant == "RelatedProduct"}
    <div class="product" style="height: 160px">
        <div class="product-image-wrapper" style="margin-top: -2px;">
            <a href="#/products/{relatedProductData.id}">
                <img class="product-image" src={baseurl+relatedProductData.img_url} alt="Product">
            </a>
        </div>
        <div class="product-name">{relatedProductData.name}</div>
        <div class="bold">$800.99</div>
    </div>
{:else }
    <div class="product" >
        <div class="product-image-wrapper">
            <a href="#/products/{productData.id}">
                <img class="product-image" src={productData.img_url} alt="Product">
            </a>
        </div>
        <div class="product-name">{productData.name}</div>
        <div class="products-in-stock bold">stock: {productData.stock}</div>
        <div class="product-price bold">${productData.price}</div>
        <button on:click={e => addItemToCart(productData)} class="add-to-cart-icon">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512"><path d="M504.717 320H211.572l6.545 32h268.418c15.401 0 26.816 14.301 23.403 29.319l-5.517 24.276C523.112 414.668 536 433.828 536 456c0 31.202-25.519 56.444-56.824 55.994-29.823-.429-54.35-24.631-55.155-54.447-.44-16.287 6.085-31.049 16.803-41.548H231.176C241.553 426.165 248 440.326 248 456c0 31.813-26.528 57.431-58.67 55.938-28.54-1.325-51.751-24.385-53.251-52.917-1.158-22.034 10.436-41.455 28.051-51.586L93.883 64H24C10.745 64 0 53.255 0 40V24C0 10.745 10.745 0 24 0h102.529c11.401 0 21.228 8.021 23.513 19.19L159.208 64H551.99c15.401 0 26.816 14.301 23.403 29.319l-47.273 208C525.637 312.246 515.923 320 504.717 320zM408 168h-48v-40c0-8.837-7.163-16-16-16h-16c-8.837 0-16 7.163-16 16v40h-48c-8.837 0-16 7.163-16 16v16c0 8.837 7.163 16 16 16h48v40c0 8.837 7.163 16 16 16h16c8.837 0 16-7.163 16-16v-40h48c8.837 0 16-7.163 16-16v-16c0-8.837-7.163-16-16-16z"/></svg>
        </button>
    </div>  
{/if}

<style>

</style>