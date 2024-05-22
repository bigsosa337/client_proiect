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

        <div class="row">
            <div class="col-3" v-for="(filename, index) in imageFilenames" :key="index">
                <ImageItem :filename="filename" @clickImage="goToImage" />
            </div>
        </div>
    </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import debounce from 'lodash/debounce';
import InputText from 'primevue/inputtext';
import MultiSelect from 'primevue/multiselect';
import Button from 'primevue/button';
import ImageItem from './ImageItem.vue';

export default {
    components: {
        InputText,
        MultiSelect,
        Button,
        ImageItem
    },
    setup() {
        const router = useRouter();
        const searchQuery = ref('');
        const imageFilenames = ref([]);
        const tags = ref([]);
        const selectedTags = ref([]);
        const sharedAlbums = ref([]);
        const currentAlbum = ref('my');

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
            } catch (error) {
                console.error('Error fetching image filenames:', error);
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
                        const uniqueFilenames = [...new Set(data.images)];
                        imageFilenames.value = uniqueFilenames;
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
            performSearch();
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

        onMounted(() => {
            fetchImageFilenames();
            fetchTags();

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

        return {
            searchQuery,
            imageFilenames,
            tags,
            selectedTags,
            goToImage,
            performSearch,
            filterImagesByTag,
            clearSearch,
            debouncedSearch,
            loadMyAlbum,
            loadSharedAlbum,
            sharedAlbums,
            currentAlbum
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
    height: auto;
    object-fit: cover;
    border-radius: 4px;
}
</style>
