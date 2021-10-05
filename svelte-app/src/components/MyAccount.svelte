<script>
    import Four0Four from './four0four.svelte'
    import Store from './store.js';
    let userExist = false;
    Store.userExist.subscribe(value => userExist = value);
    let user = {}
    Store.user.subscribe(value => user = value);
</script>

{#if userExist}
<div class="my-account">
    <div class="avatar-img">{user.username.slice(0,1).toUpperCase()}</div>
    <div class="details">
        <div class="detail">
            <span class="label">First name: </span>
            <span>{user.first_name}</span>
        </div>
        <div class="detail">
            <span class="label">Last name: </span>
            <span>{user.last_name}</span>
        </div>
        <div class="detail">
            <span class="label">User name: </span>
            <span>{user.username}</span>
        </div>
        <div class="detail">
            <span class="label">My Orders: 
                <div style="display: inline-block;" class="arrow bottom-arrow"></div>
            </span>
        </div>
    </div>
</div>
{:else}
    <Four0Four />
{/if}



<style>
    .avatar-img {
        width: 150px;
        height: 150px;
        margin: 10px auto;
        border-radius: 50%;
        text-align: center;
        padding-top: 40px;
        box-sizing: inherit;
        font-size: 3.5rem;
        background-color: var(--secondary);
    }
    .detail {
        margin: 15px 0px;
    }
    .label {
        font-weight: 600;
        font-style: oblique;
    }
    .my-account {
        padding: 20px;
        box-sizing: border-box;
        max-width: 300px;
        min-height: 400px;
        border-radius: 5px;
        box-shadow: 1px 1px 7px gray;
        margin: 20px auto;
    }
</style>

