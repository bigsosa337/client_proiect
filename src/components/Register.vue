<template>
    <div class="limiter">
        <div class="container-register100">
            <div class="wrap-register100">
                <div class="register100-pic js-tilt" data-tilt>
                    <img src="../../public/logo.png" alt="IMG">
                    <div class="quote">
                        "Your fancy quote goes here. Make it inspiring and engaging."
                    </div>
                </div>
                <form class="register100-form validate-form" @submit.prevent="register()">
                    <span class="register100-form-title">
                        Member Register
                    </span>
                    <div class="wrap-input100 validate-input" data-validate="Valid email is required: ex@abc.xyz">
                        <input class="input100" type="email" id="email" name="email" v-model="email" placeholder="Email">
                        <span class="focus-input100"></span>
                        <span class="symbol-input100">
                            <i class="fa fa-envelope" aria-hidden="true"></i>
                        </span>
                    </div>
                    <div class="wrap-input100 validate-input" data-validate="Password is required">
                        <input class="input100" type="password" id="password" name="password" v-model="password" placeholder="Password">
                        <span class="focus-input100"></span>
                        <span class="symbol-input100">
                            <i class="fa fa-lock" aria-hidden="true"></i>
                        </span>
                    </div>
                    <div class="wrap-input100 validate-input" data-validate="Username is required">
                        <input class="input100" type="text" id="username" name="username" v-model="username" placeholder="Username">
                        <span class="focus-input100"></span>
                        <span class="symbol-input100">
                            <i class="fa fa-user" aria-hidden="true"></i>
                        </span>
                    </div>
                    <div class="container-register100-form-btn">
                        <button class="register100-form-btn" type="submit">
                            Register
                        </button>
                    </div>
                    <div class="text-center p-t-136">
                        <a class="txt2" href="#" @click="goToLogIn()">
                            Log In to your account
                            <i class="fa fa-long-arrow-right m-l-5" aria-hidden="true"></i>
                        </a>
                    </div>
                    <div class="message" :class="{ 'color-green': color }">{{ message }}</div>
                </form>
            </div>
        </div>
    </div>
</template>

<script>
import { url, globalRequestParameters } from "@/utils";

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
            const data = {
                email: this.email,
                username: this.username,
                password: this.password
            };

            const requestParameters = {
                ...globalRequestParameters,
                method: "POST",
                body: JSON.stringify(data)
            };

            try {
                const response = await fetch(url + "register", requestParameters);
                const res = await response.text();
                this.message = res;
                this.color = res === "Successful registration!";
            } catch (error) {
                console.error("Error registering user:", error);
                this.message = "An error occurred while registering user.";
            }
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
        goToLogIn() {
            this.$router.push({ name: "Login" });
        }
    }
};
</script>

<style scoped>
@font-face {
    font-family: 'Poppins-Regular';
    src: url('../../public/fonts/poppins/Poppins-Regular.ttf');
}

@font-face {
    font-family: 'Poppins-Bold';
    src: url('../../public/fonts/poppins/Poppins-Bold.ttf');
}

@font-face {
    font-family: 'Poppins-Medium';
    src: url('../../public/fonts/poppins/Poppins-Medium.ttf');
}

@font-face {
    font-family: 'Montserrat-Bold';
    src: url('../../public/fonts/montserrat/Montserrat-Bold.ttf');
}

.limiter {
    width: 100%;
    margin: 0 auto;
}

.container-register100 {
    width: 100%;
    min-height: 80vh;
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 15px;
    /*background: linear-gradient(-135deg, #c850c0, #4158d0);*/
}

.wrap-register100 {
    width: 960px;
    background: #fff;
    border-radius: 10px;
    overflow: hidden;
    display: flex;
    justify-content: space-between;
    padding: 177px 130px 33px 95px;
}

.register100-pic {
    width: 316px;
    display: flex;
    flex-direction: column;
    align-items: center;
}

.register100-pic img {
    max-width: 100%;
}

.quote {
    margin-top: 20px;
    font-family: 'Poppins-Regular';
    font-size: 16px;
    text-align: center;
    color: #666666;
    padding: 0 20px;
}

.register100-form {
    width: 290px;
}

.register100-form-title {
    font-family: 'Poppins-Bold';
    font-size: 24px;
    color: #333333;
    line-height: 1.2;
    text-align: center;
    width: 100%;
    display: block;
    padding-bottom: 54px;
}

.wrap-input100 {
    position: relative;
    width: 100%;
    z-index: 1;
    margin-bottom: 10px;
}

.input100 {
    font-family: 'Poppins-Medium';
    font-size: 15px;
    line-height: 1.5;
    color: #666666;
    display: block;
    width: 100%;
    background: #e6e6e6;
    height: 50px;
    border-radius: 25px;
    padding: 0 30px 0 20px;
}

.focus-input100 {
    display: block;
    position: absolute;
    border-radius: 25px;
    bottom: 0;
    left: 0;
    z-index: -1;
    width: 100%;
    height: 100%;
    box-shadow: 0px 0px 0px 0px;
    color: rgba(0,0,0, 0.8);
}

.input100:focus + .focus-input100 {
    animation: anim-shadow 0.5s ease-in-out forwards;
    cursor: pointer;
}

@keyframes anim-shadow {
    to {
        box-shadow: 0px 0px 70px 25px;
        opacity: 0;
    }
}

.symbol-input100 {
    font-size: 15px;
    display: flex;
    align-items: center;
    position: absolute;
    border-radius: 25px;
    bottom: 0;
    left: 0;
    width: 100%;
    height: 100%;
    padding-left: 35px;
    pointer-events: none;
    color: #666666;
    transition: all 0.4s;
}

.input100:focus + .focus-input100 + .symbol-input100 {
    color: #000000;
    padding-left: 28px;
}

.container-register100-form-btn {
    /*margin-top:4vh;*/
    width: 100%;
    display: flex;
    justify-content: center;
    padding-top: 20px;
}

.register100-form-btn {
    font-family: 'Montserrat-Bold';
    font-size: 15px;
    line-height: 1.5;
    color: #ffffff;
    text-transform: uppercase;
    width: 100%;
    height: 50px;
    border-radius: 25px;
    background: #000000;
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 0 25px;
    transition: all 0.4s;
    margin-bottom: 5vh;
}

.register100-form-btn:hover {
    background: #ffffff;
    color: #000000;
}

.text-center {
    text-align: center;
}
.txt2 {
    margin-top:5vh;
    font-family: 'Poppins-Regular';
    font-size: 13px;
    /*line-height: 1.5;*/
    color: #666666;
}
.message {
    font-family: 'Poppins', sans-serif;
    font-size: 16px;
    font-weight: 500;
    line-height: 26px;
    text-align: center;
    margin-top: 20px;
}

.color-green {
    color: lightgreen;
}

.color-red {
    color: indianred;
}
</style>
