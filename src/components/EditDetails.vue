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

</style>
