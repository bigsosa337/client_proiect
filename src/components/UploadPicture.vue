<template>
    <div class="form">
        <h1>Upload Image</h1>
        <form @submit.prevent="submitForm">
            <div class="field">
                <label for="image">Select an image file:</label>
                <input type="file" id="image" name="image" accept="image/*" @change="onFileChange" required/>
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
                <button type="submit">Upload</button>
            </div>
        </form>
    </div>
</template>

<script>
import router from "@/router";

export default {
    data() {
        return {
            image: null,
            title: "",
            description: "",
            tags: ""
        };
    },
    methods: {
        onFileChange(e) {
            this.image = e.target.files[0];
        },
        async submitForm() {
            try {
                const formData = new FormData();
                formData.append("image", this.image);
                formData.append("title", this.title);
                formData.append("description", this.description);
                formData.append("tags", this.tags.split(",").map(tag => tag.trim()));

                const response = await fetch("http://localhost:3000/uploadImage", {
                    method: "POST",
                    body: formData,
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("token")}`,
                    },
                });

                if (response.ok) {
                    // alert("Image uploaded successfully.");
                    this.image = null;
                    this.title = "";
                    this.description = "";
                    this.tags = "";
                    this.$router.push('/');
                } else {
                    if (response.status !== 204) { // Check if the status is not 204 No Content
                        const error = await response.json();
                        alert(error.message || "Something went wrong.");
                    } else {
                        alert("Something went wrong.");
                    }
                }
            } catch (error) {
                console.error("Error uploading image:", error);
                alert("Something went wrong.");
            }
        },

    },
};
</script>

<style scoped>

</style>
