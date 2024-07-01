<template>
    <div class="profile-page">
        <h1 class="page-title">User Profile</h1>
        <div class="content">
            <aside class="sidebar">
                <ul>
                    <li>Profile Security</li>
                    <li>Storage Plan</li>
                    <li>Billing</li>
                    <li>Notifications</li>
                    <li>Connected Apps</li>
                </ul>
            </aside>
            <main class="main-content">
                <div class="user-details">
                    <img src="https://media.licdn.com/dms/image/D4D03AQHEHWfV9Y6ZLA/profile-displayphoto-shrink_800_800/0/1715241590575?e=1724889600&v=beta&t=KYjCRmwq6RMdLlRHEZ1BsTPrvOqCp3HLmin7mPDkdF8"
                         alt="User Profile" class="profile-image"/>
                    <div class="user-deets">
                        <p><strong>Name:</strong> {{ userDetails.username || 'John Doe' }}</p>
                        <p><strong>Email:</strong> {{ userDetails.email || 'johndoe@example.com' }}</p>
                    </div>
                </div>
                <div class="user-sharing">
                    <h2>User Sharing</h2>
                    <div class="sharing-input-group">
                        <InputText v-model="shareEmail" placeholder="Enter email to share your gallery"
                                   class="input-text"/>
                        <Button label="Share" @click="shareGallery" class="share-button"/>
                    </div>
                </div>
                <div class="wipe-data">
                    <Button label="Wipe All Data" @click="wipeUserData" class="wipe-button"/>
                </div>
            </main>
        </div>
    </div>
</template>
<script>
import { ref, onMounted } from 'vue';
import InputText from 'primevue/inputtext';
import Button from 'primevue/button';

export default {
    components: {
        InputText,
        Button
    },
    setup() {
        const userDetails = ref({ username: '', email: '' });
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
                body: JSON.stringify({ shareEmail: shareEmail.value })
            });
            const data = await response.json();
            if (response.ok) {
                alert('Gallery shared successfully!');
            } else {
                alert(`Error: ${data.message}`);
            }
        };

        const wipeUserData = async () => {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:3000/wipeUserData', {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const data = await response.json();
            if (response.ok) {
                alert('All user data wiped successfully!');
                userDetails.value = { username: '', email: '' };
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
            shareGallery,
            wipeUserData
        };
    }
};
</script>
<style scoped>
.profile-page {
    max-width: 800px;
    margin: 0 auto;
    padding: 20px;
    border: 1px solid #ccc;
    border-radius: 10px;
    background-color: #fff;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    color: #333;
}

.page-title {
    padding-bottom: 10px;
    border-bottom: 1px solid #55555548;
    margin-bottom: 20px;
}

h1 {
    text-align: center;
    color: #000000;
}

.content {
    display: flex;
}

.sidebar {
    width: 200px;
    margin-right: 20px;
    border-right: 1px solid #ccc;
    padding-right: 20px;
}

.sidebar h2 {
    font-size: 18px;
    color: #3498db;
    margin-bottom: 15px;
}

.sidebar ul {
    list-style: none;
    padding: 0;
}

.sidebar ul:first-child {
    color: #3498db;
}

.sidebar li {
    margin-bottom: 10px;
    font-size: 16px;
    color: #555;
    padding: 10px;
    border: 1px solid #ccc;
    border-radius: 5px;
    cursor: pointer;
    transition: background-color 0.3s, color 0.3s;
}

.sidebar li:hover {
    background-color: #3498db;
    color: #fff;
}

.main-content {
    flex: 1;
}

.user-details {
    margin-bottom: 30px;
    font-size: 16px;
    color: #555;
    display: flex;
    align-items: center;
}

.user-details .profile-image {
    width: 150px;
    height: 150px;
    border-radius: 50%;
    margin-right: 20px;
}

.user-deets {
    font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
    font-weight: bold;
}

.user-details .details {
    display: flex;
    flex-direction: column;
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

.wipe-data {
    margin-top: 20px;
}

.wipe-button {
    background-color: #e74c3c;
    border: none;
    padding: 10px 20px;
    color: white;
    border-radius: 5px;
    font-size: 16px;
    cursor: pointer;
    transition: background-color 0.3s;
}

.wipe-button:hover {
    background-color: #c0392b;
}
</style>
