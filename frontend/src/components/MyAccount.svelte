<script>
    import baseURL from './baseurl.js';
    fetch(baseURL + "/api/accounts/me/", {
        credentials: "same-origin",
        method: "POST"
    })
      .then(res => {
          console.log(res)
          return  res.json();
      })
      .then(data => console.log(data))
      .catch(err => console.log(err))
</script>

<div class="my-account">
    <div class="avatar-img">I</div>
    <div class="details">
        <div class="detail">
            <span class="label">First name: </span>
            <span>dare</span>
        </div>
        <div class="detail">
            <span class="label">Last name: </span>
            <span>the</span>
        </div>
        <div class="detail">
            <span class="label">User name: </span>
            <span>dfdfdf</span>
        </div>
        <div class="detail">
            <span class="label">My Orders: </span>
            <span>Orders</span>
        </div>
    </div>
</div>


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

