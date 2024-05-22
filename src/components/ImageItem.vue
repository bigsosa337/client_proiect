<template>
    <Card class="image-card" @click="handleClick">
        <template #header>
            <img :src="imageSrc" alt="Image" class="image" v-if="imageSrc" />
            <div v-else class="placeholder">Loading...</div>
        </template>
    </Card>
</template>

<script>
import Card from 'primevue/card';
import { ref, watch, onMounted, onUnmounted } from 'vue';

export default {
    components: {
        Card
    },
    props: {
        filename: {
            type: String,
            required: true
        }
    },
    setup(props, { emit }) {
        const imageSrc = ref(null);

        const fetchImage = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await fetch(`http://localhost:3000/getImageData/${props.filename}`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }

                const blob = await response.blob();
                imageSrc.value = URL.createObjectURL(blob);
                console.log('Image fetched for filename:', props.filename);
            } catch (error) {
                console.error('Error fetching image:', error);
            }
        };

        watch(() => props.filename, () => {
            imageSrc.value = null; // Reset image source
            fetchImage(); // Fetch new image
        });

        onMounted(() => {
            fetchImage();
        });

        onUnmounted(() => {
            if (imageSrc.value) {
                URL.revokeObjectURL(imageSrc.value);
            }
        });

        const handleClick = () => {
            emit('clickImage', props.filename);
        };

        return {
            imageSrc,
            handleClick
        };
    }
};
</script>

<style scoped>
.image-card {
    /* Set card width as desired */
    width: 200px; /* Adjust according to your needs */
    aspect-ratio: 1; /* Maintain aspect ratio */
    display: flex;
    flex-direction: column;
    overflow: hidden;
}

.placeholder {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100%; /* Match card height */
    width: 100%;
    background-color: #f0f0f0;
    color: #ccc;
    font-size: 14px;
}

.image-container {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
}

.image {
    /* Maintain aspect ratio and zoom to fit */
    object-fit:fill;
    /*max-width: 200%;*/
    /*max-height: 200%;*/
}
</style>
