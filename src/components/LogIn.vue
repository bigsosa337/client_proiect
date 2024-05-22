<template>
    <div class="mainDiv">
        <form @submit.prevent="login">
            <h1>Log In</h1>
            <div class="field">
                <label for="email">Email:</label>
                <input type="text" id="email" name="email" v-model="email" />
            </div>
            <div class="field">
                <label for="password">Password:</label>
                <input type="password" id="password" name="password" v-model="password" />
            </div>
            <div class="field">
                <button type="submit">Log In</button>
            </div>
            <div class="message">{{ message }}</div>
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
        async login() {
            if (!this.checkForm()) {
                return;
            }
            console.log(`You are trying to Log In with: ${this.email}`);

            let data = {
                email: this.email,
                password: this.password,
            };

            let requestParameters = {
                ...globalRequestParameters,
                method: "POST",
                body: JSON.stringify(data),
            };

            try {
                const response = await fetch(url + "login", requestParameters);
                const res = await response.json();

                this.message = res.message;

                if (res.token) {
                    localStorage.setItem("token", res.token);
                    this.$store.dispatch("login", res.token);
                    this.$router.push({
                        path: "/",
                        query: { reload: true }
                    });
                }
            } catch (error) {
                console.error("Login error:", error);
                this.message = "Login failed. Please try again.";
            }
        },
        checkForm() {
            if (!this.email || !this.password) {
                this.message = "Please fill in all the fields";
                return false;
            }
            if (!this.email.includes("@")) {
                this.message = "Email must be valid";
                return false;
            }
            return true;
        }
    }
};
</script>

<style scoped>
.mainDiv {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 100vh;
    background-color: #080710;
}

form {
    width: 400px;
    background-color: rgba(255, 255, 255, 0.13);
    border-radius: 10px;
    backdrop-filter: blur(10px);
    border: 2px solid rgba(255, 255, 255, 0.1);
    box-shadow: 0 0 40px rgba(8, 7, 16, 0.6);
    padding: 50px 35px;
    color: #ffffff;
}

h1 {
    font-family: 'Poppins', sans-serif;
    color: #ffffff;
    font-size: 32px;
    font-weight: 500;
    text-align: center;
    margin-bottom: 20px;
}

.field {
    margin-bottom: 15px;
}

label {
    display: block;
    font-size: 16px;
    font-weight: 500;
    margin-bottom: 5px;
}

input[type="text"],
input[type="password"] {
    width: 100%;
    padding: 10px;
    border: none;
    border-radius: 5px;
    font-size: 14px;
    background-color: rgba(255, 255, 255, 0.07);
    color: #ffffff;
    margin-top: 8px;
}

button {
    width: 100%;
    padding: 15px 0;
    background-color: #ffffff;
    color: #080710;
    border: none;
    border-radius: 5px;
    font-size: 18px;
    font-weight: 600;
    cursor: pointer;
    margin-top: 30px;
}

.message {
    font-size: 16px;
    font-weight: 500;
    text-align: center;
    margin-top: 20px;
    color: indianred;
}
</style>
