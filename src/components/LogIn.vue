<template>
    <div class="mainDiv">
        <h1>Log In</h1>
        <form @submit.prevent="login()">
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
        </form>
        <div>{{message}}</div>
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
                    })
                }
                //After log in redirect user to home page

            })
        })
    }
    }
}
</script>

<style scoped>

</style>
