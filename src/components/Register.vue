<template>
    <div class="mainDiv">
        <form @submit.prevent="register()">
            <h1>Register</h1>
            <div class="field">
                <label for="username">Username:</label>
                <input type="text" id="username" name="username" v-model="username" />
            </div>
            <div class="field">
                <label for="password">Password:</label>
                <input type="password" id="password" name="password" v-model="password" />
            </div>
            <div class="field">
                <label for="email">Email:</label>
                <input type="email" id="email" name="email" v-model="email" />
            </div>
            <div class="field">
                <button type="submit">Register</button>
            </div>
            <div class="message" :class="{ 'color-green': color }" >{{ message }}</div>
        </form>
    </div>
</template>

<script>
import { url, globalRequestParameters } from "@/utils";
import { useField } from 'vee-validate';

export default {
    name: "Register",
    data() {
        return {
            username: "",
            password: "",
            email: "",
            message: "",
            color: false
        };
    },
    methods: {
        async register() {
            if (!this.checkForm()) {
                return;
            }
            const formData = new FormData();
            formData.append("username", this.username);
            formData.append("password", this.password);
            formData.append("email", this.email);

            let data = {
                email: this.email,
                username: this.username,
                password: this.password
            }

            // Use the imported 'url' and 'globalRequestParameters'
            const requestParameters = globalRequestParameters;
            requestParameters.method = "POST";
            requestParameters.body = JSON.stringify(data);


            fetch(url + "register", requestParameters)
                .then((res) => {
                    res.text().then((res) => (this.message = res)).then((res) => {
                        this.color = res === "Successful registration!";
                    });

                })
                .catch((error) => {
                    console.error("Error registering user:", error);
                    alert("An error occurred while registering user.");
                });
        },
        checkForm() {

            if (this.password.length < 8) {
                this.message = "Password must be at least 8 characters long.";
                return false;
            } else if (this.password.length > 20) {
                this.message = "Password must be at most 20 characters long.";
                return false;
            } else if (this.username.length < 3) {
                this.message = "Username must be at least 3 characters long.";
                return false;
            } else if (this.username.length > 20) {
                this.message = "Username must be at most 20 characters long.";
                return false;
            }
            if (this.username && this.password && this.email) {
                return true;
            }
            this.message = "Please fill out all fields.";
            return false;
        },

    },
};
</script>




<style scoped>

body{
    background-color: #080710;
}

h1 {
    font-family: 'Poppins',sans-serif;
    color: #ffffff;
    font-size: 32px;
    font-weight: 500;
    line-height: 42px;
    text-align: center;
    margin-bottom: 50px;
}

.message {
    font-family: 'Poppins',sans-serif;
    font-size: 16px;
    font-weight: 500;
    line-height: 26px;
    text-align: center;
    margin-top: 20px;
    color: indianred;

}
.color-red {
    color: indianred;
}
.color-green {
    color: lightgreen;
}
form{
    /*height: 520px;*/
    width: 400px;
    background-color: rgba(255,255,255,0.13);

    border-radius: 10px;
    backdrop-filter: blur(10px);
    border: 2px solid rgba(255,255,255,0.1);
    box-shadow: 0 0 40px rgba(8,7,16,0.6);
    padding: 50px 35px;
}
form *{
    font-family: 'Poppins',sans-serif;
    color: #ffffff;
    letter-spacing: 0.5px;
    outline: none;
    border: none;
}
form h3{
    font-size: 32px;
    font-weight: 500;
    line-height: 42px;
    text-align: center;
}

label{
    display: block;
    margin-top: 30px;
    font-size: 16px;
    font-weight: 500;
}
input{
    display: block;
    height: 50px;
    width: 100%;
    background-color: rgba(255,255,255,0.07);
    border-radius: 3px;
    padding: 0 10px;
    margin-top: 8px;
    font-size: 14px;
    font-weight: 300;
}
::placeholder{
    color: #e5e5e5;
}
button{
    margin-top: 50px;
    width: 100%;
    background-color: #ffffff;
    color: #080710;
    padding: 15px 0;
    font-size: 18px;
    font-weight: 600;
    border-radius: 5px;
    cursor: pointer;
}


.social div:hover{
    background-color: rgba(255,255,255,0.47);
}
.social .fb{
    margin-left: 25px;
}
.social i{
    margin-right: 4px;
}
.mainDiv {
    display: grid;
    justify-content: center;
    align-items: center;

}

</style>
