<!--<template>-->
<!--    <div class="form">-->
<!--        <h1>Upload Image</h1>-->
<!--        <div class="header">-->
<!--            <div  v-if="!imageSrc" class="dropzone">-->
<!--                <input type="file" @change="onFileChange" />-->
<!--                <div class="drag-area">-->
<!--                    <p>Click to select files</p>-->
<!--                </div>-->
<!--            </div>-->
<!--            <div v-if="imageSrc" class="image-container">-->
<!--                <img class="imgPreview" :src="imageSrc" alt="Image Preview" />-->
<!--            </div>-->
<!--        </div>-->
<!--        <form v-if="imageSrc" @submit.prevent="submitForm">-->
<!--            <div class="icon-container">-->
<!--                <i class="pi pi-tag auto-tag-icon" @click="autoTagImage"></i>-->
<!--                <i class="pi pi-times-circle clear-icon" @click="clearSelection"></i>-->
<!--            </div>-->
<!--            <div class="field">-->
<!--                <label for="info">Enter info for the image:</label>-->
<!--                <InputText id="info" name="info" v-model="title" />-->
<!--            </div>-->
<!--            <div class="field">-->
<!--                <label for="tags">Enter some tags for the image (separated by commas):</label>-->
<!--                <InputText id="tags" name="tags" v-model="tags" />-->
<!--            </div>-->
<!--            <div class="field">-->
<!--                <Button type="submit" label="Upload" class="uploadButton" />-->
<!--            </div>-->
<!--        </form>-->
<!--        <div v-if="loading || tagLoading" class="loading-overlay">-->
<!--            <div class="loader"></div>-->
<!--        </div>-->
<!--    </div>-->
<!--</template>-->

<!--<script>-->
<!--import { ref, defineComponent } from 'vue';-->
<!--import { useRouter } from 'vue-router';-->
<!--import InputText from 'primevue/inputtext';-->
<!--import Button from 'primevue/button';-->

<!--export default defineComponent({-->
<!--    components: {-->
<!--        InputText,-->
<!--        Button-->
<!--    },-->
<!--    setup() {-->
<!--        const image = ref(null);-->
<!--        const title = ref('');-->
<!--        const tags = ref('');-->
<!--        const imageSrc = ref(null);-->
<!--        const loading = ref(false);-->
<!--        const tagLoading = ref(false);-->
<!--        const router = useRouter();-->

<!--        const setImageSrc = (src) => {-->
<!--            imageSrc.value = src;-->
<!--        };-->

<!--        const setImage = (file) => {-->
<!--            image.value = file;-->
<!--        };-->

<!--        const setTitle = (value) => {-->
<!--            title.value = value;-->
<!--        };-->

<!--        const setTags = (value) => {-->
<!--            tags.value = value;-->
<!--        };-->

<!--        const fetchWithRetry = async (url, options, maxRetries = 10) => {-->
<!--            let retries = 0;-->
<!--            let response;-->
<!--            while (retries < maxRetries) {-->
<!--                response = await fetch(url, options);-->
<!--                if (response.status === 503) {-->
<!--                    retries += 1;-->
<!--                    await new Promise((resolve) => setTimeout(resolve, 1000));-->
<!--                } else {-->
<!--                    return response;-->
<!--                }-->
<!--            }-->
<!--            return response;-->
<!--        };-->

<!--        const autoGenTags = async (imageSrc) => {-->
<!--            if (!imageSrc) {-->
<!--                throw new Error('No image source provided.');-->
<!--            }-->

<!--            try {-->
<!--                const response = await fetchWithRetry(-->
<!--                    'https://api-inference.huggingface.co/models/microsoft/resnet-50',-->
<!--                    {-->
<!--                        headers: { Authorization: 'Bearer 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' },-->
<!--                        method: 'POST',-->
<!--                        body: await urlToBlob(imageSrc),-->
<!--                    }-->
<!--                );-->
<!--                const data = await response.json();-->

<!--                if (!response.ok) {-->
<!--                    throw new Error('Failed to fetch auto-tags.');-->
<!--                }-->

<!--                return data.map((tag) => tag.label.split(',')[0]).join(', ');-->
<!--            } catch (error) {-->
<!--                throw new Error('Failed to generate auto-tags.');-->
<!--            }-->
<!--        };-->

<!--        const analyzeImage = async (imageSrc) => {-->
<!--            if (!imageSrc) {-->
<!--                throw new Error('No image source provided.');-->
<!--            }-->

<!--            const response = await fetchWithRetry(-->
<!--                'https://api-inference.huggingface.co/models/Salesforce/blip-image-captioning-large',-->
<!--                {-->
<!--                    headers: { Authorization: 'Bearer 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' },-->
<!--                    method: 'POST',-->
<!--                    body: await urlToBlob(imageSrc),-->
<!--                }-->
<!--            );-->
<!--            const result = await response.json();-->
<!--            return result[0].generated_text;-->
<!--        };-->

<!--        const findFaces = async (imageSrc) => {-->
<!--            const response = await fetchWithRetry(-->
<!--                'https://api-inference.huggingface.co/models/facebook/detr-resnet-50',-->
<!--                {-->
<!--                    headers: { Authorization: 'Bearer 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' },-->
<!--                    method: 'POST',-->
<!--                    body: await urlToBlob(imageSrc),-->
<!--                }-->
<!--            );-->
<!--            const result = await response.json();-->
<!--            return result.map((tag) => tag.label.split(',')[0]).join(', ');-->
<!--        };-->

<!--        const urlToBlob = (url) => {-->
<!--            return new Promise((resolve, reject) => {-->
<!--                const xhr = new XMLHttpRequest();-->
<!--                xhr.onerror = reject;-->
<!--                xhr.onreadystatechange = () => {-->
<!--                    if (xhr.readyState === 4) {-->
<!--                        resolve(xhr.response);-->
<!--                    }-->
<!--                };-->
<!--                xhr.open('GET', url);-->
<!--                xhr.responseType = 'blob';-->
<!--                xhr.send();-->
<!--            });-->
<!--        };-->

<!--        const onFileChange = (e) => {-->
<!--            const file = e.target.files[0];-->
<!--            setImage(file);-->
<!--            const reader = new FileReader();-->
<!--            reader.onloadend = () => {-->
<!--                setImageSrc(reader.result);-->
<!--            };-->
<!--            reader.readAsDataURL(file);-->
<!--        };-->

<!--        const autoTagImage = async () => {-->
<!--            if (!imageSrc.value) {-->
<!--                alert('No image selected. Please select an image first.');-->
<!--                return;-->
<!--            }-->

<!--            tagLoading.value = true;-->

<!--            try {-->
<!--                const autoTags = await autoGenTags(imageSrc.value);-->
<!--                const imgDescription = await analyzeImage(imageSrc.value);-->
<!--                const objects = await findFaces(imageSrc.value);-->
<!--                console.log('Object Analysis Success: ', objects);-->
<!--                console.log('Tags Analysis Success: ', autoTags);-->
<!--                console.log('Image Analysis Success: ', imgDescription);-->
<!--                setTags(autoTags);-->
<!--                setTitle(imgDescription);-->
<!--            } catch (error) {-->
<!--                console.error('Error auto-tagging:', error);-->
<!--                alert('Error: Failed to generate auto-tags.');-->
<!--            } finally {-->
<!--                tagLoading.value = false;-->
<!--            }-->
<!--        };-->

<!--        const clearSelection = () => {-->
<!--            setImage(null);-->
<!--            setImageSrc(null);-->
<!--            setTitle('');-->
<!--            setTags('');-->
<!--        };-->

<!--        const submitForm = async () => {-->
<!--            try {-->
<!--                loading.value = true;-->
<!--                const formData = new FormData();-->
<!--                formData.append('image', image.value);-->
<!--                formData.append('title', title.value);-->
<!--                formData.append('tags', tags.value.split(',').map((tag) => tag.trim()));-->

<!--                const response = await fetch('http://localhost:3000/uploadImage', {-->
<!--                    method: 'POST',-->
<!--                    body: formData,-->
<!--                    headers: {-->
<!--                        Authorization: `Bearer ${localStorage.getItem('token')}`,-->
<!--                    },-->
<!--                });-->

<!--                if (response.ok) {-->
<!--                    clearSelection();-->
<!--                    loading.value = false;-->
<!--                    router.push('/');-->
<!--                } else {-->
<!--                    const error = await response.json();-->
<!--                    alert(error.message || 'Something went wrong.');-->
<!--                    loading.value = false;-->
<!--                }-->
<!--            } catch (error) {-->
<!--                console.error('Error uploading image:', error);-->
<!--                alert('Something went wrong.');-->
<!--                loading.value = false;-->
<!--            }-->
<!--        };-->

<!--        return {-->
<!--            image,-->
<!--            title,-->
<!--            tags,-->
<!--            imageSrc,-->
<!--            loading,-->
<!--            tagLoading,-->
<!--            onFileChange,-->
<!--            autoTagImage,-->
<!--            clearSelection,-->
<!--            submitForm,-->
<!--        };-->
<!--    },-->
<!--});-->
<!--</script>-->

<!--<style scoped>-->
<!--.form {-->
<!--    max-width: 650px;-->
<!--    margin: 0 auto;-->
<!--    padding: 20px;-->
<!--    border: 1px solid #ccc;-->
<!--    border-radius: 5px;-->
<!--    background-color: #fff;-->
<!--    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);-->
<!--}-->

<!--.dropzone {-->
<!--    width: 100%;-->
<!--    height: 200px;-->
<!--    border: 2px dashed #ccc;-->
<!--    border-radius: 5px;-->
<!--    display: flex;-->
<!--    justify-content: center;-->
<!--    align-items: center;-->
<!--    cursor: pointer;-->
<!--    text-align: center;-->
<!--}-->

<!--.drag-area {-->
<!--    font-size: 16px;-->
<!--    color: #777;-->
<!--}-->

<!--.image-container {-->
<!--    display: flex;-->
<!--    justify-content: center;-->
<!--    align-items: center;-->
<!--    flex-direction: column;-->
<!--}-->

<!--.imgPreview {-->
<!--    max-width: 100%;-->
<!--    margin-bottom: 20px;-->
<!--    position: relative;-->
<!--}-->

<!--.icon-container {-->
<!--    display: flex;-->
<!--    justify-content: space-between;-->
<!--    margin-bottom: 10px;-->
<!--}-->

<!--.auto-tag-icon,-->
<!--.clear-icon {-->
<!--    font-size: 24px;-->
<!--    cursor: pointer;-->
<!--    background: white;-->
<!--    border-radius: 50%;-->
<!--    padding: 5px;-->
<!--    color: orange;-->
<!--}-->

<!--.uploadButton {-->
<!--    color: orange;-->
<!--    border: 2px solid orange;-->
<!--    background-color: transparent;-->
<!--    margin: 10px 0;-->
<!--}-->

<!--.uploadButton:hover {-->
<!--    background-color: orange;-->
<!--    color: white;-->
<!--}-->

<!--.header {-->
<!--    display: flex;-->
<!--    justify-content: center;-->
<!--    align-items: center;-->
<!--    flex-direction: column;-->
<!--}-->

<!--h1 {-->
<!--    font-size: 24px;-->
<!--    margin-bottom: 20px;-->
<!--    color: #282828;-->
<!--}-->

<!--.field {-->
<!--    margin-bottom: 15px;-->
<!--    display: flex;-->
<!--    flex-direction: column;-->
<!--}-->

<!--label {-->
<!--    font-weight: bold;-->
<!--    margin-bottom: 5px;-->
<!--    color: #282828;-->
<!--}-->

<!--.loading-overlay {-->
<!--    position: fixed;-->
<!--    top: 0;-->
<!--    left: 0;-->
<!--    width: 100%;-->
<!--    height: 100%;-->
<!--    background: rgba(0, 0, 0, 0.5);-->
<!--    display: flex;-->
<!--    justify-content: center;-->
<!--    align-items: center;-->
<!--    z-index: 999;-->
<!--}-->

<!--.loader {-->
<!--    border: 4px solid #f3f3f3;-->
<!--    border-top: 4px solid #3498db;-->
<!--    border-radius: 50%;-->
<!--    width: 40px;-->
<!--    height: 40px;-->
<!--    animation: spin 2s linear infinite;-->
<!--}-->

<!--@keyframes spin {-->
<!--    0% {-->
<!--        transform: rotate(0deg);-->
<!--    }-->
<!--    100% {-->
<!--        transform: rotate(360deg);-->
<!--    }-->
<!--}-->
<!--</style>-->
<template>
    <div class="form">
        <h1>Upload Image</h1>
        <div class="header">
            <div v-if="!imageSrc" class="dropzone">
                <input type="file" @change="onFileChange" />
                <div class="drag-area">
                    <p>Click to select files</p>
                </div>
            </div>
            <div v-if="imageSrc" class="image-container">
                <img class="imgPreview" :src="imageSrc" alt="Image Preview" />
            </div>
        </div>
        <form v-if="imageSrc" @submit.prevent="submitForm">
            <div class="icon-container">
                <i class="pi pi-tag auto-tag-icon" @click="autoTagImage"></i>
                <i class="pi pi-times-circle clear-icon" @click="clearSelection"></i>
            </div>
            <div class="field">
                <label for="info">Enter info for the image:</label>
                <InputText id="info" name="info" v-model="title" />
            </div>
            <div class="field">
                <label for="tags">Enter some tags for the image (separated by commas):</label>
                <InputText id="tags" name="tags" v-model="tags" />
            </div>
            <div class="field">
                <Button type="submit" label="Upload" class="uploadButton" />
            </div>
        </form>
        <div v-if="loading || tagLoading" class="loading-overlay">
            <div class="loader"></div>
        </div>
    </div>
</template>


<script>
import {defineComponent, onMounted, ref} from 'vue';
import {useRouter} from 'vue-router';
import * as faceapi from 'face-api.js';
import InputText from 'primevue/inputtext';
import Button from 'primevue/button';
import {HuggingFaceApiKey} from "@/utils";

export default defineComponent({
    components: {
        InputText,
        Button
    },
    setup() {
        const image = ref(null);
        const title = ref('');
        const tags = ref('');
        const imageSrc = ref(null);
        const loading = ref(false);
        const tagLoading = ref(false);
        const router = useRouter();
        const faces = ref([]);

        const setImageSrc = (src) => {
            imageSrc.value = src;
        };

        const setImage = (file) => {
            image.value = file;
        };

        const setTitle = (value) => {
            title.value = value;
        };

        const setTags = (value) => {
            tags.value = value;
        };

        const fetchWithRetry = async (url, options, maxRetries = 10) => {
            let retries = 0;
            let response;
            while (retries < maxRetries) {
                response = await fetch(url, options);
                if (response.status === 503) {
                    retries += 1;
                    await new Promise((resolve) => setTimeout(resolve, 1000));
                } else {
                    return response;
                }
            }
            return response;
        };

        const autoGenTags = async (imageSrc) => {
            if (!imageSrc) {
                throw new Error('No image source provided.');
            }

            try {
                const response = await fetchWithRetry(
                    'https://api-inference.huggingface.co/models/microsoft/resnet-50',
                    {
                        headers: { Authorization: `Bearer ${HuggingFaceApiKey}` },
                        method: 'POST',
                        body: await urlToBlob(imageSrc),
                    }
                );
                const data = await response.json();

                if (!response.ok) {
                    throw new Error('Failed to fetch auto-tags.');
                }

                return data.map((tag) => tag.label.split(',')[0]).join(', ');
            } catch (error) {
                throw new Error('Failed to generate auto-tags.');
            }
        };

        const analyzeImage = async (imageSrc) => {
            if (!imageSrc) {
                throw new Error('No image source provided.');
            }

            const response = await fetchWithRetry(
                'https://api-inference.huggingface.co/models/Salesforce/blip-image-captioning-large',
                {
                    headers: { Authorization: `Bearer ${HuggingFaceApiKey}` },
                    method: 'POST',
                    body: await urlToBlob(imageSrc),
                }
            );
            const result = await response.json();
            return result[0].generated_text;
        };

        const detectFaces = async (imageElement) => {
            await faceapi.nets.ssdMobilenetv1.loadFromUri('/models');
            await faceapi.nets.faceLandmark68Net.loadFromUri('/models');
            await faceapi.nets.faceRecognitionNet.loadFromUri('/models');
            return faceapi.detectAllFaces(imageElement).withFaceLandmarks().withFaceDescriptors();
        };

        const findFaces = async (imageElement) => {
            const detections = await detectFaces(imageElement);
            faces.value = detections.map(detection => ({
                boundingBox: detection.detection.box,
                landmarks: detection.landmarks,
                descriptor: detection.descriptor
            }));
        };

        const urlToBlob = (url) => {
            return new Promise((resolve, reject) => {
                const xhr = new XMLHttpRequest();
                xhr.onerror = reject;
                xhr.onreadystatechange = () => {
                    if (xhr.readyState === 4) {
                        resolve(xhr.response);
                    }
                };
                xhr.open('GET', url);
                xhr.responseType = 'blob';
                xhr.send();
            });
        };

        const onFileChange = (e) => {
            const file = e.target.files[0];
            setImage(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImageSrc(reader.result);
            };
            reader.readAsDataURL(file);
        };

        const autoTagImage = async () => {
            if (!imageSrc.value) {
                alert('No image selected. Please select an image first.');
                return;
            }

            tagLoading.value = true;

            try {
                const imageElement = new Image();
                imageElement.src = imageSrc.value;
                imageElement.onload = async () => {
                    const autoTags = await autoGenTags(imageSrc.value);
                    const imgDescription = await analyzeImage(imageSrc.value);
                    const faces = await findFaces(imageElement);
                    console.log('Faces:', faces);
                    console.log('Tags Analysis Success:', autoTags);
                    console.log('Image Analysis Success:', imgDescription);
                    setTags(autoTags);
                    setTitle(imgDescription);
                };
            } catch (error) {
                console.error('Error auto-tagging:', error);
                alert('Error: Failed to generate auto-tags.');
            } finally {
                tagLoading.value = false;
            }
        };

        const clearSelection = () => {
            setImage(null);
            setImageSrc(null);
            setTitle('');
            setTags('');
        };

        const submitForm = async () => {
            try {
                loading.value = true;
                const formData = new FormData();
                formData.append('image', image.value);
                formData.append('title', title.value);
                formData.append('tags', tags.value.split(',').map((tag) => tag.trim()));
                formData.append('faces', JSON.stringify(faces.value));  // Add faces data to the form

                const response = await fetch('http://localhost:3000/uploadImage', {
                    method: 'POST',
                    body: formData,
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`,
                    },
                });

                if (response.ok) {
                    clearSelection();
                    loading.value = false;
                    router.push('/');
                } else {
                    const error = await response.json();
                    alert(error.message || 'Something went wrong.');
                    loading.value = false;
                }
            } catch (error) {
                console.error('Error uploading image:', error);
                alert('Something went wrong.');
                loading.value = false;
            }
        };

        onMounted(async () => {
            await faceapi.nets.ssdMobilenetv1.loadFromUri('/models');
            await faceapi.nets.faceLandmark68Net.loadFromUri('/models');
            await faceapi.nets.faceRecognitionNet.loadFromUri('/models');
        });

        return {
            image,
            title,
            tags,
            imageSrc,
            loading,
            tagLoading,
            faces,
            onFileChange,
            autoTagImage,
            clearSelection,
            submitForm
        };
    }
});
</script>


<style scoped>

.form {
    width: 100%;
    margin: 0 auto;
    display: flex;
    flex-direction: column;
    align-items: center;
}

.header {
    display: flex;
    justify-content: center;
    align-items: center;
    margin-bottom: 20px;
}

.dropzone {
    display: flex;
    justify-content: center;
    align-items: center;
    border: 2px dashed #ccc;
    border-radius: 10px;
    width: 100%;
    height: 200px;
    cursor: pointer;
}

.drag-area {
    display: flex;
    justify-content: center;
    align-items: center;
    text-align: center;
}

.image-container {
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
}

.imgPreview {
    max-width: 100%;
    max-height: 400px;
    border-radius: 10px;
    margin-bottom: 20px;
}

.field {
    display: flex;
    flex-direction: column;
    margin-bottom: 15px;
}

.icon-container {
    display: flex;
    justify-content: space-between;
    margin-bottom: 10px;
}

.auto-tag-icon,
.clear-icon {
    cursor: pointer;
    font-size: 24px;
    margin: 0 10px;
}

.uploadButton {
    background-color: #007bff;
    color: #fff;
    border: none;
    border-radius: 4px;
    padding: 10px 20px;
    cursor: pointer;
    font-size: 16px;
    transition: background-color 0.3s;
}

.uploadButton:hover {
    background-color: #0056b3;
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
