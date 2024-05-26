<template>
    <div class="image-details">
        <router-link to="/" class="back-button">Back to Gallery</router-link>
        <div class="image-container">
            <img :src="imageSrc" :alt="imageDetails.title" class="img"/>
        </div>
        <div class="image-info">
            <button @click="deleteImage">Delete Image</button>
            <button @click="duplicateImage">Duplicate Image</button>
            <button @click="editImage">Edit Details</button>
            <button @click="downloadImage">
                <span> <i class="pi pi-arrow-circle-down" /></span>
            </button>
            <p class="filename">File Name: {{ imageDetails.filename }}</p>
            <h2>Title: {{ imageDetails.title }}</h2>
            <p>Description: {{ imageDetails.description }}</p>
            <p>Tags: {{ imageDetails.tags }}</p>
        </div>
        <div v-if="loading" class="loading-overlay">
            <div class="loader"></div>
        </div>
    </div>
</template>

<script>
export default {
    name: "ImageDetails",
    data() {
        return {
            imageDetails: {},
            imageSrc: "",
            selectedFilter: "normal",
            loading: false
        };
    },
    methods: {
        async fetchImageInfo(filename) {
            try {
                const token = localStorage.getItem('token');
                const response = await fetch(`http://localhost:3000/getImageInfo/${filename}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
                const data = await response.json();
                this.imageDetails = data;
                this.imageSrc = await this.getImageData(filename);
            } catch (error) {
                console.error("Error fetching image details:", error);
            }
        },
        async getImageData(filename) {
            try {
                const token = localStorage.getItem('token');
                const response = await fetch(`http://localhost:3000/getImageData/${filename}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
                return URL.createObjectURL(await response.blob());
            } catch (error) {
                console.error("Error fetching image data:", error);
            }
        },
        async deleteImage() {
            try {
                const filename = this.$route.params.filename;
                const response = await fetch(`http://localhost:3000/deleteImage/${filename}`, {
                    method: "DELETE",
                    headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
                });
                if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
                this.$router.push("/");
            } catch (error) {
                console.error("Error deleting image:", error);
            }
        },
        async duplicateImage() {
            try {
                const filename = this.$route.params.filename;
                const response = await fetch(`http://localhost:3000/duplicateImage/${filename}`, {
                    method: "POST",
                    headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
                });
                if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
                alert("Image duplicated successfully.");
            } catch (error) {
                console.error("Error duplicating image:", error);
            }
        },
        editImage() {
            if (!localStorage.getItem('token')) {
                alert('You are not authorized to edit this image.');
            } else {
                this.$router.push(`/edit/${this.$route.params.filename}`);
            }
        },
        downloadImage() {

            const link = document.createElement('a');
            link.href = this.imageSrc;
            link.download = this.imageDetails.filename;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        },
        applyFilter() {
            if (!this.selectedFilter || this.selectedFilter === "normal") {
                alert("Please select a filter");
                return;
            }
        }
    },
    created() {
        const filename = this.$route.params.filename;
        this.fetchImageInfo(filename);
    }
};
</script>

<style scoped>
.image-details {
    display: flex;
    flex-direction: column;
    align-items: center;
    margin: 20px;
    background-color: whitesmoke;
    padding: 20px;
    border-radius: 6px;
}

.filename {
    padding: 20px;
}

.back-button {
    margin-bottom: 10px;
    color: #000000;
    cursor: pointer;
    text-decoration: none;
    font-weight: bold;
    border: 1px solid #000000;
    padding: 15px;
    border-radius: 6px;
}

.back-button:hover {
    background-color: #000000;
    color: #fff;
}

.image-container {
    max-width: 600px;
    padding: 20px;
}

.image-info {
    margin-left: 20px;
    float: right;
}

.image-info h2 {
    font-size: 24px;
    margin-bottom: 10px;
}

button {
    padding: 8px 16px;
    background-color: #000000;
    color: #fff;
    cursor: pointer;
    font-size: 14px;
    border-radius: 4px;
    margin: 10px 5px 0px 5px;
    border: 1px solid #000000;
}

button:hover {
    background-color: #ffffff;
    color: #000000;
    border: 1px solid #000000;
}

select {
    padding: 6px 10px;
    font-size: 14px;
    border-radius: 4px;
    margin: 10px 5px 0px 5px;
}

img {
    max-width: 100%;
    height: auto;
    box-shadow: 0 0 5px rgba(0, 0, 0, 0.2);
    margin: 20px 0;
}

canvas {
    max-width: 100%;
    height: auto;
    box-shadow: 0 0 5px rgba(0, 0, 0, 0.2);
    margin: 20px 0;
}

p {
    margin: 5px 0;
    font-size: 14px;
}

option {
    font-size: 14px;
}

#title {
    margin: 20px;
    font-family: 'Poppins', sans-serif;
    font-weight: bold;
}

#description {
    margin: 20px;
    font-size: 16px;
}

#tags {
    margin: 20px;
}

.img {
    max-width: 500px;
}

.loading-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 999;
}

.loader {
    border: 4px solid #f3f3f3;
    border-top: 4px solid #3498db;
    border-radius: 50%;
    width: 40px;
    height: 40px;
    animation: spin 2s linear infinite;
}

@keyframes spin {
    0% {
        transform: rotate(0deg);
    }
    100% {
        transform: rotate(360deg);
    }
}
</style>
