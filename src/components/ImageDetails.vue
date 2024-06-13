<template>
    <Dialog :visible="visible" @update:visible="updateVisible" class="image-details-dialog" modal dismissableMask @hide="closeModal" :style="{ maxWidth: '80vw', maxHeight: '80vh' }">
        <template #container="{ closeCallback }">
            <div class="custom-modal" @click.self="closeCallback">
                <div class="modal-header">
                    <Button icon="pi pi-times" class="p-button-info action-button" @click="closeCallback" />
                </div>
                <div class="image-details">
                    <div class="image-container">
                        <img :src="imageSrc" :alt="imageDetails.title" class="img"/>
                    </div>
                    <div class="image-info">
                        <div class="buttons">
                            <Button label="" class="p-button-success action-button" icon="pi pi-copy" @click="duplicateImage" />
                            <Button label="" class="p-button-warning action-button" icon="pi pi-pencil" @click="editImage" />
                            <Button label="" class="p-button-info action-button" icon="pi pi-download" @click="downloadImage" />
                            <Button label="" class="p-button-danger action-button delete-button" icon="pi pi-trash" @click="deleteImage(closeCallback)" />
                        </div>
                        <p class="filename">File Name: {{ imageDetails.filename }}</p>
                        <h2 class="title">Title: {{ imageDetails.title }}</h2>
                        <div class="tags">
                            <Tag v-for="tag in imageDetails.tags" :key="tag" :value="tag" class="tag" severity="contrast"/>
                        </div>
                    </div>
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
import Tag from 'primevue/tag';

export default {
    name: "ImageDetails",
    components: { Dialog, Button, Tag },
    props: {
        visible: {
            type: Boolean,
            required: true
        },
        filename: {
            type: String,
            required: true,
            default: ''
        }
    },
    data() {
        return {
            imageDetails: {},
            imageSrc: "",
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
                const token = localStorage.getItem('token');
                const response = await fetch(`http://localhost:3000/getImageInfo/${this.filename}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
                const data = await response.json();
                this.imageDetails = data;
                this.imageSrc = await this.getImageData(this.filename);
            } catch (error) {
                console.error("Error fetching image details:", error);
            } finally {
                this.loading = false;
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
        async deleteImage(closeCallback) {
            try {
                const response = await fetch(`http://localhost:3000/deleteImage/${this.filename}`, {
                    method: "DELETE",
                    headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
                });
                if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
                closeCallback();
                this.$router.push("/");
            } catch (error) {
                console.error("Error deleting image:", error);
            }
        },
        async duplicateImage() {
            try {
                const response = await fetch(`http://localhost:3000/duplicateImage/${this.filename}`, {
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
                this.$router.push(`/edit/${this.filename}`);
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

.image-details {
    display: flex;
    flex-direction: column;
    align-items: center;
}

.image-container {
    display: flex;
    justify-content: center;
}

img {
    max-width: 50vh;
    border-radius: 5px;
}
.buttons {
    display: flex;
    justify-content: center;
    gap: 10px;
}
.image-info {
    width: 100%;
    padding: 20px;
    box-sizing: border-box;
    text-align: justify;
}

.action-button {
    background: none;
    border: none;
    color: #000;
    font-size: 1.2em;
    cursor: pointer;
    transition: background 0.3s, color 0.3s;
}

.action-button:hover {
    background: #000;
    color: #fff;
}

.delete-button {
    color: #b90707;
}

.delete-button:hover {
    background: #b90707;
    color: #fff;
}

.filename,
.title,
.tags {
    font-size: 16px;
    color: #666;
    margin: 10px 0;
}

.tags {
    display: flex;
    flex-wrap: wrap;
    gap: 5px;
}

.tag {
    margin-top: 5px;
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
