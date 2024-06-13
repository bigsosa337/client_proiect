<template>
    <div class="home-page">
        <div class="side-panel">
            <div class="album-selection">
                <h2>Albums</h2>
                <Button
                    label="My Album"
                    @click="loadMyAlbum"
                    :class="['album-button', { 'selected-album': currentAlbum === 'my' }]"
                />
                <Button
                    v-for="(album, index) in sharedAlbums"
                    :key="index"
                    :label="`Shared Album - ${album.email}`"
                    @click="loadSharedAlbum(album.userId)"
                    :class="['album-button', { 'selected-album': currentAlbum === album.userId }]"
                />
            </div>
        </div>
        <div class="main-content">
            <div class="search-bar">
                <InputText
                    v-model="searchQuery"
                    @input="debouncedSearch"
                    placeholder="Search..."
                    class="input-element"
                />
                <MultiSelect
                    v-model="selectedTags"
                    :options="tags"
                    optionLabel="name"
                    class="input-element multiselect"
                    placeholder="Select tags"
                    @change="filterImagesByTag"
                />
                <Button
                    @click="clearSearch"
                    class="input-element clear-button"
                    label="Clear Search"
                />
            </div>

            <div v-if="faces.length" class="face-carousel">
                <Carousel
                    :value="faces"
                    :numVisible="5"
                    :numScroll="1"
                    class="carousel"
                    :circular="true"
                    :autoplayInterval="3000"
                >
                    <template #item="slotProps">
                        <div class="carousel-item">
                            <img
                                :src="'data:image/jpeg;base64,' + slotProps.data.thumbnail"
                                alt="Detected Face"
                                class="face-thumbnail"
                            />
                        </div>
                    </template>
                </Carousel>
            </div>
            <div class="row">
                <div class="col-3" v-for="(filename, index) in imageFilenames" :key="index">
                    <ImageItem :filename="filename" @clickImage="openImageDetails" />
                </div>
            </div>
        </div>
        <ImageDetails v-if="selectedImage" :visible="isImageDetailsVisible" @update:visible="updateVisible"  @close="closeImageDetails" :filename="selectedImage" />
    </div>
</template>


<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import debounce from 'lodash/debounce';
import InputText from 'primevue/inputtext';
import MultiSelect from 'primevue/multiselect';
import Button from 'primevue/button';
import ImageItem from './ImageItem.vue';
import ImageDetails from './ImageDetails.vue';
import { map } from 'lodash';
import Carousel from 'primevue/carousel';

const router = useRouter();

const searchQuery = ref('');
const imageFilenames = ref([]);
const tags = ref([]);
const selectedTags = ref([]);
const sharedAlbums = ref([]);
const currentAlbum = ref('my');
const faces = ref([]);
const placeholderFilenames = ref([]);

const isImageDetailsVisible = ref(false);
const selectedImage = ref(null);

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
        imageFilenames.value = data.images;
        placeholderFilenames.value = data.images;
    } catch (error) {
        console.error('Error fetching image filenames:', error);
    }
};

const fetchFaces = async () => {
    try {
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
    } catch (error) {
        console.error('Error fetching faces:', error);
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

const performSearch = async () => {
    try {
        const token = localStorage.getItem('token');
        if (searchQuery.value.length >= 3) {
            const endpoint = currentAlbum.value === 'my' ? 'searchImages' : `searchSharedImages/${currentAlbum.value}`;
            const response = await fetch(`http://localhost:3000/${endpoint}?query=${searchQuery.value}&option=title`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const data = await response.json();
            imageFilenames.value = data.images;
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
    fetchImageFilenames();
};

const debouncedSearch = debounce(performSearch, 300);

const loadMyAlbum = () => {
    currentAlbum.value = 'my';
    fetchImageFilenames();
};

const loadSharedAlbum = (userId) => {
    currentAlbum.value = userId;
    fetchImageFilenames();
};

const openImageDetails = (filename) => {
    selectedImage.value = filename;
    isImageDetailsVisible.value = true;
};

const closeImageDetails = () => {
    isImageDetailsVisible.value = false;
    selectedImage.value = null;
};
const updateVisible = (value) => {
    isImageDetailsVisible.value = value;
};

const closeModal = () => {
    this.$emit('close');
}

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
</script>

<style scoped>
.home-page {
    display: flex;
}

.side-panel {
    width: 280px; /* Adjust this width as needed */
    /*padding: 20px;*/
    /*background-color: #f8f9fa; !* Light background for side panel *!*/
}

.album-selection {
    display: flex;
    flex-direction: column;
    gap: 10px;
    border: 1px solid #ddd;
    background-color: #f8f9fa;
    padding: 10px;
    border-radius: 5px;
    margin-top: 20px;
}

.album-button {
    width: 100%;
    text-align: left;
    background-color: black;
    color: white;
    border: none;
    border-radius: 5px;
    transition: background-color 0.3s, color 0.3s;
}

.album-button:hover {
    background-color: #555;
    color: white;
    overflow: visible;
}

.selected-album {
    font-weight: bold;
    background-color: #ffffff;
    color: black;
    border: 1px solid black;
}

.main-content {
    flex: 1;
    padding: 20px;
    max-width: 990px;
}

.search-bar {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 10px;
    margin-bottom: 20px;
}

.input-element {
    flex: 1;

}

.clear-button {
    background-color: black;
    width: 40px;
    height: 47px;
    color: white;
    border: none;
    display: flex;
    justify-content: center;
    align-items: center;
}

.clear-button:hover {
    background-color: whitesmoke;
    color: black;
}

.face-carousel {
    margin-bottom: 20px;
    display: flex;
    justify-content: center;
}

.carousel {
    width: 60%;
}

.carousel-item {
    display: flex;
    justify-content: center;
    align-items: center;
}

.face-thumbnail {
    width: 50px;
    height: 50px;
    border-radius: 50%;
    object-fit: cover;
}

.row {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
}

.col-3 {
    flex: 1 1 calc(25% - 10px);
    box-sizing: border-box;
}
</style>
