<template>
    <div>
        <h1>{{ albumName }}'s Album</h1>
        <div class="row">
            <ImageItem
                v-for="(filename, index) in imageFilenames"
                :key="index"
                :filename="filename"
                @clickImage="goToImage"
            />
        </div>
    </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import ImageItem from './ImageItem.vue';

export default {
    components: {
        ImageItem
    },
    setup() {
        const route = useRoute();
        const router = useRouter();
        const imageFilenames = ref([]);
        const albumName = ref('');

        const fetchAlbumImages = async () => {
            const albumId = route.params.albumId;
            const token = localStorage.getItem('token');
            const response = await fetch(`http://localhost:3000/getAlbumImages/${albumId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            const data = await response.json();
            imageFilenames.value = data.images;
            albumName.value = data.name;
        };

        const goToImage = (filename) => {
            router.push(`/details/${filename}`);
        };

        onMounted(() => {
            fetchAlbumImages();
        });

        return {
            imageFilenames,
            albumName,
            goToImage
        };
    }
};
</script>

<style scoped>
.row {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
}

@media (max-width: 900px) {
    .row {
        flex-direction: column;
        align-items: center;
    }
}
</style>
