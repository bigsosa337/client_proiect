import { createRouter, createWebHistory } from 'vue-router';
import HomePage from '../components/HomePage.vue';
import UploadPicture from '../components/UploadPicture.vue';
import ImageDetails from '@/components/ImageDetails.vue';
import Register from '@/components/Register.vue';
import LogIn from '@/components/LogIn.vue';
import EditDetails from '@/components/EditDetails.vue';
import ProfilePage from '@/components/ProfilePage.vue';

const routes = [
    {
        path: '/',
        name: 'Home',
        component: HomePage,
    },
    {
        path: '/upload',
        name: 'Upload',
        component: UploadPicture,
    },
    {
        path: '/details/:filename',
        name: 'Details',
        component: ImageDetails,
    },
    {
        path: '/register',
        name: 'Register',
        component: Register,
    },
    {
        path: '/login',
        name: 'Login',
        component: LogIn,
    },
    {
        path: '/edit/:filename',
        name: 'Edit',
        component: EditDetails,
    },
    {
        path: '/profile',
        name: 'Profile',
        component: ProfilePage,
    },
];

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes,
});

router.beforeEach((to, from, next) => {
    const isLoggedIn = !!localStorage.getItem('token');

    if (!isLoggedIn && to.name !== 'Login' && to.name !== 'Register') {
        next({ name: 'Login' });
    } else if (isLoggedIn && (to.name === 'Register' || to.name === 'Login')) {
        next({ name: 'Home' });
    } else {
        next();
    }
});

export default router;
