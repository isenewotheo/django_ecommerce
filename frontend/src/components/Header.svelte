<script>
    import {onMount, afterUpdate, beforeUpdate} from 'svelte';
    import {get} from 'svelte/store';
    import Store from './store.js';
    import baseURL from './baseurl.js';
    export let toggleSidenav;
    
    let cartCount = 0;
    Store.cartCount.subscribe(value => {
        cartCount = value;
    })

    let searchValue = ""

    let searchList;


    function clearSearchField() {
        searchValue = ""
        searchList.style.display = "none"
        
    }
// ------- incomplete ----------------
    function handleSearch(e) {
        if (searchValue != "") {
            console.log("searching ", searchValue)
        }
        try {
            searchList.style.display = "block"
            fetch(`${baseURL}/api/products/search/?q=${searchValue}`)
                .then(res => res.json())
                .then(data => {
                    console.table(data)
                })
        } catch (error) {
            console.log(error)
        }
    }

    onMount(() => {
       window.addEventListener("hashchange", clearSearchField)
       return (
           window.removeEventListener("hashchange", clearSearchField)
       )
    });
</script>

<header>
    <ul class="topnav">
        <li class="toggle-sidenav" on:click={toggleSidenav} >&#9776;</li>
        <li class="logo">
            <a href="/">
                <svg xmlns="http://www.w3.org/2000/svg" id="svelte" version="1.1" viewBox="0 0 300 300">
                    <path id="back" d="m175.94 24.328c-13.037.25172-26.009 3.8724-37.471 11.174l-58.557 37.316a67.134 67.134 0 0 0-30.355 44.906 70.794 70.794 0 0 0 6.959 45.445 67.224 67.224 0 0 0-10.035 25.102 71.535 71.535 0 0 0 12.236 54.156c23.351 33.41 69.468 43.311 102.81 22.07l58.559-37.158a67.359 67.359 0 0 0 30.355-44.906 70.771 70.771 0 0 0-6.9824-45.422 67.65 67.65 0 0 0 10.059-25.102 71.625 71.625 0 0 0-12.236-54.156v-.17969c-15.324-21.925-40.453-33.727-65.342-33.246zm5.1367 28.68a46.5 46.5 0 0 1 36.09 19.969 42.975 42.975 0 0 1 7.3652 32.557 45.242 45.242 0 0 1-1.3926 5.4551l-1.123 3.3691-2.9863-2.2461a75.846 75.846 0 0 0-22.902-11.451l-2.2441-.65039.20117-2.2461a13.157 13.157 0 0 0-2.3789-8.7109 13.988 13.988 0 0 0-14.953-5.4121 12.843 12.843 0 0 0-3.5938 1.5723l-58.578 37.25a12.237 12.237 0 0 0-5.502 8.1504 13.112 13.112 0 0 0 2.2461 9.834 14.033 14.033 0 0 0 14.93 5.5684 13.472 13.472 0 0 0 3.5937-1.5723l22.453-14.234a41.785 41.785 0 0 1 11.898-5.2324 46.477 46.477 0 0 1 49.914 18.502 43.02 43.02 0 0 1 7.3633 32.557 40.415 40.415 0 0 1-18.254 27.078l-58.58 37.316a43.065 43.065 0 0 1-11.898 5.2305 46.545 46.545 0 0 1-49.936-18.523 42.975 42.975 0 0 1-7.3418-32.557 38.17 38.17 0 0 1 1.3906-5.4102l1.1016-3.3691 3.0078 2.2461a75.846 75.846 0 0 0 22.836 11.361l2.2442.65039-.20118 2.2461a13.247 13.247 0 0 0 2.4473 8.6445 14.033 14.033 0 0 0 15.043 5.5684 13.135 13.135 0 0 0 3.5918-1.5723l58.467-37.316a12.169 12.169 0 0 0 5.502-8.1738 12.955 12.955 0 0 0-2.2461-9.8106 14.033 14.033 0 0 0-15.043-5.5684 12.843 12.843 0 0 0-3.5918 1.5703l-22.453 14.258a42.885 42.885 0 0 1-11.877 5.209 46.522 46.522 0 0 1-49.846-18.5 43.02 43.02 0 0 1-7.2969-32.557 40.415 40.415 0 0 1 18.254-27.078l58.646-37.316a42.773 42.773 0 0 1 11.811-5.209 46.5 46.5 0 0 1 13.822-1.4453z" style="fill:#ff5722;stroke-width:2.2453"/>
                </svg>
            </a>
        </li>
        <li class="search-link">
            <form on:submit|preventDefault={handleSearch}>
                <input type="text" bind:value={searchValue} name="search" id="search" placeholder="Search for products">
                <button type="button" on:click={clearSearchField} class="clear-search-field" >
                    {#if searchValue == ""}
                        {""}
                    {:else}
                        x
                    {/if}
                </button>
                <button class="search-button" value="submit">
                    <svg xmlns="http://www.w3.org/2000/svg" width="15px" height="15px" viewBox="0 0 512 512">
                        <path d="M505 442.7L405.3 343c-4.5-4.5-10.6-7-17-7H372c27.6-35.3 44-79.7 44-128C416 93.1 322.9 0 208 0S0 93.1 0 208s93.1 208 208 208c48.3 0 92.7-16.4 128-44v16.3c0 6.4 2.5 12.5 7 17l99.7 99.7c9.4 9.4 24.6 9.4 33.9 0l28.3-28.3c9.4-9.4 9.4-24.6.1-34zM208 336c-70.7 0-128-57.2-128-128 0-70.7 57.2-128 128-128 70.7 0 128 57.2 128 128 0 70.7-57.2 128-128 128z"/>
                    </svg>
                </button>
        <!-------------- SearchList ----- -->
                <div id="search-list" bind:this={searchList}>
                    <div class="close-search-list" on:click={e => searchList.style.display = "none"}>
                        <div class="arrow top-arrow"></div>
                    </div>
                    <div class="search-results">
                        <div class="search-result">search result</div>
                        <div class="search-result">search result</div>
                        <div class="search-result">search result</div>
                        <div class="search-result">search result</div>
                        <div class="search-result">search result</div>
                    </div>
                </div>
            </form>
        </li>
        <li class="launch-search-panel">
            <svg xmlns="http://www.w3.org/2000/svg" width="25px" height="25px" viewBox="0 0 512 512">
                <path d="M505 442.7L405.3 343c-4.5-4.5-10.6-7-17-7H372c27.6-35.3 44-79.7 44-128C416 93.1 322.9 0 208 0S0 93.1 0 208s93.1 208 208 208c48.3 0 92.7-16.4 128-44v16.3c0 6.4 2.5 12.5 7 17l99.7 99.7c9.4 9.4 24.6 9.4 33.9 0l28.3-28.3c9.4-9.4 9.4-24.6.1-34zM208 336c-70.7 0-128-57.2-128-128 0-70.7 57.2-128 128-128 70.7 0 128 57.2 128 128 0 70.7-57.2 128-128 128z"/>
            </svg>
        </li>
        <ul class="cart-group">
            <a href="#/cart">
                <li class="cart">
                    <svg width="25px" height="25px" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512">
                        <path d="M528.12 301.319l47.273-208C578.806 78.301 567.391 64 551.99 64H159.208l-9.166-44.81C147.758 8.021 137.93 0 126.529 0H24C10.745 0 0 10.745 0 24v16c0 13.255 10.745 24 24 24h69.883l70.248 343.435C147.325 417.1 136 435.222 136 456c0 30.928 25.072 56 56 56s56-25.072 56-56c0-15.674-6.447-29.835-16.824-40h209.647C430.447 426.165 424 440.326 424 456c0 30.928 25.072 56 56 56s56-25.072 56-56c0-22.172-12.888-41.332-31.579-50.405l5.517-24.276c3.413-15.018-8.002-29.319-23.403-29.319H218.117l-6.545-32h293.145c11.206 0 20.92-7.754 23.403-18.681z"/>
                    </svg>
                    <div class="cart-count">{cartCount}</div>
                </li>
            </a>
        </ul>
    </ul>
</header>

<style>
    #svelte {
        width: 30px;
    }
    .search-results {
        overflow-y: auto;
        height: 130px;

    }
    #search-list {
        cursor: auto;
        display: none;
        position: absolute;
        border-radius: 3px;
        box-shadow: 1px 1px 3px gray;
        z-index: 4;
        background-color: white;
        height: 150px;
        width: 193px;
        top: 50px;
        box-sizing: border-box;
        scrollbar-width: 5px;
    }
    .search-results::-webkit-scrollbar-thumb {
        background-color: gray;
    }
    .search-results::-webkit-scrollbar {
        display: block;
        width: 5px;
        background-color: transparent;
    }
    .search-result {
        background-color: rgb(226, 226, 226);
        padding: 4px;
        cursor: pointer;
        transition: all 150ms;
        font-weight: 600;
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        font-size: .9rem;
        text-transform: capitalize;
    }
    .search-result:hover {
        background-color: rgb(177, 175, 175);
    }
    .close-search-list {
        background-color: rgb(177, 175, 175);
        width: 100%;
        height: 20px;
        padding-top: 7px;
        box-sizing: border-box;
        cursor: pointer;
    }
    .top-arrow {
        margin: auto;
    }
</style>