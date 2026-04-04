<template>
  <v-container>
    <v-row>
      <v-col cols="12">
        <div class="d-flex align-center gap-2 mb-4">
          <v-btn icon="mdi-arrow-left" variant="text" @click="$router.back()" />
          <h1 class="text-h4">{{ id ? 'Edit' : 'Create' }} Vendor</h1>
        </div>
      </v-col>
    </v-row>

    <v-row>
      <v-col cols="12" md="8">
        <v-card>
          <v-card-text>
            <v-form @submit.prevent="handleSubmit">
              <v-text-field
                v-model="form.legal_name"
                label="Legal Name *"
                required
              />

              <v-text-field
                v-model="form.dba_name"
                label="DBA Name"
              />

              <v-select
                v-model="form.risk_tier"
                label="Risk Tier *"
                :items="riskTierOptions"
                required
              />

              <v-text-field
                v-model="form.category"
                label="Category"
              />

              <v-text-field
                v-model="form.website"
                label="Website"
                type="url"
              />

              <v-divider class="my-4" />
              <h3>Primary Contact</h3>

              <v-text-field
                v-model="form.primary_contact_name"
                label="Contact Name"
              />

              <v-text-field
                v-model="form.primary_contact_email"
                label="Contact Email"
                type="email"
              />

              <v-text-field
                v-model="form.primary_contact_phone"
                label="Contact Phone"
              />

              <v-divider class="my-4" />

              <div class="d-flex gap-2">
                <v-btn type="submit" color="primary">Save</v-btn>
                <v-btn @click="$router.back()">Cancel</v-btn>
              </div>
            </v-form>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <v-alert v-if="error" type="error" class="mt-4">{{ error }}</v-alert>
  </v-container>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { store } from '../stores/app';
import { apiClient } from '../services/api';
import type { RiskTier, Vendor } from '../../../backend/src/models';

const router = useRouter();
const route = useRoute();
const id = route.params.id as string || null;

const riskTierOptions: RiskTier[] = ['Low', 'Medium', 'High'];

type VendorFormState = Pick<Vendor,
  'legal_name' |
  'dba_name' |
  'risk_tier' |
  'category' |
  'website' |
  'primary_contact_name' |
  'primary_contact_email' |
  'primary_contact_phone'
>;

const form = ref<VendorFormState>({
  legal_name: '',
  dba_name: '',
  risk_tier: 'Medium',
  category: '',
  website: '',
  primary_contact_name: '',
  primary_contact_email: '',
  primary_contact_phone: ''
});

const error = ref<string | null>(null);

async function handleSubmit() {
  try {
    if (id) {
      await store.updateVendor(id, form.value);
    } else {
      await store.createVendor(form.value);
    }
    router.push('/vendors');
  } catch (err: any) {
    error.value = err.response?.data?.error?.message || err.message || 'Failed to save vendor';
  }
}

onMounted(async () => {
  if (!id) {
    return;
  }

  try {
    const vendor = await apiClient.getVendor(id);
    form.value = {
      legal_name: vendor.legal_name || '',
      dba_name: vendor.dba_name || '',
      risk_tier: vendor.risk_tier || 'Medium',
      category: vendor.category || '',
      website: vendor.website || '',
      primary_contact_name: vendor.primary_contact_name || '',
      primary_contact_email: vendor.primary_contact_email || '',
      primary_contact_phone: vendor.primary_contact_phone || ''
    };
    error.value = null;
  } catch (err: any) {
    error.value = err.response?.data?.error || err.message || 'Failed to load vendor';
  }
});
</script>

<style scoped>
.gap-2 {
  gap: 8px;
}
</style>
