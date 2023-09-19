<template>
    <div class="mainDiv">
        <h1>Register</h1>
        <form @submit.prevent="register()">
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
        </form>
        <div>{{ message }}</div>
    </div>
</template>

<script>
import { url, globalRequestParameters } from "../utils.js";

export default {
    name: "Register",
    data() {
        return {
            username: "",
            password: "",
            email: "",
            message: "",
        };
    },
    methods: {
        async register() {
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
                    res.text().then((res) => (this.message = res));
                })
                .catch((error) => {
                    console.error("Error registering user:", error);
                    alert("An error occurred while registering user.");
                });
        },
    },
};
</script>

<style scoped></style>
