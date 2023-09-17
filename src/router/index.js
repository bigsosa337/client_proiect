import { createRouter, createWebHistory } from "vue-router";
import HomePage from "../components/HomePage.vue";
import UploadPicture from "../components/UploadPicture.vue";
import ImageDetails from "@/components/ImageDetails.vue";

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
    }
];

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes,
});

export default router;
