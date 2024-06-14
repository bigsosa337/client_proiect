<template>
    <div>
        <Menubar :model="items" class="header" v-if="isAuth">
            <template #start>
                <img src="/logo.png" alt="Logo" class="header-logo" />
            </template>
        </Menubar>
        <div class="content">
            <router-view></router-view>
        </div>
    </div>
</template>

<script>
import { mapState } from 'vuex';
import Menubar from 'primevue/menubar';

export default {
    components: {
        Menubar
    },
    computed: {
        ...mapState({
            isAuth: state => state.isAuthenticated
        }),
        items() {
            const route = this.$route;
            return [
                {
                    label: 'Home',
                    command: () => {
                        this.goHome();
                    },
                    visible: this.isAuth,
                    class: route.path === '/' ? 'active' : ''
                },
                {
                    label: 'Upload',
                    command: () => {
                        this.openUploadModal();
                    },
                    visible: this.isAuth,
                    class: route.path === '/upload' ? 'active' : ''
                },
                {
                    label: 'Profile',
                    command: () => {
                        this.goToProfile();
                    },
                    visible: this.isAuth,
                    class: route.path === '/profile' ? 'active' : ''
                },
                {
                    label: 'Register',
                    command: () => {
                        this.goToRegister();
                    },
                    visible: !this.isAuth,
                    class: route.path === '/register' ? 'active' : ''
                },
                {
                    label: 'Log In',
                    command: () => {
                        this.goToLogin();
                    },
                    visible: !this.isAuth,
                    class: route.path === '/login' ? 'active' : ''
                },
                {
                    label: 'Log Out',
                    command: () => {
                        this.logOut();
                    },
                    visible: this.isAuth,
                    class: 'logout-button'
                }
            ];
        }
    },
    methods: {
        goHome() {
            this.$router.push('/');
        },
        openUploadModal() {
            this.$router.push('/upload');
        },
        goToProfile() {
            this.$router.push('/profile');
        },
        goToRegister() {
            this.$router.push('/register');
        },
        goToLogin() {
            this.$router.push('/login');
        },
        logOut() {
            localStorage.removeItem('token');
            this.$router.push('/login');
            this.$store.dispatch("logout");
        },
        checkAuth() {
            if (!this.isAuth) {
                this.$router.push('/login');
            }
        }
    },
    mounted() {
        this.checkAuth();
    },
    created() {
        this.checkAuth();
    }
};
</script>

<style scoped>
.header {
    background-color: #fff;
    color: #000;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    padding: 0 20px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1px solid #e0e0e0;
    position: fixed;
    top: 15px;
    z-index: 1000;
    width: 1240px;
}

.header-logo {
    padding: 5px 20px 2px 10px;
    height: 5vh;
    margin-top: 3px;
}

.p-menubar {
    background-color: #fff;
    border: none;
    padding: 0;
}

.p-menubar .p-menubar-root-list {
    display: flex;
    align-items: center;
    height: 70px;
}

.p-menubar .p-menubar-root-list > .p-menubaritem > .p-menuitem-link {
    color: #333;
    font-family: 'Poppins', sans-serif;
    font-weight: 500;
    padding: 0 15px;
    height: 70px;
    display: flex;
    align-items: center;
    transition: border-bottom 0.3s;
}

.p-menubar .p-menubar-root-list > .p-menubaritem > .p-menuitem-link:focus {
    box-shadow: none;
}

.p-menubar .p-menubar-root-list > .p-menubaritem.logout-button > .p-menuitem-link {
    border: 1px solid #000;
    padding: 8px 15px;
    border-radius: 5px;
}

.p-menubar .p-menubar-root-list > .p-menubaritem.logout-button > .p-menuitem-link:hover {
    background-color: rgba(0, 0, 0, 0.1);
}

.p-menubar .p-menubar-root-list > .p-menubaritem > .p-menuitem-link .pi {
    margin-right: 0.5rem;
}

.content {
    margin-top: 70px; /* Adjusted to prevent overlapping with fixed header */
    border-radius: 5px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}
</style>
