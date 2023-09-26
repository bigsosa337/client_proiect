<template>
    <div class="form">
        <h1>Upload Image</h1>
        <div class="header">
            <img class="imgPreview" v-if="this.imageSrc" :src="imageSrc" alt="Image Preview">
            <br>
            <button @click="autoGenTags" class="autoGen" v-if="this.imageSrc">Auto Tag</button>
        </div>
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
    <div v-if="loading" class="loading-overlay">
        <div class="loader"></div>
    </div>
</template>
`
<script>

export default {
    data() {
        return {
            image: null,
            title: "",
            description: "",
            tags: "",
            imageSrc: null,
            loading: false,
        };
    },
    methods: {
        async autoGenTags() {
            let autoTags = [];
            const res = await this.query();
            console.log(res);
            for (let key in res) {
                autoTags.push(res[key].label.split(",")[0]);
            }
            this.tags = autoTags.join(", ");


        },
        async query() {
            const response = await fetch(
                "https://api-inference.huggingface.co/models/microsoft/resnet-50",
                {
                    headers: {Authorization: "Bearer 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"},
                    method: "POST",
                    body: this.image,
                }
            );
            const result = await response.json();
            return result;
        },
        onFileChange(e) {
            this.image = e.target.files[0];

            return new Promise((resolve, reject) => {
                const reader = new FileReader();

                reader.onloadend = async () => {
                    this.imageSrc = reader.result;
                    resolve(reader.result);
                };

                reader.onerror = reject;

                if (this.image) {
                    reader.readAsDataURL(this.image);
                }
            })
        },
        async submitForm() {
            try {
                this.loading = true;

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
                    this.loading = false;
                    this.$router.push('/');
                } else {
                    if (response.status !== 204) { // Check if the status is not 204 No Content
                        const error = await response.json();
                        alert(error.message || "Something went wrong.");
                        this.loading = false;

                    } else {
                        alert("Something went wrong.");

                    }
                }
            } catch (error) {
                console.error("Error uploading image:", error);
                alert("Something went wrong.");

            }
            this.loading = false;

        },
    },
};
</script>

<style scoped>
.form {
    max-width: 650px;
    margin: 0 auto;
    padding: 20px;
    border: 1px solid #ccc;
    border-radius: 5px;
    background-color: #fff;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);

}

.imgPreview {
    max-width: 600px;
    margin-bottom: 20px;
}

.autoGen {
    margin: 20px;
}

.header {
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
}

h1 {
    font-size: 24px;
    margin-bottom: 20px;
    color: #282828;
}

.field {
    margin-bottom: 15px;
}

label {
    display: block;
    font-weight: bold;
    margin-bottom: 5px;
    color: #282828;
}

input[type="text"],
input[type="file"],
textarea {
    width: 100%;
    padding: 10px;
    border: 1px solid #ccc;
    border-radius: 5px;
    font-size: 16px;
}

button {
    background-color: #007BFF;
    color: #fff;
    padding: 10px 20px;
    border: none;
    border-radius: 5px;
    font-size: 18px;
    cursor: pointer;
}

button:hover {
    background-color: #0056b3;
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
