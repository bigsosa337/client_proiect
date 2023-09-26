<template>
    <div class="image-details">
        <router-link to="/" class="back-button">Back to Gallery</router-link>
        <div class="image-container">
            <img :src="imageSrc" :alt="imageDetails.title" id="img" class="img"/>
        </div>
        <div class="image-info">
            <button @click="deleteImage">Delete Image</button>
            <button @click="duplicateImage">Duplicate Image</button>
            <button @click="editImage">Edit Details</button>
            <select v-model="selectedFilter" @change="testFilter">
                <option value="normal">Normal</option>
                <option value="evening">Darken</option>
                <option value="greyscale">Black and White</option>
                <option value="invert">Invert Colors</option>
            </select>
            <button @click="anotherUpload">Apply Filter</button>
            <p class="filename">File Name: {{ imageDetails.filename }}</p>
            <h2 id="title">Title: {{ imageDetails.title }}</h2>
            <p id="description">Description: {{ imageDetails.description }}</p>
            <p id="tags">Tags: {{ imageDetails.tags }}</p>
        </div>
        <div v-if="loading" class="loading-overlay">
            <div class="loader"></div>
        </div>
    </div>
</template>

<script lang="ts">

import * as fs from "fs";

export default {
    name: "ImageDetails",
    data() {
        return {
            imageDetails: {}, // Object to store image details
            imageSrc: "", // Image source data URL
            imageName: "", // Image filename
            currentImage: null, // Image file
            selectedFilter: "", // Selected filter
            originalImageSrc: "", // OriginalImage
            loading: false, // Image loading state

        };
    },
    methods: {
        async query(filename) {
            // const data = fs.readFileSync(filename);
            console.log(filename)
            const response = await fetch(
                "https://api-inference.huggingface.co/models/microsoft/resnet-50",
                {
                    headers: { Authorization: "Bearer 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" },
                    method: "POST",
                    body: filename,
                }
            );
            const result = await response.json();
            return result;
        },
        testFilter() {
            if (this.selectedFilter == "") {
                alert("Please select a filter")
                return
            }

            this.resetImage()
            let img = document.getElementById("img");
            if (document.getElementById("img") == null) {
                img = document.getElementById("canvas");
            }
            img.crossOrigin = "Anonymous";
            if (this.selectedFilter != "" && this.selectedFilter != "normal") {
                img.onload = () => {
                    this.query(img).then((response) => {
                        console.log(JSON.stringify(response));
                    });
                    pixelsJS.filterImg(img, this.selectedFilter, () => {


                        // Image filtering is complete
                        // Get a data URL of the canvas' content and set it as the new image source
                        this.imageSrc = canvas.toDataURL("image/png");
                    });
                };
            }
        },
        anotherUpload() {
            this.loading = true;
            if (this.selectedFilter == "" || this.selectedFilter == "normal") {
                this.loading = false;
                alert("Please select a filter")
                return
            }
            let imagesrc = this.imageSrc;
            fetch(imagesrc).then(response => response.blob())
                .then(blob => {
                    this.query(blob).then((response) => {
                        console.log(JSON.stringify(response));
                    });
                    let formData = new FormData();
                    formData.append("image", blob, "filtered.png");
                    formData.append("title", this.imageDetails.title);
                    formData.append("description", this.imageDetails.description);
                    formData.append("tags", this.imageDetails.tags);
                    formData.append("filter", this.selectedFilter)

                    fetch("http://localhost:3000/uploadFilteredImage", {
                        method: "POST",
                        body: formData,
                        headers: {
                            Authorization: `Bearer ${localStorage.getItem("token")}`,
                        },
                    })
                        .then(response => response.json()) // Convert response to JSON
                        .then(data => {
                            // Do something with 'data'
                            this.loading = false;
                            alert("Image uploaded successfully.");
                        })
                        .catch(error => {
                            // Handle any errors
                            console.error('Error:', error);
                        });
                })
            this.loading = false;
        },
        async fetchImageInfo(filename) {
            try {
                // debugger

                const response = await fetch(`http://localhost:3000/getImageInfo/${filename}`);

                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }

                const data = await response.json();

                // Update imageDetails with the response data
                this.imageDetails = data.imageInfo;
                this.imageDetails.tags = this.imageDetails.tags.join(", ");

                // Set the image source URL
                this.imageSrc = `http://localhost:3000/getImageData/${filename}`;
                this.originalImageSrc = this.imageSrc;
            } catch (error) {
                console.error("Error fetching image details:", error);
                // Handle errors, e.g., show an error message to the user
            }
        },
        async deleteImage() {
            try {
                this.loading = true;
                const filename = this.$route.params.filename;

                const response = await fetch(`http://localhost:3000/deleteImage/${filename}`, {
                    method: "DELETE",
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("token")}`,
                    },
                });

                if (!response.ok) {
                    if (response.status === 401) {
                        alert("You are not authorized to duplicate this image.");
                    } else {
                        alert("Something went wrong. Status code: " + response.status);
                    }
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
                this.loading = false;
                this.$router.push("/");
            } catch (error) {
                console.error("Error deleting image:", error);
            }
            this.loading = false;

        },
        async duplicateImage() {
            try {
                this.loading = true;
                const filename = this.$route.params.filename;

                const response = await fetch(`http://localhost:3000/duplicateImage/${filename}`, {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("token")}`,
                    },
                });

                if (!response.ok) {
                    if (response.status === 401) {
                        alert("You are not authorized to duplicate this image.");
                    } else {
                        alert("Something went wrong. Status code: " + response.status);
                    }
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
                alert("Image duplicated successfully.");
                this.loading = false;
                console.log("Image duplicated successfully.");
            } catch (error) {
                console.error("Error duplicating image:", error);
            }
            this.loading = false;

        },
        editImage() {
            if (localStorage.getItem('token') === null) {
                alert('You are not authorized to edit this image.');
            } else {
                this.$router.push(`/edit/${this.$route.params.filename}`);
            }
        },
        resetImage() {
            // Create a new img element
            let newImg = document.createElement('img');
            newImg.id = 'img';
            newImg.src = this.originalImageSrc;
            newImg.className = 'img';

            // Replace the canvas with the new img element
            let canvas = document.getElementsByTagName('canvas')[0];
            if (canvas) {
                canvas.parentNode.replaceChild(newImg, canvas);
            } else {
                // If the canvas doesn't exist, replace the old img element
                let oldImg = document.getElementById('img');
                oldImg.parentNode.replaceChild(newImg, oldImg);
            }

            // Update imageSrc to the original source
            this.imageSrc = this.originalImageSrc;
        }


    },

    created() {
        // Retrieve the filename from the route parameters
        const filename = this.$route.params.filename;
        this.fetchImageInfo(filename);


    },

    mounted() {
        this.currentImage = document.getElementById("img") as HTMLImageElement;
    }
};
</script>

<style scoped>
/* Add your component-specific styles here */
.image-details {
    display: flex;
    flex-direction: column;
    align-items: center;
    margin: 20px;
}

.filename {
    padding: 20px;
}

.back-button {
    margin-bottom: 10px;
    color: #007bff;
    cursor: pointer;
    text-decoration: none; /* Remove underlines */
    font-weight: bold; /* Make it bold */
    border: 1px solid #007bff;
    padding: 15px;
    border-radius: 6px;
}

.back-button:hover {
    background-color: #0056b3; /* Darker shade on hover */
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

/* Style the buttons */
button {
    margin-top: 10px;
    padding: 8px 16px;
    background-color: #007bff;
    color: #fff;
    border: none;
    cursor: pointer;
    font-size: 14px;
    border-radius: 4px;
    margin: 10px 5px 0px 5px;
}

button:hover {
    background-color: #0056b3; /* Darker shade on hover */
}

/* Style the select dropdown */
select {
    padding: 6px 10px;
    font-size: 14px;
    border-radius: 4px;
    margin: 10px 5px 0px 5px;
}

/* Style the image */
img {
    max-width: 100%;
    height: auto;
    box-shadow: 0 0 5px rgba(0, 0, 0, 0.2); /* Add a subtle shadow */
    margin: 20px 0 20px 0;

}

canvas {
    max-width: 100%;
    height: auto;
    box-shadow: 0 0 5px rgba(0, 0, 0, 0.2); /* Add a subtle shadow */
    margin: 20px 0 20px 0;
}

/* Style the description and tags */
p {
    margin: 5px 0;
    font-size: 14px;
}

/* Add styles for filter options */
option {
    font-size: 14px;
}

#title {
    margin: 20px;
    font-family: 'Poppins', sans-serif;
    font-weight: bold
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
    background: rgba(0, 0, 0, 0.5); /* Semi-transparent background */
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 999; /* Ensure it's on top of other content */
}

/* Loader styles (you can customize this) */
.loader {
    border: 4px solid #f3f3f3; /* Light grey border */
    border-top: 4px solid #3498db; /* Blue border */
    border-radius: 50%;
    width: 40px;
    height: 40px;
    animation: spin 2s linear infinite; /* Rotate animation */
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

