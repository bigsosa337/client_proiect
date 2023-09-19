import {createRouter, createWebHistory} from "vue-router";
import HomePage from "../components/HomePage.vue";
import UploadPicture from "../components/UploadPicture.vue";
import ImageDetails from "@/components/ImageDetails.vue";
import Register from "@/components/Register.vue";
import LogIn from "@/components/LogIn.vue";

const routes = [
    {
        path: "/",
        name: "Home",
        component: HomePage,
    },
    {
        path: "/upload",
        name: "Upload",
        component: UploadPicture,
    },
    {
        path: "/details/:filename",
        name: "Details",
        component: ImageDetails,
    },
    {
        path: "/register",
        name: "Register",
        component: Register,
    },
    {
        path: "/login",
        name: "Login",
        component: LogIn,
    }
];

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes,
});
router.beforeEach((to, from, next) => {
    if (to.name === 'Upload' && !localStorage.getItem('token')) next({name: 'Login'})
    else next()
})

router.beforeEach((to, from, next) => {
    if (to.name === 'Register' || to.name === 'Login' && localStorage.getItem('token')) next({name: 'Home'})
    else next()
})
export default router;
