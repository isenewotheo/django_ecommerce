<script>
    import {onMount, afterUpdate} from 'svelte';
    import baseURL from './baseurl.js';
    import Store from './store.js';
    export let sidenavState;
    let userExist = false;
    Store.userExist.subscribe(value => userExist = value)
    let user = {}
    Store.user.subscribe(value => user = value);

    let sideNav;

    $: sidenavState

    afterUpdate(() => {
        if (sidenavState) {
            sideNav.style.left = "0px";
        }else{
            sideNav.style.left = "-1000px";
        }
    });
    function logout() {
        fetch(baseURL + "/api/accounts/logout", {
            credentials: "include"
        })
          .then(res => {
              if (res.ok) {
                  return  res.json();
              }
              throw new Error("there was an error login you out ");
          })
          .then(data => Store.userExist.update(pvalue => false))
          .catch(err => console.log(err))
    }
</script>

<div bind:this={sideNav} class="sidenav">
    <ul class="auth-buttons">
        {#if userExist}
        
            <li>
                <button class="auth-button" on:click={logout}>logout</button>
            </li>
            <li>
                <a href="#/accounts/me">
                    <div class="username">@{user.username}</div>
                </a>
            </li>
        {:else}
            <li>
                <a href="#/accounts/auth/login"><button class="auth-button">login</button></a>
            </li>
            <li>
                <button class="auth-button">signup</button>
            </li>
        {/if}
    </ul>
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

    .username{
        margin-top: 10px;
    }
    .product-categories {
        display: flex;
        list-style: none;
        flex-direction: column;
        justify-content: space-around;
        height: 200px;
    }
    a {
        text-decoration: none;
        color: white;
    }
    a:hover {
        color: rgb(4, 81, 112);
    }
    .product-category {
        text-transform: capitalize;
        font-size: .9rem;
        letter-spacing: 1px;
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    }
    .auth-buttons {
        list-style: none;
        display: flex;
        justify-content: flex-start;
        flex-wrap: wrap;
        margin-left: -30px;
    }
    .auth-button {
        margin: 5px 2px;
        background-color: var(--primary);
        border: none;
        font-size: .9rem;
        font-weight: 550;
        font-family: inherit;
        text-transform: capitalize;
    }
</style>