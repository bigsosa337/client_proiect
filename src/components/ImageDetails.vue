<template>
    <div class="image-details">
        <router-link to="/" class="back-button">Back to Gallery</router-link>
        <div class="image-container">
            <img :src="imageSrc" :alt="imageDetails.title" />
        </div>
        <div class="image-info">
            <h2>Title: {{ imageDetails.title }}</h2>
            <p>Description: {{ imageDetails.description }}</p>
            <p>Tags: {{ imageDetails.tags.join(", ") }}</p>
            <button @click="deleteImage">Delete Image</button>
            <button @click="duplicateImage">Duplicate Image</button>
            <button @click="editImage">Edit Details</button>
        </div>
    </div>
</template>

<script>
export default {
    name: "ImageDetails",
    data() {
        return {
            imageDetails: {}, // Object to store image details
            imageSrc: "", // Image source data URL
            imageName: "", // Image filename
        };
    },
    methods: {
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
                console.log(data.imageInfo)

                // Set the image source URL
                this.imageSrc = `http://localhost:3000/getImageData/${filename}`;
            } catch (error) {
                console.error("Error fetching image details:", error);
                // Handle errors, e.g., show an error message to the user
            }
        },
        async deleteImage() {
            try {
                const filename = this.$route.params.filename;

                const response = await fetch(`http://localhost:3000/deleteImage/${filename}`, {
                    method: "DELETE",
                });

                if (!response.ok) {
                    if (response.status === 401) {
                        alert("You are not authorized to duplicate this image.");
                    } else {
                        alert("Something went wrong. Status code: " + response.status);
                    }
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }

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
                console.log("Image duplicated successfully.");
            } catch (error) {

                console.error("Error duplicating image:", error);
            }
        },
        editImage() {
            this.$router.push(`/edit/${this.$route.params.filename}`);
        }
    },

    created() {
        // Retrieve the filename from the route parameters
        const filename = this.$route.params.filename;
        console.log('1111111111111111111111111111111111')
        // // Fetch image information
        this.fetchImageInfo(filename);
    },
};
</script>

<style scoped>
/* Add your component-specific styles here */
.image-details {
    display: flex;
    flex-direction: column; /* Adjust layout */
    align-items: center;
    margin: 20px;
}

.back-button {
    margin-bottom: 10px;
    color: #007bff; /* Adjust the link color */
    cursor: pointer;
    text-decoration: underline;
}

.image-container {
    max-width: 70%;
}

.image-info {
    margin-left: 20px;
    float: right;
}

.image-info h2 {
    font-size: 24px;
    margin-bottom: 10px;
}
</style>
