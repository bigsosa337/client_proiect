<template>
    <Card class="image-card" @click="handleClick">
        <template #header>
            <img :src="imageSrc" alt="Image" class="image" v-if="imageSrc" />
        </template>
    </Card>
</template>

<script>
import Card from 'primevue/card';
import { ref, onMounted } from 'vue';

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
    setup(props) {
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
            } catch (error) {
                console.error('Error fetching image:', error);
            }
        };

        onMounted(() => {
            fetchImage();
        });

        const handleClick = () => {
            this.$emit('clickImage', props.filename);
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
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 0;
    cursor: pointer;
    border: none;
    box-shadow: none;
    transition: background-color 0.2s;
}

.image-card:hover {
    background-color: #282828;
    color: whitesmoke;
}

.image {
    width: 100%;
    height: auto;
    object-fit: cover;
    border-radius: 4px;
}
</style>
