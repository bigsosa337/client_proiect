<template>
    <div class="profile-page">
        <h1>User Profile</h1>
        <br/>
        <div class="user-details">
            <p><strong>Name:</strong> {{ userDetails.username }}</p>
            <p><strong>Email:</strong> {{ userDetails.email }}</p>
        </div>
        <div class="user-sharing">
            <h2>User Sharing</h2>
            <div class="sharing-input-group">
                <InputText v-model="shareEmail" placeholder="Enter email to share your gallery" class="input-text" />
                <Button label="Share" @click="shareGallery" class="share-button" />
            </div>
        </div>
    </div>
</template>


<script>
import {ref, onMounted} from 'vue';
import InputText from 'primevue/inputtext';
import Button from 'primevue/button';

export default {
    components: {
        InputText,
        Button
    },
    setup() {
        const userDetails = ref({username: '', email: ''});
        const shareEmail = ref('');

        const fetchUserDetails = async () => {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:3000/getUserDetails', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            const data = await response.json();
            userDetails.value = data.user;
        };

        const shareGallery = async () => {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:3000/shareGallery', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({shareEmail: shareEmail.value})
            });
            const data = await response.json();
            if (response.ok) {
                alert('Gallery shared successfully!');
            } else {
                alert(`Error: ${data.message}`);
            }
        };

        onMounted(() => {
            fetchUserDetails();
        });

        return {
            userDetails,
            shareEmail,
            shareGallery
        };
    }
};
</script>

<style scoped>
.profile-page {
    max-width: 600px;
    margin: 0 auto;
    padding: 20px;
    border: 1px solid #ccc;
    border-radius: 10px;
    background-color: #fff;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    color: #333;
}

h1 {
    text-align: center;
    color: #000000;
}

.user-details {
    margin-bottom: 30px;
    font-size: 16px;
    color: #555;
}

.user-details p {
    margin: 5px 0;
}

.user-sharing {
    margin-top: 20px;
}

.user-sharing h2 {
    margin-bottom: 15px;
    font-size: 18px;
    color: #e67e22;
}

.sharing-input-group {
    display: flex;
    align-items: center;
}

.input-text {
    flex: 1;
    margin-right: 10px;
    padding: 10px;
    border: 1px solid #ccc;
    border-radius: 5px;
}

.share-button {
    background-color: #f39c12;
    border: none;
    padding: 10px 20px;
    color: white;
    border-radius: 5px;
    font-size: 16px;
    cursor: pointer;
    transition: background-color 0.3s;
}

.share-button:hover {
    background-color: #e67e22;
}
</style>
