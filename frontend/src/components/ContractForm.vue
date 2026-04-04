<template>
  <v-container>
    <v-row>
      <v-col cols="12">
        <div class="d-flex align-center gap-2 mb-4">
          <v-btn icon="mdi-arrow-left" variant="text" @click="$router.back()" />
          <h1 class="text-h4">{{ id ? 'Edit' : 'Create' }} Contract</h1>
        </div>
      </v-col>
    </v-row>

    <v-row v-if="loading">
      <v-col cols="12">
        <v-skeleton-loader type="article, actions" />
      </v-col>
    </v-row>

    <v-form v-else @submit.prevent="handleSubmit">
      <v-row>
        <v-col cols="12" lg="8">
          <v-card class="mb-4">
            <v-card-title>Core Information</v-card-title>
            <v-card-text>
              <v-row>
                <v-col cols="12">
                  <v-text-field
                    v-model="form.title"
                    label="Contract Title *"
                    required
                    placeholder="e.g., Acme Corp - Enterprise License"
                  />
                </v-col>
                <v-col cols="12" md="6">
                  <v-autocomplete
                    v-model="form.vendor_id"
                    label="Vendor *"
                    :items="vendors"
                    item-title="legal_name"
                    item-value="id"
                    required
                    clearable
                  />
                </v-col>
                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="form.external_reference_id"
                    label="External Reference ID"
                  />
                </v-col>
                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="form.contract_type"
                    label="Contract Type"
                    placeholder="MSA, SOW, Subscription, Amendment"
                  />
                </v-col>
                <v-col cols="12" md="6">
                  <v-autocomplete
                    v-model="form.parent_contract_id"
                    label="Parent Contract"
                    :items="parentContractOptions"
                    item-title="title"
                    item-value="id"
                    clearable
                  />
                </v-col>
                <v-col cols="12">
                  <v-textarea
                    v-model="form.description"
                    label="Description"
                    rows="3"
                    auto-grow
                  />
                </v-col>
                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="form.contract_owner"
                    label="Contract Owner *"
                    required
                    placeholder="e.g., john.doe@company.com"
                  />
                </v-col>
                <v-col cols="12" md="3">
                  <v-select
                    v-model="form.status"
                    label="Status"
                    :items="statusOptions"
                  />
                </v-col>
                <v-col cols="12" md="3">
                  <v-select
                    v-model="form.risk_tier"
                    label="Risk Tier"
                    :items="riskTierOptions"
                    clearable
                  />
                </v-col>
              </v-row>
            </v-card-text>
          </v-card>

          <v-card class="mb-4">
            <v-card-title>Dates and Term</v-card-title>
            <v-card-text>
              <v-row>
                <v-col cols="12" md="4">
                  <v-text-field v-model="form.start_date" label="Start Date *" type="date" required />
                </v-col>
                <v-col cols="12" md="4">
                  <v-text-field v-model="form.end_date" label="End Date *" type="date" required />
                </v-col>
                <v-col cols="12" md="4">
                  <v-text-field v-model="form.effective_date" label="Effective Date" type="date" />
                </v-col>
                <v-col cols="12" md="4">
                  <v-text-field v-model="form.signature_date" label="Signature Date" type="date" />
                </v-col>
                <v-col cols="12" md="4">
                  <v-text-field v-model="form.termination_date" label="Termination Date" type="date" />
                </v-col>
                <v-col cols="12" md="4">
                  <v-checkbox v-model="form.auto_renew" label="Auto Renew" hide-details />
                </v-col>
                <v-col cols="12" md="4">
                  <v-text-field v-model.number="form.initial_term_months" label="Initial Term (Months)" type="number" />
                </v-col>
                <v-col cols="12" md="4">
                  <v-text-field v-model.number="form.renewal_term_months" label="Renewal Term (Months)" type="number" />
                </v-col>
                <v-col cols="12" md="4">
                  <v-text-field v-model.number="form.notice_period_days" label="Notice Period (Days)" type="number" />
                </v-col>
              </v-row>
            </v-card-text>
          </v-card>

          <v-card class="mb-4">
            <v-card-title>Financials</v-card-title>
            <v-card-text>
              <v-row>
                <v-col cols="12" md="4">
                  <v-text-field v-model.number="form.contract_value" label="Contract Value" type="number" prefix="$" />
                </v-col>
                <v-col cols="12" md="4">
                  <v-text-field v-model="form.currency" label="Currency" placeholder="USD" />
                </v-col>
                <v-col cols="12" md="4">
                  <v-select
                    v-model="form.billing_frequency"
                    label="Billing Frequency"
                    :items="billingFrequencyOptions"
                    clearable
                  />
                </v-col>
                <v-col cols="12" md="6">
                  <v-text-field v-model="form.cost_center_code" label="Cost Center Code" />
                </v-col>
                <v-col cols="12" md="6">
                  <v-text-field v-model="form.spend_category" label="Spend Category" />
                </v-col>
                <v-col cols="12">
                  <v-textarea v-model="form.payment_terms" label="Payment Terms" rows="2" auto-grow />
                </v-col>
                <v-col cols="12">
                  <v-textarea v-model="form.price_escalation_terms" label="Price Escalation Terms" rows="2" auto-grow />
                </v-col>
              </v-row>
            </v-card-text>
          </v-card>

          <v-card class="mb-4">
            <v-card-title>Risk and Compliance</v-card-title>
            <v-card-text>
              <v-row>
                <v-col cols="12" md="6">
                  <v-select
                    v-model="form.data_classification"
                    label="Data Classification"
                    :items="dataClassificationOptions"
                    clearable
                  />
                </v-col>
                <v-col cols="12" md="6">
                  <v-text-field v-model="form.regulatory_tags" label="Regulatory Tags" placeholder="SOX, HIPAA, PCI" />
                </v-col>
                <v-col cols="12" md="3">
                  <v-checkbox v-model="form.insurance_required" label="Insurance Required" hide-details />
                </v-col>
                <v-col cols="12" md="3">
                  <v-checkbox v-model="form.soc2_required" label="SOC 2 Required" hide-details />
                </v-col>
                <v-col cols="12" md="3">
                  <v-checkbox v-model="form.dpa_required" label="DPA Required" hide-details />
                </v-col>
                <v-col cols="12" md="3">
                  <v-checkbox v-model="form.audit_rights_flag" label="Audit Rights" hide-details />
                </v-col>
                <v-col cols="12">
                  <v-textarea v-model="form.compliance_exceptions" label="Compliance Exceptions" rows="2" auto-grow />
                </v-col>
              </v-row>
            </v-card-text>
          </v-card>

          <v-card>
            <v-card-title>Obligations and Notes</v-card-title>
            <v-card-text>
              <v-row>
                <v-col cols="12">
                  <v-textarea v-model="form.key_obligations" label="Key Obligations" rows="3" auto-grow />
                </v-col>
                <v-col cols="12">
                  <v-textarea v-model="form.sla_terms" label="SLA Terms" rows="3" auto-grow />
                </v-col>
                <v-col cols="12">
                  <v-textarea v-model="form.service_credits_terms" label="Service Credits Terms" rows="3" auto-grow />
                </v-col>
                <v-col cols="12">
                  <v-textarea v-model="form.notes" label="Notes" rows="3" auto-grow />
                </v-col>
              </v-row>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>

      <v-row class="mt-2">
        <v-col cols="12">
          <div class="d-flex gap-2">
            <v-btn type="submit" color="primary" :loading="saving">Save</v-btn>
            <v-btn @click="$router.back()">Cancel</v-btn>
          </div>
        </v-col>
      </v-row>
    </v-form>

    <v-alert v-if="error" type="error" class="mt-4">{{ error }}</v-alert>
  </v-container>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { apiClient } from '../services/api';
import { store } from '../stores/app';
import type { Contract, ContractStatus, RiskTier } from '../../../backend/src/models';

type ContractFormState = Pick<Contract,
  'title' |
  'vendor_id' |
  'contract_owner' |
  'start_date' |
  'end_date' |
  'status' |
  'external_reference_id' |
  'contract_type' |
  'description' |
  'parent_contract_id' |
  'effective_date' |
  'signature_date' |
  'auto_renew' |
  'termination_date' |
  'currency' |
  'billing_frequency' |
  'payment_terms' |
  'cost_center_code' |
  'spend_category' |
  'price_escalation_terms' |
  'risk_tier' |
  'data_classification' |
  'insurance_required' |
  'soc2_required' |
  'dpa_required' |
  'audit_rights_flag' |
  'compliance_exceptions' |
  'regulatory_tags' |
  'key_obligations' |
  'sla_terms' |
  'service_credits_terms' |
  'notes'
> & {
  initial_term_months: number | null;
  renewal_term_months: number | null;
  notice_period_days: number | null;
  contract_value: number | null;
};

const router = useRouter();
const route = useRoute();
const id = typeof route.params.id === 'string' ? route.params.id : null;
const vendors = computed(() => store.state.vendors);
const parentContractOptions = computed(() => store.state.contracts.filter((contract) => contract.id !== id));
const error = ref<string | null>(null);
const loading = ref(true);
const saving = ref(false);

const statusOptions: ContractStatus[] = ['Draft', 'Under Review', 'Active', 'Expiring Soon', 'Expired', 'Terminated'];
const riskTierOptions: RiskTier[] = ['Low', 'Medium', 'High'];
const billingFrequencyOptions = ['Monthly', 'Quarterly', 'Semi-Annual', 'Annual', 'One-Time', 'Usage-Based'];
const dataClassificationOptions = ['Public', 'Internal', 'Confidential', 'Restricted'];

function createDefaultForm(): ContractFormState {
  return {
    title: '',
    vendor_id: '',
    contract_owner: '',
    start_date: '',
    end_date: '',
    status: 'Draft',
    external_reference_id: '',
    contract_type: '',
    description: '',
    parent_contract_id: '',
    effective_date: '',
    signature_date: '',
    initial_term_months: null,
    auto_renew: false,
    renewal_term_months: null,
    notice_period_days: null,
    termination_date: '',
    contract_value: null,
    currency: 'USD',
    billing_frequency: '',
    payment_terms: '',
    cost_center_code: '',
    spend_category: '',
    price_escalation_terms: '',
    risk_tier: undefined,
    data_classification: '',
    insurance_required: false,
    soc2_required: false,
    dpa_required: false,
    compliance_exceptions: '',
    regulatory_tags: '',
    key_obligations: '',
    sla_terms: '',
    service_credits_terms: '',
    notes: ''
  };
}

const form = ref<ContractFormState>(createDefaultForm());

function normalizeOptionalString(value?: string): string | undefined {
  const trimmed = value?.trim() ?? '';
  return trimmed.length > 0 ? trimmed : undefined;
}

function normalizeOptionalNumber(value: unknown): number | undefined {
  if (value === '' || value === null || value === undefined) {
    return undefined;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function mapContractToForm(contract: Contract): ContractFormState {
  return {
    title: contract.title,
    vendor_id: contract.vendor_id,
    contract_owner: contract.contract_owner,
    start_date: contract.start_date,
    end_date: contract.end_date,
    status: contract.status,
    external_reference_id: contract.external_reference_id || '',
    contract_type: contract.contract_type || '',
    description: contract.description || '',
    parent_contract_id: contract.parent_contract_id || '',
    effective_date: contract.effective_date || '',
    signature_date: contract.signature_date || '',
    initial_term_months: contract.initial_term_months ?? null,
    auto_renew: contract.auto_renew || false,
    renewal_term_months: contract.renewal_term_months ?? null,
    notice_period_days: contract.notice_period_days ?? null,
    termination_date: contract.termination_date || '',
    contract_value: contract.contract_value ?? null,
    currency: contract.currency || 'USD',
    billing_frequency: contract.billing_frequency || '',
    payment_terms: contract.payment_terms || '',
    cost_center_code: contract.cost_center_code || '',
    spend_category: contract.spend_category || '',
    price_escalation_terms: contract.price_escalation_terms || '',
    risk_tier: contract.risk_tier,
    data_classification: contract.data_classification || '',
    insurance_required: contract.insurance_required || false,
    soc2_required: contract.soc2_required || false,
    dpa_required: contract.dpa_required || false,
    compliance_exceptions: contract.compliance_exceptions || '',
    regulatory_tags: contract.regulatory_tags || '',
    key_obligations: contract.key_obligations || '',
    sla_terms: contract.sla_terms || '',
    service_credits_terms: contract.service_credits_terms || '',
    notes: contract.notes || ''
  };
}

function buildContractPayload(): Partial<Contract> {
  return {
    title: form.value.title.trim(),
    vendor_id: form.value.vendor_id,
    contract_owner: form.value.contract_owner.trim(),
    start_date: form.value.start_date,
    end_date: form.value.end_date,
    status: form.value.status,
    external_reference_id: normalizeOptionalString(form.value.external_reference_id),
    contract_type: normalizeOptionalString(form.value.contract_type),
    description: normalizeOptionalString(form.value.description),
    parent_contract_id: normalizeOptionalString(form.value.parent_contract_id),
    effective_date: normalizeOptionalString(form.value.effective_date),
    signature_date: normalizeOptionalString(form.value.signature_date),
    initial_term_months: normalizeOptionalNumber(form.value.initial_term_months),
    auto_renew: form.value.auto_renew,
    renewal_term_months: normalizeOptionalNumber(form.value.renewal_term_months),
    notice_period_days: normalizeOptionalNumber(form.value.notice_period_days),
    termination_date: normalizeOptionalString(form.value.termination_date),
    contract_value: normalizeOptionalNumber(form.value.contract_value),
    currency: normalizeOptionalString(form.value.currency),
    billing_frequency: normalizeOptionalString(form.value.billing_frequency),
    payment_terms: normalizeOptionalString(form.value.payment_terms),
    cost_center_code: normalizeOptionalString(form.value.cost_center_code),
    spend_category: normalizeOptionalString(form.value.spend_category),
    price_escalation_terms: normalizeOptionalString(form.value.price_escalation_terms),
    risk_tier: form.value.risk_tier,
    data_classification: normalizeOptionalString(form.value.data_classification),
    insurance_required: form.value.insurance_required,
    soc2_required: form.value.soc2_required,
    dpa_required: form.value.dpa_required,
    compliance_exceptions: normalizeOptionalString(form.value.compliance_exceptions),
    regulatory_tags: normalizeOptionalString(form.value.regulatory_tags),
    key_obligations: normalizeOptionalString(form.value.key_obligations),
    sla_terms: normalizeOptionalString(form.value.sla_terms),
    service_credits_terms: normalizeOptionalString(form.value.service_credits_terms),
    notes: normalizeOptionalString(form.value.notes)
  };
}

async function handleSubmit() {
  saving.value = true;
  error.value = null;

  try {
    const payload = buildContractPayload();
    const saved = id
      ? await store.updateContract(id, payload)
      : await store.createContract(payload);

    router.push(`/contracts/${saved.id}`);
  } catch (err: any) {
    error.value = err.response?.data?.error?.message || err.response?.data?.error || err.message || 'Failed to save contract';
  } finally {
    saving.value = false;
  }
}

onMounted(async () => {
  loading.value = true;

  try {
    await Promise.all([store.fetchVendors(), store.fetchContracts()]);

    if (id) {
      const contract = await apiClient.getContract(id);
      form.value = mapContractToForm(contract);
    }

    error.value = store.state.error;
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
