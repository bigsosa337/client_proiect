<template>
    <div>
        <header>
            <h1>Image Gallery</h1>
            <button @click="goHome()">Home</button>
            <button @click="goToUpload()" v-if="isAuth" >Upload</button>
            <button @click="goToRegister()" v-if="!isAuth">Register</button>
            <button @click="goToLogin()" v-if="!isAuth">LogIn</button>
            <button @click="logOut()" v-if="isAuth">Log Out</button>
        </header>
        <div></div>
        <div class="body">
            <router-view></router-view>
        </div>
    </div>
</template>


<script>
export default {
    methods: {
        goHome() {
            this.$router.push('/');
        },
        goToUpload() {
            this.$router.push('/upload');
        },
        goToRegister() {
            this.$router.push('/register');
        },
        goToLogin() {
            this.$router.push('/login');
        },
        logOut() {
            localStorage.removeItem('token');
            this.$store.commit("SET_AUTH", false);
            this.$router.push('/');
        }
    },
    computed: {
        isAuth() {
            return this.$store.state.isAuthenticated;
        }
    }
}


</script>

<style scoped>
.body {
    margin-top: 100px;
}
</style>
