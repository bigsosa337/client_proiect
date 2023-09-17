<template>
    <div>
        <header>
            <h1>Image Gallery</h1>
            <button @click="goToUpload()">Upload</button>
        </header>
        <div></div>
        <div class="body">
            <router-view></router-view>
        </div>
    </div>
</template>


<script>

export default {
    methods: {
        goToUpload() {
            this.$router.push('/upload');
        }
    }
}


</script>

<style scoped>
.body {
    margin-top: 100px;
}
</style>
