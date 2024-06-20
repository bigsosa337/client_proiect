<template>
    <div class="home-page" @reload-images="fetchImageFilenames">
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
                        <div class="carousel-item" @click="handleThumbnailClick(slotProps.data.thumbnail)">
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
            <div ref="loadMoreTrigger" v-if="!isSearching && hasMoreImages" class="load-more">
                <Button
                    label="Load More"
                    @click="loadMoreImages"
                    class="load-more-button"
                />
            </div>
        </div>
        <ImageDetails v-if="selectedImage"
                      :visible="isImageDetailsVisible"
                      @update:visible="updateVisible"
                      @close="closeImageDetails"
                      @imageDeleted="fetchImageFilenames"
                      :filename="selectedImage"
                      :currentAlbum="currentAlbum"/>
        <Button
            icon="pi pi-plus"
            class="floating-button"
            @click="openUploadModal"
        />
        <UploadModal :visible="isUploadModalVisible" @update:visible="updateUploadModalVisible" @image-uploaded="handleImageUploaded" />
    </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import debounce from 'lodash/debounce';
import InputText from 'primevue/inputtext';
import MultiSelect from 'primevue/multiselect';
import Button from 'primevue/button';
import ImageItem from './ImageItem.vue';
import ImageDetails from './ImageDetails.vue';
import UploadModal from './UploadPicture.vue';
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
const isUploadModalVisible = ref(false);

const isImageDetailsVisible = ref(false);
const selectedImage = ref(null);

const page = ref(1);
const limit = ref(10);
const isFetching = ref(false);
const hasMoreImages = ref(true);
const isSearching = ref(false);
const loadMoreTrigger = ref(null);

const fetchImageFilenames = async () => {
    if (isFetching.value) return;
    isFetching.value = true;
    try {
        const token = localStorage.getItem('token');
        const endpoint = currentAlbum.value === 'my' ? 'listImages' : `listSharedImages/${currentAlbum.value}`;
        const response = await fetch(`http://localhost:3000/${endpoint}?page=${page.value}&limit=${limit.value}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        const data = await response.json();
        if (data.images.length < limit.value) {
            hasMoreImages.value = false;
        }
        imageFilenames.value = [...imageFilenames.value, ...data.images];
    } catch (error) {
        console.error('Error fetching image filenames:', error);
    } finally {
        isFetching.value = false;
    }
};

const loadMoreImages = () => {
    page.value++;
    fetchImageFilenames();
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
            console.log('face', faces)
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
    isSearching.value = true;
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
            page.value = 1;
            imageFilenames.value = [];
            await fetchImageFilenames();
        }
    } catch (error) {
        console.error('Error performing search:', error);
    } finally {
        isSearching.value = false;
    }
};

const filterImagesByTag = async () => {
    isSearching.value = true;
    try {
        const token = localStorage.getItem('token');
        if (selectedTags.value.length === 0) {
            page.value = 1;
            imageFilenames.value = [];
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
    } finally {
        isSearching.value = false;
    }
};

const clearSearch = () => {
    searchQuery.value = '';
    selectedTags.value = [];
    page.value = 1;
    imageFilenames.value = [];
    fetchImageFilenames();
};

const debouncedSearch = debounce(performSearch, 300);

const loadMyAlbum = () => {
    currentAlbum.value = 'my';
    page.value = 1;
    imageFilenames.value = [];
    hasMoreImages.value = true;
    fetchImageFilenames();
};

const loadSharedAlbum = (userId) => {
    currentAlbum.value = userId;
    page.value = 1;
    imageFilenames.value = [];
    hasMoreImages.value = true;
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

const openUploadModal = () => {
    isUploadModalVisible.value = true;
};

const updateUploadModalVisible = (value) => {
    isUploadModalVisible.value = value;
};

const handleImageUploaded = () => {
    imageFilenames.value = [];
    page.value = 1;
    fetchImageFilenames();
};

const handleThumbnailClick = async (face) => {
    try {
        console.log('Searching images for face:', face);
        const token = localStorage.getItem('token');
        const response = await fetch('http://localhost:3000/searchByFace', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ face })
        });

        if (response.ok) {
            const data = await response.json();
            console.log('Received image filenames:', data.images);
            imageFilenames.value = data.images;
        } else {
            console.error('Failed to search images by face:', response.status);
            imageFilenames.value = [];
        }
    } catch (error) {
        console.error('Error searching images by face:', error);
        imageFilenames.value = [];
    }
};

const observeElement = (element) => {
    const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting && hasMoreImages.value && !isFetching.value && !isSearching.value) {
                loadMoreImages();
            }
        });
    }, {
        root: null,
        rootMargin: '0px',
        threshold: 1.0
    });
    observer.observe(element);
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

    if (loadMoreTrigger.value) {
        observeElement(loadMoreTrigger.value);
    }
});

watch(currentAlbum, async () => {
    imageFilenames.value = [];
    page.value = 1;
    hasMoreImages.value = true;
    await fetchImageFilenames();
});
</script>

<style scoped>
.home-page {
    display: flex;
}

.side-panel {
    width: 280px;
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

.load-more {
    display: flex;
    justify-content: center;
    margin-top: 20px;
}

.load-more-button {
    background-color: black;
    color: white;
    border: none;
    border-radius: 5px;
    padding: 10px 20px;
    transition: background-color 0.3s, color 0.3s;
}

.load-more-button:hover {
    background-color: #555;
    color: white;
}

.floating-button {
    position: fixed;
    bottom: 20px;
    right: 20px;
    width: 50px;
    height: 50px;
    border-radius: 50%;
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: #007bff;
    color: white;
    font-size: 24px;
    z-index: 1000;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    transition: background-color 0.3s, color 0.3s, transform 0.3s;
}

.floating-button:hover {
    background-color: #0056b3;
    color: white;
    transform: rotate(180deg);
}
</style>
