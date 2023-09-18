<template>
    <div class="image-list">
        <div class="search-bar">
            <input type="text" v-model="searchQuery" @input="performSearch" placeholder="Search...">
            <select v-model="searchOption" @change="performSearch">
                <option value="title">Title</option>
                <option value="description">Description</option>
            </select>
        </div>
        <div class="row">
            <div
                v-for="(filename, index) in imageFilenames"
                :key="index"
                class="col-3 image-item"
            >
                <img :src="getImageUrl(filename)" alt="Image" @click="goToImage(filename)" />
                <div class="imageDiv">
                    <p>{{ getImageTitle(filename) }}</p>
                    <!-- <p>{{ getImageDescription(filename) }}</p> -->
                    <!-- <p>Tags: {{ getImageTags(filename) }}</p> -->
                </div>
            </div>
        </div>
    </div>
</template>

<script>
export default {
    data() {
        return {
            placeholder: [],
            imageFilenames: [],
            searchQuery: "",
            searchOption: "title",
        };
    },
    mounted() {
        this.fetchImageFilenames();
    },
    methods: {
        async fetchImageFilenames() {
            try {
                // Make an HTTP request to your server to fetch the list of image filenames
                const response = await fetch('http://localhost:3000/listImages');
                const data = await response.json();

                // Update data property with the list of filenames
                this.imageFilenames = data.images;
            } catch (error) {
                console.error('Error fetching image filenames:', error);
            }
        },
        getImageUrl(filename) {
            return `http://localhost:3000/getImageData/${filename}`;
        },
        getImageTitle(filename) {
            return `${filename}`;
        },
        goToImage(filename) {
            this.$router.push(`/details/${filename}`);
        },
        async performSearch() {
            try {
                if (this.searchQuery.length >= 3) {
                    const response = await fetch(`http://localhost:3000/searchImages?query=${this.searchQuery}&option=${this.searchOption}`);
                    const data = await response.json();

                    this.imageFilenames = data.images;
                } else {
                    await this.fetchImageFilenames();
                }
            } catch (error) {
                console.error('Error performing search:', error);
            }
        },
        getImageDescription(filename) {
            return `Description for ${filename}`;
        },
        goToImagePage(filename) {
            this.$router.push(`/details/${filename}`);
        },
        getImageTags(filename) {
            return 'Tag1, Tag2, Tag3'; // Example tags
        },
    },
};
</script>

<style scoped>
/* Add your component-specific styles here */

.row {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between; /* Adjust as needed */
}

.col-3 {
    width: calc(25% - 10px); /* Adjust as needed */
    margin-bottom: 20px;
}

.image-item {
    display: flex;
    flex-direction: column;
    align-items: center;
}

.image-item img {
    max-height: 200px;
    aspect-ratio: 1/1;
}
</style>
