<template>
    <div :class="$style.wrap">
        <router-view></router-view>
        <footer :class="$style.footer">
 
        </footer>
    </div>
</template>

<script>
export default {
    name: 'App',
};
</script>

<style module>
    .footer {
        font-size: 14px;
        padding: 10px 0;
        text-align: center;
    }
</style>
