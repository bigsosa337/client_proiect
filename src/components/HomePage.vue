<template>
    <div class="image-list">
        <div class="album-selection">
            <Button label="My Album" @click="loadMyAlbum" :class="['album-button', { 'selected-album': currentAlbum === 'my' }]" />
            <Button
                v-for="(album, index) in sharedAlbums"
                :key="index"
                :label="`Shared Album - ${album.email}`"
                @click="loadSharedAlbum(album.userId)"
                :class="['album-button', { 'selected-album': currentAlbum === album.userId }]"
            />
        </div>
        <div class="search-bar">
            <InputText v-model="searchQuery" @input="debouncedSearch" placeholder="Search..." class="input-element" />
            <MultiSelect
                v-model="selectedTags"
                :options="tags"
                optionLabel="name"
                class="input-element multiselect"
                placeholder="Select tags"
                @change="filterImagesByTag"
            />
            <Button label="Clear Search" icon="pi pi-times" iconPos="left" @click="clearSearch" class="input-element clear-button" />
        </div>

        <div v-if="faces.length" class="face-carousel">
            <Carousel :value="faces" :numVisible="3" :numScroll="1">
                <template #item="slotProps">
                    <div class="carousel-item">
                        <img :src="'data:image/jpeg;base64,' + slotProps.data.thumbnail" alt="Detected Face" class="face-thumbnail" />
                    </div>
                </template>
            </Carousel>
        </div>
        <div class="row">
            <div class="col-3" v-for="(filename, index) in imageFilenames" :key="index">
                <ImageItem :filename="filename" @clickImage="goToImage" />
            </div>
        </div>
    </div>
</template>

<script>
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import debounce from 'lodash/debounce';
import InputText from 'primevue/inputtext';
import MultiSelect from 'primevue/multiselect';
import Button from 'primevue/button';
import ImageItem from './ImageItem.vue';
import {map} from "lodash";
import Carousel from 'primevue/carousel';

export default {
    components: {
        InputText,
        MultiSelect,
        Button,
        ImageItem,
        Carousel
    },
    setup() {
        const router = useRouter();
        const searchQuery = ref('');
        const imageFilenames = ref([]);
        const tags = ref([]);
        const selectedTags = ref([]);
        const sharedAlbums = ref([]);
        const currentAlbum = ref('my');
        const faces = ref([]);
        const placeholderFilenames = ref([]);
        const facelist = ref([]);

        const printFaces = () => {
            console.log(faces, 'faces');
            console.log(faces.value, 'faces.value');
            console.log(faces.value.length, 'faces.value.length');
            console.log(faces.length, 'faces.length');
            // console.log(faces._rawValue.length , 'faces._rawValue.length');
            // console.log(faces._rawValue , 'faces._rawValue');
            // console.log(JSON.stringify(faces), 'faces');
        };
        const fetchImageFilenames = async () => {
            try {
                const token = localStorage.getItem('token');
                const endpoint = currentAlbum.value === 'my' ? 'listImages' : `listSharedImages/${currentAlbum.value}`;
                const response = await fetch(`http://localhost:3000/${endpoint}`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                const data = await response.json();
                imageFilenames.value.push(...data.images);
                placeholderFilenames.value.push(...data.images);
            } catch (error) {
                console.error('Error fetching image filenames:', error);
            }
        };
        const fetchFaces = async () => {
            const response = await fetch(`http://localhost:3000/getFaces`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            if (response.ok) {
                const data = await response.json();
                faces.value = map(data.faces, face => ({
                    thumbnail: face.thumbnail,
                    filename: face.filename
                }));
            } else {
                console.error('Failed to fetch faces.');
            }
        };
        const fetchTags = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await fetch('http://localhost:3000/getTags', {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                if (response.ok) {
                    const data = await response.json();
                    tags.value = data.tags.map(tagString => ({
                        name: tagString.split(',').map(tag => tag.trim()).join(', ')
                    }));
                } else {
                    console.error('Failed to fetch tags.');
                }
            } catch (error) {
                console.error('Error fetching tags:', error);
            }
        };

        const goToImage = (filename) => {
            router.push(`/details/${filename}`);
        };

        const performSearch = async () => {
            try {
                console.log(imageFilenames.value);
                const token = localStorage.getItem('token');
                if (searchQuery.value.length >= 3) {
                    const endpoint = currentAlbum.value === 'my' ? 'searchImages' : `searchSharedImages/${currentAlbum.value}`;
                    const response = await fetch(`http://localhost:3000/${endpoint}?query=${searchQuery.value}&option=title`, {
                        headers: {
                            'Authorization': `Bearer ${token}`
                        }
                    });
                    const data = await response.json();
                    imageFilenames.value = []; // Clear existing filenames
                    imageFilenames.value.push(...data.images);
                } else {
                    await fetchImageFilenames();
                }
            } catch (error) {
                console.error('Error performing search:', error);
            }
        };

        const filterImagesByTag = async () => {
            try {
                const token = localStorage.getItem('token');
                if (selectedTags.value.length === 0) {
                    await fetchImageFilenames();
                } else {
                    const tagsString = selectedTags.value.map(tag => tag.name).join(',');
                    const endpoint = currentAlbum.value === 'my' ? 'getByTags' : `getSharedByTags/${currentAlbum.value}`;
                    const response = await fetch(`http://localhost:3000/${endpoint}?tags=${tagsString}`, {
                        headers: {
                            'Authorization': `Bearer ${token}`
                        }
                    });
                    if (response.ok) {
                        const data = await response.json();
                        imageFilenames.value = [...new Set(data.images)];
                    } else {
                        console.error('Failed to fetch images by tag.');
                    }
                }
            } catch (error) {
                console.error('Error fetching images by tag:', error);
            }
        };

        const clearSearch = () => {
            searchQuery.value = '';
            selectedTags.value = [];
            imageFilenames.value = [];
            fetchImageFilenames();
        };

        const debouncedSearch = debounce(performSearch, 300);

        const loadMyAlbum = () => {
            currentAlbum.value = 'my';
            imageFilenames.value = []; // Clear existing images
            fetchImageFilenames();
        };

        const loadSharedAlbum = (userId) => {
            currentAlbum.value = userId;
            imageFilenames.value = []; // Clear existing images
            fetchImageFilenames();
        };

        const getFaceThumbnail = (face) => {
            // Assuming you have a way to generate thumbnails for the detected faces
            return `data:image/jpeg;base64,${face.thumbnail}`;
        };

        const searchByFace = async (face) => {
            try {
                const token = localStorage.getItem('token');
                const response = await fetch(`http://localhost:3000/searchByFace`, {
                    method: 'POST',
                    body: JSON.stringify({ descriptor: face.descriptor }),
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });
                if (response.ok) {
                    const data = await response.json();
                    console.log(data, 'This is the data from the search by face');
                    imageFilenames.value = data.images;
                } else {
                    console.error('Failed to search by face.');
                }
            } catch (error) {
                console.error('Error searching by face:', error);
            }
        };

        onMounted(() => {
            fetchImageFilenames();
            fetchTags();
            fetchFaces();

            const fetchSharedAlbums = async () => {
                try {
                    const token = localStorage.getItem('token');
                    const response = await fetch('http://localhost:3000/getSharedAlbums', {
                        headers: {
                            'Authorization': `Bearer ${token}`
                        }
                    });
                    if (response.ok) {
                        const data = await response.json();
                        sharedAlbums.value = data.sharedAlbums;
                    } else {
                        console.error('Failed to fetch shared albums.');
                    }
                } catch (error) {
                    console.error('Error fetching shared albums:', error);
                }
            };

            fetchSharedAlbums();
        });

        const prevSlide = () => {
            const carouselSlide = document.querySelector('.carousel-slide');
            carouselSlide.scrollBy({
                left: -carouselSlide.clientWidth,
                behavior: 'smooth'
            });
        };

        const nextSlide = () => {
            const carouselSlide = document.querySelector('.carousel-slide');
            carouselSlide.scrollBy({
                left: carouselSlide.clientWidth,
                behavior: 'smooth'
            });
        };

        return {
            searchQuery,
            imageFilenames,
            tags,
            prevSlide,
            nextSlide,
            selectedTags,
            goToImage,
            performSearch,
            filterImagesByTag,
            clearSearch,
            debouncedSearch,
            loadMyAlbum,
            loadSharedAlbum,
            sharedAlbums,
            currentAlbum,
            faces,
            facelist,
            printFaces,
            getFaceThumbnail,
            searchByFace
        };
    }
};
</script>

<style scoped>
.image-list {
    padding: 20px;
}

.fileName {
    hyphens: auto;
    max-width: 200px;
    overflow-wrap: break-word;
}

.album-selection {
    display: flex;
    justify-content: center;
    gap: 10px;
    margin-bottom: 20px;
}

.album-button {
    color: orange;
    border: 2px solid orange;
    background-color: transparent;
}

.selected-album {
    background-color: orange;
    color: white;
}

.search-bar {
    display: flex;
    flex-wrap: nowrap;
    align-items: center;
    gap: 10px;
    margin-bottom: 20px;
}

.input-element {
    height: 40px;
    display: flex;
    align-items: center;
}

.p-multiselect, .p-inputtext, .p-button {
    height: 40px;
}

.multiselect {
    flex: 2;
}

.button {
    flex: 0 0 auto;
}

.clear-button {
    color: orange;
    border: 2px solid orange;
    background-color: rgb(0,0,0,0);
}

.p-button-icon-left .p-button-label {
    margin-left: 0.5rem; /* Adjust the space between the icon and the label */
}

.row {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
}

.col-3 {
    flex: 1 1 calc(25% - 10px);
    display: flex;
    justify-content: center;
}

@media (max-width: 900px) {
    .col-3 {
        flex: 1 1 calc(50% - 10px);
    }
}

@media (max-width: 600px) {
    .col-3 {
        flex: 1 1 calc(100% - 10px);
    }
}

.image-card {
    width: 100%;
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
    background-color: #f0f0f0;
    color: #333;
}

.image {
    width: 100%;
    height: 0;
    padding-bottom: 100%; /* This makes the image a square */
    object-fit: cover;
    border-radius: 4px;
    transition: transform 0.2s;
}

.image:hover {
    transform: scale(1.05); /* Slight zoom on hover */
}

.face-carousel {
    margin-bottom: 20px;
}

.face-thumbnail {
    width: 50px;
    height: 50px;
    object-fit: cover;
    border-radius: 50%;
    cursor: pointer;
    transition: transform 0.2s;
}

.face-thumbnail:hover {
    transform: scale(1.1);
}
.carousel-button {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    background-color: rgba(0, 0, 0, 0.5);
    color: white;
    border: none;
    padding: 10px;
    cursor: pointer;
}

.carousel-button.prev {
    left: 10px;
}

.carousel-button.next {
    right: 10px;
}
</style>
