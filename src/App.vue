<template>
    <div>
        <header class="header">
            <h1 class="header-title">Image Gallery</h1>
            <div class="nav-buttons">
                <button @click="goHome()" class="nav-button">Home</button>
                <button @click="goToUpload()" v-if="isAuth" class="nav-button">Upload</button>
                <button @click="goToRegister()" v-if="!isAuth" class="nav-button">Register</button>
                <button @click="goToLogin()" v-if="!isAuth" class="nav-button">Log In</button>
                <button @click="logOut()" v-if="isAuth" class="nav-button">Log Out</button>
            </div>
        </header>
        <div class="content">
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
/* Style for the header */
.header {
    background-color: #007BFF;
    color: #fff;
    padding: 10px 0;
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-radius: 3px;
}

.header-title {
    margin: 0;
    font-size: 24px;
    padding-left: 20px;
    font-family: "Bauhaus 93";

}

.nav-buttons {
    display: flex;
    gap: 10px;
    padding-right: 20px;

}

.nav-button {
    background-color: #0056b3;
    color: #fff;
    padding: 5px 10px;
    border: none;
    border-radius: 5px;
    font-size: 16px;
    cursor: pointer;
    font-family: 'Poppins', sans-serif;
}

.nav-button:hover {
    background-color: #003f80;
}

/* Style for the content area */
.content {
    margin-top: 20px;
    padding: 20px;
    /*border: 1px solid #ccc;*/
    border-radius: 5px;
    /*background-color: #fff;*/
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

</style>
