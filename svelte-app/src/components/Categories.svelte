<script>
    import {onMount, afterUpdate, beforeUpdate} from 'svelte';
    import baseURL from './baseurl';
    import Product from './Product.svelte';


    async function getData(url) {
        return await fetch(url)
          .then(res => {
            if (res.status < 300 && res.status >= 200) {
                return res.json();
            }else {
                throw Error("failed loading products")
            }
          })
    }
    let loc = window.location.href;
    let loc_ = loc.split("/");
    let category = loc_[loc_.length-1];


    let productsURL;
    if (category == "men-clothing") {
        productsURL = `${baseURL}/api/products/categories/1/`;
    }else if (category == 'women-clothing'){
        productsURL = `${baseURL}/api/products/categories/2/`;
    }else if (category == 'children-clothing'){
        productsURL = `${baseURL}/api/products/categories/3/`;
    }else {
        productsURL = `${baseURL}/api/products/`;
    }
</script>

<div class="products">
    <h1>{category.replace("-", " ")}</h1>
    {#await getData(productsURL)}
        <div class="spinner"></div>
    {:then products}
        {#each products as product}
            {#if category == "trending"}
                <Product productData={product}/>
            {:else}
                <Product productData={{...product, img_url: `${baseURL + product.img_url}` }}/>
            {/if}
        {/each}
    {:catch error}
        <h2>There was an error Loading the Products</h2>
    {/await}
</div>

<style>
    h1 {
        width: 100%;
        text-align: center;
        margin: 20px 0px;
    }
</style>