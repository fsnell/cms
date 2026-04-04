<template>
  <v-container>
    <v-row class="mb-4">
      <v-col cols="12">
        <div class="d-flex align-center justify-space-between">
          <div class="d-flex align-center gap-2">
            <v-btn icon="mdi-arrow-left" variant="text" @click="$router.back()" />
            <div>
              <h1 class="text-h4">{{ contract?.title || 'Contract Detail' }}</h1>
              <p class="text-subtitle2 text-grey-darken-1">View contract summary and lifecycle details</p>
            </div>
          </div>
          <v-btn v-if="contract && canWrite" color="primary" :to="`/contracts/${contract.id}/edit`">Edit</v-btn>
        </div>
      </v-col>
    </v-row>

    <v-row v-if="loading">
      <v-col cols="12">
        <v-skeleton-loader type="article, article, article" />
      </v-col>
    </v-row>

    <template v-else-if="contract">
      <v-row>
        <v-col cols="12" lg="8">
          <v-card class="mb-4">
            <v-card-title>Core Information</v-card-title>
            <v-card-text>
              <v-row>
                <v-col cols="12" md="6"><strong>Title:</strong> {{ contract.title }}</v-col>
                <v-col cols="12" md="6"><strong>Vendor:</strong> {{ vendorName }}</v-col>
                <v-col cols="12" md="6"><strong>Owner:</strong> {{ contract.contract_owner }}</v-col>
                <v-col cols="12" md="6"><strong>Status:</strong> {{ contract.status }}</v-col>
                <v-col cols="12" md="6"><strong>Risk Tier:</strong> {{ displayValue(contract.risk_tier) }}</v-col>
                <v-col cols="12" md="6"><strong>Contract Type:</strong> {{ displayValue(contract.contract_type) }}</v-col>
                <v-col cols="12" md="6"><strong>External Reference:</strong> {{ displayValue(contract.external_reference_id) }}</v-col>
                <v-col cols="12" md="6"><strong>Parent Contract:</strong> {{ parentContractTitle }}</v-col>
                <v-col cols="12"><strong>Description:</strong> {{ displayValue(contract.description) }}</v-col>
              </v-row>
            </v-card-text>
          </v-card>

          <v-card class="mb-4">
            <v-card-title>Dates and Term</v-card-title>
            <v-card-text>
              <v-row>
                <v-col cols="12" md="4"><strong>Start Date:</strong> {{ displayValue(contract.start_date) }}</v-col>
                <v-col cols="12" md="4"><strong>End Date:</strong> {{ displayValue(contract.end_date) }}</v-col>
                <v-col cols="12" md="4"><strong>Effective Date:</strong> {{ displayValue(contract.effective_date) }}</v-col>
                <v-col cols="12" md="4"><strong>Signature Date:</strong> {{ displayValue(contract.signature_date) }}</v-col>
                <v-col cols="12" md="4"><strong>Termination Date:</strong> {{ displayValue(contract.termination_date) }}</v-col>
                <v-col cols="12" md="4"><strong>Auto Renew:</strong> {{ booleanLabel(contract.auto_renew) }}</v-col>
                <v-col cols="12" md="4"><strong>Initial Term:</strong> {{ numberLabel(contract.initial_term_months, 'months') }}</v-col>
                <v-col cols="12" md="4"><strong>Renewal Term:</strong> {{ numberLabel(contract.renewal_term_months, 'months') }}</v-col>
                <v-col cols="12" md="4"><strong>Notice Period:</strong> {{ numberLabel(contract.notice_period_days, 'days') }}</v-col>
              </v-row>
            </v-card-text>
          </v-card>

          <v-card class="mb-4">
            <v-card-title>Financials</v-card-title>
            <v-card-text>
              <v-row>
                <v-col cols="12" md="4"><strong>Contract Value:</strong> {{ currencyLabel(contract.contract_value, contract.currency) }}</v-col>
                <v-col cols="12" md="4"><strong>Currency:</strong> {{ displayValue(contract.currency) }}</v-col>
                <v-col cols="12" md="4"><strong>Billing Frequency:</strong> {{ displayValue(contract.billing_frequency) }}</v-col>
                <v-col cols="12" md="6"><strong>Cost Center:</strong> {{ displayValue(contract.cost_center_code) }}</v-col>
                <v-col cols="12" md="6"><strong>Spend Category:</strong> {{ displayValue(contract.spend_category) }}</v-col>
                <v-col cols="12"><strong>Payment Terms:</strong> {{ displayValue(contract.payment_terms) }}</v-col>
                <v-col cols="12"><strong>Price Escalation Terms:</strong> {{ displayValue(contract.price_escalation_terms) }}</v-col>
              </v-row>
            </v-card-text>
          </v-card>

          <v-card class="mb-4">
            <v-card-title>Risk and Compliance</v-card-title>
            <v-card-text>
              <v-row>
                <v-col cols="12" md="6"><strong>Data Classification:</strong> {{ displayValue(contract.data_classification) }}</v-col>
                <v-col cols="12" md="6"><strong>Regulatory Tags:</strong> {{ displayValue(contract.regulatory_tags) }}</v-col>
                <v-col cols="12" md="3"><strong>Insurance Required:</strong> {{ booleanLabel(contract.insurance_required) }}</v-col>
                <v-col cols="12" md="3"><strong>SOC 2 Required:</strong> {{ booleanLabel(contract.soc2_required) }}</v-col>
                <v-col cols="12" md="3"><strong>DPA Required:</strong> {{ booleanLabel(contract.dpa_required) }}</v-col>
                <v-col cols="12" md="3"><strong>Audit Rights:</strong> {{ booleanLabel(contract.audit_rights_flag) }}</v-col>
                <v-col cols="12"><strong>Compliance Exceptions:</strong> {{ displayValue(contract.compliance_exceptions) }}</v-col>
              </v-row>
            </v-card-text>
          </v-card>

          <v-card>
            <v-card-title>Obligations and Notes</v-card-title>
            <v-card-text>
              <v-row>
                <v-col cols="12"><strong>Key Obligations:</strong> {{ displayValue(contract.key_obligations) }}</v-col>
                <v-col cols="12"><strong>SLA Terms:</strong> {{ displayValue(contract.sla_terms) }}</v-col>
                <v-col cols="12"><strong>Service Credits Terms:</strong> {{ displayValue(contract.service_credits_terms) }}</v-col>
                <v-col cols="12"><strong>Notes:</strong> {{ displayValue(contract.notes) }}</v-col>
              </v-row>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </template>

    <v-alert v-if="error" type="error" class="mt-4">{{ error }}</v-alert>
  </v-container>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';
import { apiClient } from '../services/api';
import { store } from '../stores/app';
import type { Contract, Vendor } from '../../../backend/src/models';

const route = useRoute();
const contract = ref<Contract | null>(null);
const vendor = ref<Vendor | null>(null);
const parentContract = ref<Contract | null>(null);
const loading = ref(true);
const error = ref<string | null>(null);
const canWrite = computed(() => store.canWrite());

const vendorName = computed(() => vendor.value?.legal_name || contract.value?.vendor_id || 'Unknown');
const parentContractTitle = computed(() => parentContract.value?.title || displayValue(contract.value?.parent_contract_id));

function displayValue(value?: string) {
  return value && value.trim().length > 0 ? value : 'N/A';
}

function booleanLabel(value?: boolean) {
  return value ? 'Yes' : 'No';
}

function numberLabel(value?: number | null, unit?: string) {
  if (value === undefined || value === null) {
    return 'N/A';
  }

  return unit ? `${value} ${unit}` : String(value);
}

function currencyLabel(value?: number, currencyCode?: string) {
  if (value === undefined || value === null) {
    return 'N/A';
  }

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currencyCode || 'USD',
    maximumFractionDigits: 0
  }).format(value);
}

onMounted(async () => {
  try {
    contract.value = await apiClient.getContract(route.params.id as string);
    const requests: Promise<unknown>[] = [apiClient.getVendor(contract.value.vendor_id).then((result) => { vendor.value = result; })];

    if (contract.value.parent_contract_id) {
      requests.push(apiClient.getContract(contract.value.parent_contract_id).then((result) => { parentContract.value = result; }));
    }

    await Promise.all(requests);
    error.value = null;
  } catch (err: any) {
    error.value = err.response?.data?.error || err.message || 'Failed to load contract';
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
});
