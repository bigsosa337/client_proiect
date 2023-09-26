<template>
    <div class="form">
        <h1>Edit Image Image</h1>
        <form @submit.prevent="submitForm">
            <div class="image-container">
                <img :src="imageSrc" :alt="title" />
            </div>
            <div class="field">
                <label for="title">Enter a title for the image:</label>
                <input type="text" id="title" name="title" v-model="title"/>
            </div>
            <div class="field">
                <label for="description">Enter a description for the image:</label>
                <textarea id="description" name="description" v-model="description"></textarea>
            </div>
            <div class="field">
                <label for="tags">Enter some tags for the image (separated by commas):</label>
                <input type="text" id="tags" name="tags" v-model="tags"/>
            </div>
            <div class="field">
                <button type="submit">Edit</button>
            </div>
        </form>
    </div>
</template>

<script>
import imageDetails from "@/components/ImageDetails.vue";

export default {
    name: "EditDetails",
    computed: {

    },
    data() {
        return {
            imageSrc: null,
            title: "",
            description: "",
            tags: "",
            imageDetails: {},
            filename: '',
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
                this.title = data.imageInfo.title;
                this.description = data.imageInfo.description;
                this.tags = data.imageInfo.tags.join(", ");

                // Set the image source URL
                this.imageSrc = `http://localhost:3000/getImageData/${this.filename}`;
            } catch (error) {
                console.error("Error fetching image details:", error);
                // Handle errors, e.g., show an error message to the user
            }
        },
        async submitForm() {
            console.log("submitting form");
            console.log(this.title);
            console.log(this.description);
            console.log(this.tags);
            let data = {
                title: this.title,
                description: this.description,
                tags: this.tags.split(","),
            };
            console.log(data, '------------------------------')
            const response = await fetch(`http://localhost:3000/updateImage/${this.filename}`, {
                method: "PATCH",
                body: JSON.stringify(data),
                headers: {
                    "Content-Type": "application/json", // Set the content type to JSON
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
            });
            this.$router.push("/");
        }
    },
    created() {
        this.filename = this.$route.params.filename;
        this.fetchImageInfo(this.filename);
    },
}
</script>

<style scoped>
.form {
    text-align: center;
    padding: 20px;
}

h1 {
    font-family: 'Poppins', sans-serif;
    font-size: 28px;
    margin-bottom: 20px;
    color: #33; /* Choose an appropriate color */
}

.field {
    margin-bottom: 20px;
}

label {
    display: block;
    font-size: 16px;
    font-weight: 500;
    color: #666; /* Choose an appropriate color */
}

input[type="text"],
input[type="email"],
input[type="password"],
textarea {
    width: 100%;
    padding: 10px;
    border: 1px solid #ccc; /* Add a subtle border */
    border-radius: 5px;
    font-size: 16px;
    margin-top: 20px;
}

textarea {
    resize: vertical; /* Allow vertical resizing of the textarea */
}

button {
    padding: 12px 20px;
    background-color: #007bff;
    color: #fff;
    border: none;
    border-radius: 5px;
    font-size: 16px;
    cursor: pointer;
    transition: background-color 0.3s ease; /* Smooth transition on hover */
}

button:hover {
    background-color: #0056b3; /* Darker shade on hover */
}

.image-container {
    display: flex;
    justify-content: center;
    align-items: center;
    margin-bottom: 20px;
}

img {
    max-width: 100%;
    height: auto;
    border-radius: 5px;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.2); /* Add a subtle shadow */
}
</style>
