<template>
  <ConfirmationModal action="reset Auth token in storage" :trigger="resetToken" />
</template>
<script lang="ts" setup>
  import ConfirmationModal from "@/src/components/modals/ConfirmationModal.vue";

  const resetToken = () => {
    window.localStorage.removeItem("auth");
  };
</script>
