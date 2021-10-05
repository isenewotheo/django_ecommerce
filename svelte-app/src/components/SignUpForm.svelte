<script>
    import baseURL from './baseurl.js'
    let first_name = "faith";
    let last_name = "ubgaja";
    let email = "faith@ubgaja.com";
    let username = "faith3e";
    let password1 = "2323sdsd";
    let password2 = "2323sdsd";


    let message = "";
    let messageSuc = false;
    let messageErr = false;
    let submitting = false;

    function handleSubmit() {
        submitting = true;
        messageSuc = false;
        messageErr = false;
        if (username.length < 3  || password1.length < 8 || password2.length < 8) {
            message = "Username has to be more than 3 letters\n Password has to be more than 8 caracters"
            messageErr = true;
            submitting = false;
            return;
        } else if (first_name.length < 3 || last_name.length < 3){
            
        } else if (first_name.length < 3 || last_name.length < 3){
            message = "Firstname and Lastname has to be more than 3"
            messageErr = true;
            submitting = false;
            return;
        } else if (password1 != password2){
            submitting = false;
            messageErr = true;
            message = "Password1 and Password2 are not equal"
            return;
        }
        try {
            fetch(`${baseURL}/api/accounts/signup/`, {
                method: "POST",
                headers: {
                    "Accept": "application/json",
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({first_name, last_name,username, password1, password2, email})
            })
            .then(res => {
                submitting = false;
                return res.json();
            })
            .then(data => {
                for (const datakey in data) {
                    if (datakey == "message") {
                        messageSuc = true;
                        console.log(data)
                        message = data.message;
                    }else {
                        message = data[datakey];
                        messageErr = true;
                        return;
                    }
                }
            })
            .catch(err => console.log(err));
        } catch (error) {
            console.log(error)
        }
    }
    handleSubmit()
</script>

<form class="auth-form" on:submit|preventDefault={handleSubmit}>
    <h1>Signup</h1>
    <label for="first_name">Firstname</label>
    <input bind:value={first_name} type="text" placeholder="First Name">

    <label for="firsname">Lastname</label>
    <input bind:value={last_name} type="text" placeholder="Last Name">

    <label for="firsname">Email</label>
    <input bind:value={email} type="email" placeholder="Email">

    <label for="firsname">Username</label>
    <input bind:value={username} type="text" placeholder="Username">

    <label for="firsname">Password1</label>
    <input bind:value={password1} type="password" placeholder="Password1">

    <label for="firsname">Password2</label>
    <input bind:value={password2} type="password" placeholder="Password2">


    <div class="message" class:message-error={messageErr}>{message}</div>
    <div class="message" class:message-success={messageSuc}>{message}</div>

    <button class:loading={submitting} type="submit">
        {#if submitting}
            <div class="spinner"></div>
        {:else}
            Signup 
        {/if}
    </button>

    <div class="form-message">
        Already have an account <a href="/#/accounts/auth/login">Login</a> instead
    </div>
</form>

<style>
    label {
        margin-top: 10px;
        font-size: .9rem;
        font-weight: 550;
    }
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