<script>
    import {onMount, beforeUpdate, afterUpdate} from 'svelte';
    import {addItemToCart} from './cartFunctions.js';    
    import Product from './Product.svelte';
    import baseurl from "./baseurl.js";
    import F0F from './four0four.svelte';

    let loc = window.location.href;
    let loc_ = loc.split("/");
    let id = loc_[loc_.length-1]
    let id_ = Number(id)


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

    let productDetail = getData(`${baseurl}/api/products/${id_}`);

    function load() {
        let loc = window.location.href;
        let loc_ = loc.split("/");
        let id = loc_[loc_.length-1]
        let id_s = Number(id)
        if (id_s < 0 || id_s > 0) {
            productDetail = getData(`${baseurl}/api/products/${id_s}`);
        }else {
            id_ = id_s
        }
    }
    afterUpdate(() => {
        window.addEventListener("hashchange", load)
        
    });
    beforeUpdate(() => {
        window.removeEventListener("hashchange", load)
    });
</script>

<div>
{#if (id_ < 0 || id_ > 0)}
     {#await productDetail}
         <div class="spinner"></div>    
     {:then product}
         <div class="product-details">
             <div id="product-image-wrapper">
                 <img src={product.img_url} id="product-image" alt="product name" />
             </div>
             <h2 class="product-details-name">{product.name}</h2>
             <div class="products-in-stock bold">{product.stock} in stock</div>
             <div class="flex">
                 <button on:click="{() => addItemToCart(product)}" class="add-to-cart">Add to cart</button>
                 <div class="product-price">Price: ${product.price}</div>
             </div>
             <div class="product-details-description">
                 <h3>Description:</h3>
                 {product.description}
             </div>
             <div class="product-review">
                 <h3>Reviews:</h3>
                 <h2>NO REVIEW YET</h2>
             </div>
             <div class="related-products">
                 <h3>Related Products</h3>
                 {#await getData(`${baseurl}/api/products/categories/${product.category}/`)}
                     <div class="spinner"></div>
                 {:then rProduct}
                     <div class="related-products-wrapper">
                         {#each rProduct as prod}
                             {#if prod.id == product.id}
                                  <!-- content here -->
                             {:else}
                                  <Product variant="RelatedProduct" relatedProductData={prod} id={prod.id} />
                             {/if}
                         {:else}
                             <h2>No Related Product</h2>
                         {/each}
                     </div>
                 {:catch error}
                     <h2>No Related Product</h2>
                 {/await}
             </div>
         </div>
     {:catch error}
         <h2>There was an error </h2>
     {/await}
{:else}
     <F0F />
{/if}
</div>
<style>
    .add-to-cart {
        color: white;
        font-weight: 500;
        background-color: var(--secondary);
        width: 100px;
        height: 30px;
        border: none;
    }
    #product-image-wrapper {
        width: 100%;
        height: auto;
        margin: 20px auto;
        padding: 5px;
    }
    #product-image {
        width: 350px;
        height: 350px;
        display: block;
        object-fit: cover;
        /* object-position: 100% 10px; */
        margin: auto;
        border-radius: 3px;
    }
    h3 {
        background-color: var(--secondary);
        padding: 5px;
        color: white;
        border-radius: 3px;
        margin-bottom: 10px;
    }
    @media screen and (max-width: 360px) {
        #product-image{
            width: 100%;
        }
    }
</style>