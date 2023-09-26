<template>
    <div class="mainDiv">
        <form @submit.prevent="login()">
            <h1>Log In</h1>
            <div class="field">
                <label for="email">Email:</label>
                <input type="text" id="email" name="email" v-model="email"/>
            </div>
            <div class="field">
                <label for="password">Password:</label>
                <input type="password" id="password" name="password" v-model="password"/>
            </div>
            <div class="field">
                <button type="submit">Log In</button>
            </div>
            <div class="message">{{message}}</div>
        </form>
    </div>
</template>

<script>
import { url, globalRequestParameters } from "../utils.js";

export default {
    name: "LogIn",
    data() {
        return {
            email: "",
            password: "",
            message: "",
        };
    },
    methods: {
        login() {
            if (!this.checkForm()) {
                return;
            }
        console.log(`You are trying to Log In with:${this.email}`);
        //log utils
        let data = {
            email: this.email,
            password: this.password,
        };

        let requestParameters = globalRequestParameters;
        requestParameters.method = "POST";
        requestParameters.body = JSON.stringify(data);

        fetch(url + "login", requestParameters).then((res) => {
            res.json().then((res) => {
                this.message = res.message;
                if (res.token) {
                    localStorage.setItem("token", res.token);
                    this.$store.dispatch("login", true)
                    this.$router.push({
                        path: "/",
                        reload: true
                        //After log in redirect user to home page
                    })
                }
            })
        })
    },
        checkForm() {
            if(!this.password && !this.email){
                this.message = "Please fill in all the fields";
                return false;
            }
            if (!this.email.includes("@") || !this.email ) {
                this.message = "Email must be valid";
                return false;
            }
            if (!this.password.length) {
                this.message = "Insert a valid password";
                return false;
            }
            return true;
        }
    }
}
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
