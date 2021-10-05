<script>
    import baseURL from './baseurl.js';

    let usernameRef;
    let messageRef;

    let username = "dareadmin";
    let password = "25258825";

    let message = "";
    let messageSuc = false;
    let messageErr = false;
    let submitting = false;

    function handleSubmit() {
        submitting = true;
        messageSuc = false;
        messageErr = false;
        if (username.length < 3 || password.length < 8) {
            console.log("lskd")
            usernameRef.focus();
            message = "Username has to be more than 3 letters\n Password has to be more than 8 caracters"
            messageErr = true;
            submitting = false;
            return
        }
        try {
            fetch(`${baseURL}/api/accounts/login/`, {
                method: "POST",
                credentials: "same-origin",
                mode: "cors",
                headers: {
                    "Accept": "application/json",
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({username, password})
            })
            .then(res => {
                try {
                    console.log(res)
                } catch (err) {
                    console.log(err)                    
                }
                submitting = false
                if (res.ok){
                    return res.json()
                } else {
                    throw "error"
                }
            })
            .then(data => {
                if (data.hasOwnProperty("error")) {
                    message = data.error;
                    messageErr = true;
                    return;
                }
                messageSuc = true;
                message = data.details;
            })
            .catch(err => {
                console.log(err);
                messageErr = true;
                message = "there was an err"
                submitting = false
            });
        } catch (error) {
            console.log(error)
        }
    }
    handleSubmit()
</script>

<form class="auth-form" on:submit|preventDefault={handleSubmit}>
    <h1>Login</h1>
    <input bind:this={usernameRef} type="text" bind:value={username} placeholder="Username">
    <input type="password" bind:value={password} placeholder="Password">

    <div class="message" class:message-error={messageErr}>{message}</div>
    <div class="message" class:message-success={messageSuc}>{message}</div>

    <button class:loading={submitting} type="submit">
        {#if submitting}
            <div class="spinner"></div>
        {:else}
            Login 
        {/if}
    </button>
    <div class="form-message">
        Don't have an account <a href="/#/accounts/auth/signup">Create One</a>
    </div>
</form>

<style>
    .spinner {
        width: 20px;
        height: 20px;
        background-color: transparent;
    }
    .loading {
        background-color: rgb(252, 132, 111);
    }
    .message {
        display: none;
        padding: 5px;
        border-radius: 3px;
        color: white;
    }
    .message-success {
        display: block;
        background-color: rgb(45, 247, 45);
    }
    .message-error {
        display: block;
        background-color: rgb(253, 69, 69);
    }
</style>