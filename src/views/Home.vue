<template>
  <div class="home">    
    <button id="login_login">Login</button>
    <button id="handle-user-info">Fetch Data</button>
    <div id="user-info"></div>
    <div id="user-name"></div>
    <div id="user-profile-image"></div>
    <div id="appauth-snackbar"></div>
  </div>
</template>

<script lang="ts">
import Vue from "vue";

export default Vue.extend({
  name: "Home"
});
</script>
