<template>
  <v-container>
    <v-row class="mb-4">
      <v-col cols="12">
        <div class="d-flex align-center justify-space-between">
          <div class="d-flex align-center gap-2">
            <v-btn icon="mdi-arrow-left" variant="text" @click="$router.back()" />
            <div>
              <h1 class="text-h4">{{ vendor?.legal_name || 'Vendor Detail' }}</h1>
              <p class="text-subtitle2 text-grey-darken-1">View vendor profile and status</p>
            </div>
          </div>
          <v-btn v-if="vendor && canWrite" color="primary" :to="`/vendors/${vendor.id}/edit`">Edit</v-btn>
        </div>
      </v-col>
    </v-row>

    <v-row v-if="loading">
      <v-col cols="12">
        <v-skeleton-loader type="article" />
      </v-col>
    </v-row>

    <v-row v-else-if="vendor">
      <v-col cols="12" md="8">
        <v-card>
          <v-card-title>Vendor Profile</v-card-title>
          <v-card-text>
            <v-row>
              <v-col cols="12" sm="6"><strong>Legal Name:</strong> {{ vendor.legal_name }}</v-col>
              <v-col cols="12" sm="6"><strong>DBA:</strong> {{ vendor.dba_name || 'N/A' }}</v-col>
              <v-col cols="12" sm="6"><strong>Status:</strong> {{ vendor.status }}</v-col>
              <v-col cols="12" sm="6"><strong>Risk Tier:</strong> {{ vendor.risk_tier }}</v-col>
              <v-col cols="12" sm="6"><strong>Category:</strong> {{ vendor.category || 'N/A' }}</v-col>
              <v-col cols="12" sm="6"><strong>Website:</strong> {{ vendor.website || 'N/A' }}</v-col>
              <v-col cols="12" sm="6"><strong>Contact Name:</strong> {{ vendor.primary_contact_name || 'N/A' }}</v-col>
              <v-col cols="12" sm="6"><strong>Contact Email:</strong> {{ vendor.primary_contact_email || 'N/A' }}</v-col>
              <v-col cols="12" sm="6"><strong>Contact Phone:</strong> {{ vendor.primary_contact_phone || 'N/A' }}</v-col>
            </v-row>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <v-alert v-if="error" type="error" class="mt-4">{{ error }}</v-alert>
  </v-container>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';
import { apiClient } from '../services/api';
import { store } from '../stores/app';
import type { Vendor } from '../../../backend/src/models';

const route = useRoute();
const vendor = ref<Vendor | null>(null);
const loading = ref(true);
const error = ref<string | null>(null);
const canWrite = computed(() => store.canWrite());

onMounted(async () => {
  try {
    vendor.value = await apiClient.getVendor(route.params.id as string);
    error.value = null;
  } catch (err: any) {
    error.value = err.response?.data?.error || err.message || 'Failed to load vendor';
  } finally {
    loading.value = false;
  }
});
</script>

<style scoped>
.gap-2 {
  gap: 8px;
}
</style>
