<script>
    import Product from './Product.svelte';
    import baseurl from './baseurl.js';
    let prodURL = `${baseurl}/api/products/`;
    async function getData(url) {
        return await fetch(url, {
            method: "GET"
        }).then(res => {
            if (res.status <= 300 && res.status >= 200) {
                return res.json();
            }else {
                throw Error("failed loading products")
            }
        })
    }
</script>

<div class="products">
    {#await getData(prodURL)}
        <div class="spinner"></div>
    {:then products}
        {#each products as product}
             <Product productData={product}/>
        {/each}
    {:catch error}
        Failed to Get Products
    {/await}
</div>

<style>
</style>