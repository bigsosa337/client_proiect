<template>
    <Dialog :visible="visible" @update:visible="updateVisible" class="image-details-dialog" modal dismissableMask @hide="closeModal" :style="{ maxWidth: '80vw', maxHeight: '80vh' }">
        <template #container="{ closeCallback }">
            <div class="custom-modal" @click.self="closeCallback">
                <div class="modal-header">
                    <Button icon="pi pi-times" class="p-button-info action-button" @click="closeCallback" />
                </div>
                <div class="image-details">
                    <div class="image-container">
                        <img :src="imageSrc" :alt="title" />
                    </div>
                    <span class="fields">
                        <div class="field">
                            <label for="title">Edit the title for the image:</label>
                            <input type="text" id="title" name="title" v-model="title"/>
                        </div>
                        <div class="field">
                            <label for="tags">Edit the tags for the image (separated by commas):</label>
                            <input type="text" id="tags" name="tags" v-model="tags"/>
                        </div>
                        <div class="btn">
                            <button @click="submitForm">Save Changes</button>
                        </div>
                    </span>
                    <div v-if="loading" class="loading-overlay">
                        <div class="loader"></div>
                    </div>
                </div>
            </div>
        </template>
    </Dialog>
</template>

<script>
import { ref, watch } from 'vue';
import Dialog from 'primevue/dialog';
import Button from 'primevue/button';

export default {
    name: "EditDetails",
    components: { Dialog, Button },
    props: {
        visible: {
            type: Boolean,
            required: true
        },
        filename: {
            type: String,
            required: true,
            default: ''
        },
        currentAlbum: {
            type: String,
            required: true,
            default: 'my'
        }
    },
    data() {
        return {
            imageSrc: null,
            title: "",
            description: "",
            tags: "",
            imageDetails: {},
            loading: false
        };
    },
    watch: {
        filename: 'fetchImageInfo',
        visible: 'fetchImageInfo'
    },
    methods: {
        async fetchImageInfo() {
            if (!this.filename) return;
            try {
                this.loading = true;
                let filename = this.filename;
                const token = localStorage.getItem('token');
                const sharedUserId = this.currentAlbum !== 'my' ? this.currentAlbum : null;
                if(sharedUserId) filename = this.filename.replace('images/', '');
                const response = await fetch(`http://localhost:3000/getImageInfo/${filename}${sharedUserId ? `?sharedUserId=${sharedUserId}` : ''}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
                const data = await response.json();
                this.imageDetails = data;
                this.title = data.title;
                this.description = data.description;
                this.tags = data.tags.join(", ");
                this.imageSrc = await this.getImageData(this.filename, sharedUserId);
            } catch (error) {
                console.error("Error fetching image details:", error);
            } finally {
                this.loading = false;
            }
        },
        async getImageData(filename, sharedUserId = null) {
            try {
                const token = localStorage.getItem('token');
                const response = await fetch(`http://localhost:3000/getImageData/${filename}${sharedUserId ? `?sharedUserId=${sharedUserId}` : ''}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
                return URL.createObjectURL(await response.blob());
            } catch (error) {
                console.error("Error fetching image data:", error);
            }
        },
        async submitForm() {
            try {
                const data = {
                    title: this.title,
                    description: this.description,
                    tags: this.tags.split(",").map(tag => tag.trim()), // Split and trim tags
                };
                const token = localStorage.getItem('token');
                const response = await fetch(`http://localhost:3000/updateImage/${this.filename}`, {
                    method: "PATCH",
                    body: JSON.stringify(data),
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                });
                if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
                this.$emit('update:visible', false); // Close the modal
                this.$emit('imageUpdated'); // Emit event after updating image
            } catch (error) {
                console.error("Error updating image:", error);
            }
        },
        closeModal() {
            this.$emit('close');
        },
        updateVisible(value) {
            this.$emit('update:visible', value);
        }
    },
    created() {
        if (this.filename) {
            this.fetchImageInfo();
        }
    }
};
</script>

<style scoped>
@font-face {
    font-family: 'Poppins-Regular';
    src: url('../../public/fonts/poppins/Poppins-Regular.ttf');
}

@font-face {
    font-family: 'Poppins-Bold';
    src: url('../../public/fonts/poppins/Poppins-Bold.ttf');
}

@font-face {
    font-family: 'Poppins-Medium';
    src: url('../../public/fonts/poppins/Poppins-Medium.ttf');
}

@font-face {
    font-family: 'Montserrat-Bold';
    src: url('../../public/fonts/montserrat/Montserrat-Bold.ttf');
}

.image-details-dialog {
    display: flex;
    flex-direction: column;
    font-family: 'Poppins-Regular', sans-serif;
}

.custom-modal {
    background-color: rgba(239, 237, 235, 0.99);
    padding: 20px;
    border-radius: 10px;
    display: flex;
    flex-direction: column;
    align-items: center;
}

.modal-header {
    align-self: flex-end;
    background: none;
    border: none;
    color: #000;
    font-size: 1.2em;
    cursor: pointer;
    transition: background 0.3s, color 0.3s;
}
.fields {
    display: flex;
    flex-direction: column;
    padding: 20px;
    width: 100%;
}
.fields .btn {
    align-self: center;
}
.image-details {
    display: flex;
    flex-direction: column;
    padding: 20px;
}

.image-container {
    display: flex;
    justify-content: center;
    max-height:50vh;
}

img {
    max-width: 50vh;
    border-radius: 5px;
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
field:first-child {
    margin-top: 10px;
}

button {
    padding: 12px 20px;
    background-color: #ffffff;
    color: #000000;
    border: 1px solid black;
    border-radius: 5px;
    font-size: 16px;
    cursor: pointer;
    transition: background-color 0.3s ease; /* Smooth transition on hover */
}

button:hover {
    background-color: #000000; /* Darker shade on hover */
    color: #ffffff;
}

.loading-overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    background: rgba(255, 255, 255, 0.7);
}

.loader {
    border: 4px solid rgba(0, 0, 0, 0.1);
    border-top: 4px solid #000;
    border-radius: 50%;
    width: 40px;
    height: 40px;
    animation: spin 1s linear infinite;
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
