<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { contractApi, vendorApi } from '../services/api';

const router = useRouter();

// Step state: 'upload' → user selects file; 'review' → user edits extracted data; 'done'
const step = ref<'upload' | 'review' | 'done'>('upload');

const file = ref<File | null>(null);
const provider = ref('auto');
const providers = ref<string[]>([]);
const loading = ref(false);
const saving = ref(false);
const error = ref('');

// Extract response
const staging = ref<any>(null);
const duplicates = ref<any[]>([]);
const parentSuggestion = ref<any>(null);
const usedProvider = ref('');
const acknowledgeDuplicates = ref(false);

const vendors = ref<any[]>([]);
const vendorLegalName = ref('');
const result = ref<any>(null);

const form = ref({
  title: '', vendor_id: '', contract_owner: '', status: 'Draft',
  start_date: '', end_date: '', external_reference_id: '', contract_type: '',
  description: '', parent_contract_id: '', effective_date: '', signature_date: '',
  termination_date: '', initial_term_months: null as number | null, renewal_term_months: null as number | null,
  auto_renew: false, notice_period_days: null as number | null,
  contract_value: null as number | null, currency: 'USD',
  billing_frequency: '', payment_terms: '', cost_center_code: '', spend_category: '',
  risk_tier: 'Low', data_classification: '',
  insurance_required: false, soc2_required: false, dpa_required: false,
  key_obligations: '', notes: '',
});

const statuses = ['Draft', 'Under Review', 'Active', 'Expiring Soon', 'Expired', 'Terminated'];
const riskTiers = ['Low', 'Medium', 'High'];
const billingFreqs = ['Monthly', 'Quarterly', 'Semi-Annual', 'Annual', 'One-Time', 'Usage-Based'];
const dataClassifications = ['Public', 'Internal', 'Confidential', 'Restricted'];
const currencies = ['USD', 'EUR', 'GBP', 'CAD', 'AUD', 'JPY', 'CHF', 'SEK', 'NOK'];
const providerOptions = [
  { title: 'Auto', value: 'auto' },
  { title: 'OpenAI', value: 'openai' },
  { title: 'Anthropic', value: 'anthropic' },
];

onMounted(async () => {
  try {
    const { data } = await contractApi.uploadSpec();
    providers.value = data.providers;
  } catch {}
});

function onFileChange(files: File | File[]) {
  file.value = Array.isArray(files) ? files[0] || null : files;
}

async function extract() {
  if (!file.value) return;
  error.value = '';
  loading.value = true;
  try {
    const formData = new FormData();
    formData.append('file', file.value);
    formData.append('provider', provider.value);
    const { data } = await contractApi.uploadExtract(formData);

    // Populate the editable form from the extracted contract fields
    Object.keys(form.value).forEach(k => {
      const v = data.contract?.[k];
      if (v !== undefined && v !== null) (form.value as any)[k] = v;
    });

    // Try to match the extracted vendor against existing vendors so the autocomplete works
    vendorLegalName.value = data.vendor?.legal_name || '';
    const vRes = await vendorApi.list({ limit: 500 });
    vendors.value = vRes.data.data;
    const match = vendors.value.find(
      v => v.legal_name?.trim().toLowerCase() === vendorLegalName.value.trim().toLowerCase()
    );
    if (match) form.value.vendor_id = match.id;

    if (data.parent_suggestion?.resolved && data.parent_suggestion.contract) {
      form.value.parent_contract_id = data.parent_suggestion.contract.id;
    }

    staging.value = data.staging;
    duplicates.value = data.duplicates || [];
    parentSuggestion.value = data.parent_suggestion;
    usedProvider.value = data.provider;
    acknowledgeDuplicates.value = false;
    step.value = 'review';
  } catch (err: any) {
    error.value = err.response?.data?.error || err.message;
  } finally {
    loading.value = false;
  }
}

async function finalize() {
  error.value = '';
  const errs: string[] = [];
  if (!form.value.title.trim()) errs.push('Title is required');
  if (!form.value.contract_owner.trim()) errs.push('Contract owner is required');
  if (!form.value.start_date) errs.push('Start date is required');
  if (!form.value.end_date) errs.push('End date is required');
  if (!form.value.vendor_id && !vendorLegalName.value.trim()) errs.push('Vendor is required');
  if (form.value.start_date && form.value.end_date && form.value.end_date <= form.value.start_date) {
    errs.push('End date must be after start date');
  }
  if (duplicates.value.length && !acknowledgeDuplicates.value) {
    errs.push('Please acknowledge possible duplicates before saving');
  }
  if (errs.length) { error.value = errs.join('. '); return; }

  saving.value = true;
  try {
    const payload: any = { ...form.value };
    Object.keys(payload).forEach(k => { if (payload[k] === '') payload[k] = null; });

    const { data } = await contractApi.uploadFinalize({
      contract: payload,
      vendor: { legal_name: vendorLegalName.value },
      staging: staging.value,
      acknowledged_duplicates: acknowledgeDuplicates.value,
    });
    result.value = data;
    step.value = 'done';
  } catch (err: any) {
    error.value = err.response?.data?.error || err.message;
  } finally {
    saving.value = false;
  }
}

function startOver() {
  step.value = 'upload';
  file.value = null;
  staging.value = null;
  duplicates.value = [];
  parentSuggestion.value = null;
  result.value = null;
  error.value = '';
  acknowledgeDuplicates.value = false;
  Object.assign(form.value, {
    title: '', vendor_id: '', contract_owner: '', status: 'Draft',
    start_date: '', end_date: '', external_reference_id: '', contract_type: '',
    description: '', parent_contract_id: '', effective_date: '', signature_date: '',
    termination_date: '', initial_term_months: null, renewal_term_months: null,
    auto_renew: false, notice_period_days: null,
    contract_value: null, currency: 'USD',
    billing_frequency: '', payment_terms: '', cost_center_code: '', spend_category: '',
    risk_tier: 'Low', data_classification: '',
    insurance_required: false, soc2_required: false, dpa_required: false,
    key_obligations: '', notes: '',
  });
  vendorLegalName.value = '';
}
</script>

<template>
  <div>
    <v-btn variant="text" size="small" prepend-icon="mdi-arrow-left" @click="router.push('/contracts')" class="mb-2">Back to Contracts</v-btn>
    <h1 class="text-h4 font-weight-bold mb-6">Upload Contract</h1>

    <v-alert v-if="error" type="error" class="mb-4" closable>{{ error }}</v-alert>

    <!-- STEP 1: Upload -->
    <v-card v-if="step === 'upload'" class="pa-6" max-width="700">
      <v-card-title class="text-subtitle-1 font-weight-bold px-0 pb-4">Upload a scanned contract for AI extraction</v-card-title>
      <v-file-input
        label="Select contract file"
        accept="image/png,image/jpeg,image/webp,application/pdf"
        prepend-icon="mdi-paperclip"
        show-size
        @update:model-value="onFileChange"
        class="mb-4"
      />
      <v-select v-model="provider" :items="providerOptions" label="OCR Provider" class="mb-4" />
      <div class="text-caption text-medium-emphasis mb-4">
        Supported formats: PNG, JPEG, WebP, PDF (max 10 MB)<br />
        Configured providers: {{ providers.length ? providers.join(', ') : 'None — set OPENAI_API_KEY or ANTHROPIC_API_KEY' }}
      </div>
      <v-btn color="primary" size="large" :loading="loading" :disabled="!file" @click="extract" prepend-icon="mdi-cloud-upload" block>
        Extract Contract Data
      </v-btn>
    </v-card>

    <!-- STEP 2: Review / Edit -->
    <div v-if="step === 'review'">
      <v-alert type="info" variant="tonal" class="mb-4">
        Review the extracted fields below and make any corrections before saving.
        <span v-if="usedProvider"> Extracted via <strong>{{ usedProvider }}</strong>.</span>
      </v-alert>

      <!-- Possible duplicates -->
      <v-alert v-if="duplicates.length" type="warning" variant="tonal" class="mb-4">
        <div class="font-weight-bold mb-2">
          {{ duplicates.length }} possible duplicate contract{{ duplicates.length > 1 ? 's' : '' }} found
        </div>
        <ul class="mb-3">
          <li v-for="d in duplicates" :key="d.id">
            <router-link :to="`/contracts/${d.id}`" target="_blank" class="text-primary">
              {{ d.title }}
            </router-link>
            <span v-if="d.external_reference_id"> (ref: {{ d.external_reference_id }})</span>
            <span v-if="d.start_date"> — {{ d.start_date }} to {{ d.end_date }}</span>
            <span class="text-caption text-medium-emphasis"> · {{ d.reason }}</span>
          </li>
        </ul>
        <v-checkbox
          v-model="acknowledgeDuplicates"
          label="I've reviewed these and want to create this contract anyway"
          density="compact"
          hide-details
        />
      </v-alert>

      <v-alert v-if="parentSuggestion && !parentSuggestion.resolved" type="warning" variant="tonal" class="mb-4">
        Parent contract reference "<strong>{{ parentSuggestion.reference }}</strong>" could not be resolved automatically.
        Pick one in the Parent Contract field below if applicable.
      </v-alert>

      <v-form @submit.prevent="finalize">
        <v-card class="mb-4 pa-5">
          <v-card-title class="text-subtitle-1 font-weight-bold px-0 pb-3">Core Information</v-card-title>
          <v-row dense>
            <v-col cols="12" md="6"><v-text-field v-model="form.title" label="Contract Title *" /></v-col>
            <v-col cols="12" md="6">
              <v-autocomplete
                v-model="form.vendor_id"
                :items="vendors"
                item-title="legal_name"
                item-value="id"
                label="Vendor (existing)"
                clearable
                :hint="vendorLegalName ? `Extracted: ${vendorLegalName} — will be created if no match selected` : ''"
                persistent-hint
              />
            </v-col>
            <v-col cols="12" md="4"><v-text-field v-model="form.contract_owner" label="Contract Owner *" /></v-col>
            <v-col cols="12" md="4"><v-select v-model="form.status" :items="statuses" label="Status" /></v-col>
            <v-col cols="12" md="4"><v-text-field v-model="form.contract_type" label="Contract Type" /></v-col>
            <v-col cols="12" md="6"><v-text-field v-model="form.external_reference_id" label="External Reference ID" /></v-col>
            <v-col cols="12" md="6"><v-text-field v-model="form.parent_contract_id" label="Parent Contract ID" /></v-col>
            <v-col cols="12"><v-textarea v-model="form.description" label="Description" rows="2" /></v-col>
          </v-row>
        </v-card>

        <v-card class="mb-4 pa-5">
          <v-card-title class="text-subtitle-1 font-weight-bold px-0 pb-3">Dates & Term</v-card-title>
          <v-row dense>
            <v-col cols="6" md="3"><v-text-field v-model="form.start_date" label="Start Date *" type="date" /></v-col>
            <v-col cols="6" md="3"><v-text-field v-model="form.end_date" label="End Date *" type="date" /></v-col>
            <v-col cols="6" md="3"><v-text-field v-model="form.effective_date" label="Effective Date" type="date" /></v-col>
            <v-col cols="6" md="3"><v-text-field v-model="form.signature_date" label="Signature Date" type="date" /></v-col>
            <v-col cols="6" md="3"><v-text-field v-model.number="form.initial_term_months" label="Initial Term (months)" type="number" /></v-col>
            <v-col cols="6" md="3"><v-text-field v-model.number="form.renewal_term_months" label="Renewal Term (months)" type="number" /></v-col>
            <v-col cols="6" md="3"><v-text-field v-model.number="form.notice_period_days" label="Notice Period (days)" type="number" /></v-col>
            <v-col cols="6" md="3"><v-switch v-model="form.auto_renew" label="Auto Renew" color="primary" /></v-col>
          </v-row>
        </v-card>

        <v-card class="mb-4 pa-5">
          <v-card-title class="text-subtitle-1 font-weight-bold px-0 pb-3">Financials</v-card-title>
          <v-row dense>
            <v-col cols="6" md="3"><v-text-field v-model.number="form.contract_value" label="Contract Value" type="number" prefix="$" /></v-col>
            <v-col cols="6" md="3"><v-autocomplete v-model="form.currency" :items="currencies" label="Currency" /></v-col>
            <v-col cols="6" md="3"><v-select v-model="form.billing_frequency" :items="billingFreqs" label="Billing Frequency" clearable /></v-col>
            <v-col cols="6" md="3"><v-text-field v-model="form.payment_terms" label="Payment Terms" /></v-col>
            <v-col cols="6" md="6"><v-text-field v-model="form.cost_center_code" label="Cost Center Code" /></v-col>
            <v-col cols="6" md="6"><v-text-field v-model="form.spend_category" label="Spend Category" /></v-col>
          </v-row>
        </v-card>

        <v-card class="mb-4 pa-5">
          <v-card-title class="text-subtitle-1 font-weight-bold px-0 pb-3">Risk & Compliance</v-card-title>
          <v-row dense>
            <v-col cols="6" md="3"><v-select v-model="form.risk_tier" :items="riskTiers" label="Risk Tier" /></v-col>
            <v-col cols="6" md="3"><v-select v-model="form.data_classification" :items="dataClassifications" label="Data Classification" clearable /></v-col>
            <v-col cols="4" md="2"><v-switch v-model="form.insurance_required" label="Insurance" color="primary" density="compact" /></v-col>
            <v-col cols="4" md="2"><v-switch v-model="form.soc2_required" label="SOC2" color="primary" density="compact" /></v-col>
            <v-col cols="4" md="2"><v-switch v-model="form.dpa_required" label="DPA" color="primary" density="compact" /></v-col>
          </v-row>
        </v-card>

        <v-card class="mb-4 pa-5">
          <v-card-title class="text-subtitle-1 font-weight-bold px-0 pb-3">Obligations & Notes</v-card-title>
          <v-row dense>
            <v-col cols="12"><v-textarea v-model="form.key_obligations" label="Key Obligations" rows="3" /></v-col>
            <v-col cols="12"><v-textarea v-model="form.notes" label="Notes" rows="2" /></v-col>
          </v-row>
        </v-card>

        <div class="d-flex justify-end ga-3">
          <v-btn variant="outlined" @click="startOver">Cancel</v-btn>
          <v-btn color="primary" type="submit" :loading="saving" size="large">Save Contract</v-btn>
        </div>
      </v-form>
    </div>

    <!-- STEP 3: Done -->
    <v-card v-if="step === 'done' && result?.contract" class="pa-6" max-width="700">
      <v-card-title class="text-subtitle-1 font-weight-bold px-0 pb-3">Contract Created</v-card-title>
      <div class="mb-3">
        <strong>Contract:</strong>
        <router-link :to="`/contracts/${result.contract.id}`" class="text-primary ml-1">{{ result.contract.title }}</router-link>
      </div>
      <div class="mb-3">
        <strong>Vendor:</strong>
        <router-link :to="`/vendors/${result.vendor.id}`" class="text-primary ml-1">{{ result.vendor.legal_name }}</router-link>
      </div>
      <div v-if="result.document" class="mb-4">
        <strong>Document:</strong> {{ result.document.file_name }}
      </div>
      <v-btn color="primary" @click="startOver" prepend-icon="mdi-plus">Upload another</v-btn>
    </v-card>
  </div>
</template>
