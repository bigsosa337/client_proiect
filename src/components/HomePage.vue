<template>
    <div class="image-list">
        <div class="search-bar">
            <input type="text" v-model="searchQuery" @input="performSearch" placeholder="Search...">
            <select v-model="searchOption" @change="performSearch">
                <option value="title">Title</option>
                <option value="description">Description</option>
            </select>
            <label for="tagDropdown">Select Tags: <br> (CTRL for multiple)</label>
            <select id="tagDropdown" v-model="selectedTag" :multiple="true" @change="filterImagesByTag">
                <option v-for="(tagArray, tagIndex) in tags" :key="tagIndex" :value="tagArray.join(', ')">
                    {{ tagArray.join(', ') }}
                </option>
            </select>
            <button @click="clearSearch">Clear Search</button>
        </div>

        <div class="row">
            <div
                    v-for="(filename, index) in imageFilenames"
                    :key="index"
                    class="col-3 image-item"
                    id="imageItem"
            >
                <img :src="getImageUrl(filename)" alt="Image" @click="goToImage(filename)"/>
                <div class="imageDiv">
                    <p class="fileName" >{{ getImageTitle(filename) }}</p>
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
            tags: [],
            selectedTag: [],
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
        async fetchTags() {
            try {
                const response = await fetch("http://localhost:3000/getTags");
                if (response.ok) {
                    const data = await response.json();
                    this.tags = data.tags.map(tagString => tagString.split(',').map(tag => tag.trim()));
                } else {
                    console.error("Failed to fetch tags.");
                }
            } catch (error) {
                console.error("Error fetching tags:", error);
            }
        },
        async filterImagesByTag() {
            if (this.selectedTag === "") {
                // If no tag is selected, show all images
                await this.performSearch();
            } else {
                // Filter images by selected tag
                const response = await fetch("http://localhost:3000/getByTags?tags=" + this.selectedTag);
                if (response.ok) {
                    const data = await response.json();
                    this.imageFilenames = data.images;
                } else {
                    console.error("Failed to fetch images by tag.");
                }
            }
        },
        clearSearch() {
            this.searchQuery = "";
            this.selectedTag = [];
            this.performSearch();
        }
    },
    created() {
        // Fetch tags when component is created
        this.fetchTags();
    }
};
</script>

<style scoped>
/* Add your component-specific styles here */

.image-list {
    padding: 20px;
}
.fileName {
    hyphens: auto;
    max-width: 200px;
    overflow-wrap: break-word;

}

.search-bar {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 10px;
    margin-bottom: 20px;
}

input[type="text"] {
    padding: 8px;
    font-size: 16px;
    border: 1px solid #ccc;
    border-radius: 4px;
    flex: 1;
}

select {
    padding: 8px;
    font-size: 16px;
    border: 1px solid #ccc;
    border-radius: 4px;
}

button {
    padding: 8px 16px;
    background-color: #007BFF;
    color: #fff;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-family: 'Poppins', sans-serif;
}

button:hover {
    background-color: #0056b3;
}

.row {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
}

.col-3 {
    width: calc(25% - 10px);
    margin-bottom: 20px;
}

.image-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    /*border: 1px solid black;*/
    box-shadow: 0 3px 10px rgb(0 0 0 / 0.6);
    padding: 20px;
    border-radius: 4px;
    transition-duration: 0.2s;
}

.image-item:hover {
    /*background-color: #f1f1f1;*/
    color: whitesmoke;
    cursor: pointer;
    background-color: #282828FF;
    transition-duration: 0.2s;
}

.image-item img {
    max-height: 200px;
    aspect-ratio: 1/1;

}

.imageDiv {
    text-align: center;
    margin-top: 10px;
}

/* Media Query for smaller screens */
@media (max-width: 900px) {
    .col-3 {
        width: calc(50% - 10px);
        justify-content: space-between;

    }

}

/* Media Query for even smaller screens */
@media (max-width: 480px) {
    .col-3 {
        width: 100%;
    }
}

</style>
