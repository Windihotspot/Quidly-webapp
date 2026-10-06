<template>
  <article
    class="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-200 hover:shadow-md sm:p-6"
  >
    <!-- =========================================================
         CARD HEADER
    ========================================================== -->
    <div class="flex items-start justify-between gap-4">
      <div class="flex min-w-0 gap-4">

        <!-- Icon -->
        <div
          class="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600"
        >
          <svg
            class="h-5 w-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="1.8"
              d="M3 21h18M5 21V5a2 2 0 012-2h10a2 2 0 012 2v16M9 7h2m-2 4h2m2-4h2m-2 4h2"
            />
          </svg>
        </div>

        <div>
          <h2 class="text-base font-bold text-slate-900">
            Company Verification
          </h2>

          <p class="mt-1 text-xs leading-5 text-slate-500">
            Verify your business information and registration documents.
          </p>
        </div>
      </div>

      <span
        class="shrink-0 rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-[11px] font-semibold text-amber-700"
      >
        Business
      </span>
    </div>

    <div class="my-5 h-px bg-slate-100"></div>

    <!-- =========================================================
         BUSINESS INFORMATION
    ========================================================== -->
    <div class="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-2">

      <div class="rounded-lg bg-slate-50 p-4">
        <p
          class="text-[10px] font-bold uppercase tracking-wider text-slate-400"
        >
          Business Name
        </p>

        <p class="mt-2 truncate text-sm font-semibold text-slate-800">
          {{ businessName || 'Not provided' }}
        </p>
      </div>

      <div class="rounded-lg bg-slate-50 p-4">
        <p
          class="text-[10px] font-bold uppercase tracking-wider text-slate-400"
        >
          Registration Number
        </p>

        <p class="mt-2 text-sm font-semibold text-slate-800">
          {{ registrationNumber || 'Not provided' }}
        </p>
      </div>

    </div>

    <!-- =========================================================
         DOCUMENT STATUS
    ========================================================== -->
    <div
      class="flex flex-col gap-3 rounded-lg border border-slate-100 p-4 sm:flex-row sm:items-center sm:justify-between"
    >
      <div class="flex items-center gap-3">

        <div
          class="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-600"
        >
          <svg
            class="h-4 w-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M7 21h10a2 2 0 002-2V9.414a2 2 0 00-.586-1.414l-5.414-5.414A2 2 0 0011.586 2H7a2 2 0 00-2 2v15a2 2 0 002 2z"
            />
          </svg>
        </div>

        <div>
          <p class="text-sm font-semibold text-slate-800">
            Company Registration
          </p>

          <p class="mt-0.5 max-w-[180px] truncate text-xs text-slate-500">
            {{ documentName || 'Document not uploaded' }}
          </p>
        </div>

      </div>

      <span
        :class="
          documentUploaded
            ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
            : 'border-amber-200 bg-amber-50 text-amber-700'
        "
        class="w-fit rounded-full border px-2.5 py-1 text-[10px] font-bold"
      >
        {{ documentUploaded ? 'Uploaded' : 'Pending Review' }}
      </span>
    </div>

    <!-- =========================================================
         BUTTON
    ========================================================== -->
    <button
      type="button"
      class="mt-5 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
      :disabled="uploading"
      @click="openModal"
    >
      <svg
        v-if="!uploading"
        class="h-4 w-4"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M12 4v16m8-8H4"
        />
      </svg>

      <svg
        v-else
        class="h-4 w-4 animate-spin"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle
          class="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          stroke-width="4"
        />

        <path
          class="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
        />
      </svg>

      {{ uploading ? 'Uploading...' : documentUploaded ? 'Update Documents' : 'Upload Documents' }}
    </button>
  </article>


  <!-- =========================================================
       COMPANY DOCUMENT MODAL
  ========================================================== -->
  <Teleport to="body">
    <div
      v-if="showModal"
      class="fixed inset-0 z-[999] flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm"
      @click.self="closeModal"
    >

      <div
        class="w-full max-w-lg overflow-hidden rounded-xl bg-white shadow-2xl"
      >

        <!-- Modal Header -->
        <div class="flex items-center justify-between border-b border-slate-100 px-6 py-5">
          <div>
            <h3 class="text-lg font-bold text-slate-900">
              Company Registration
            </h3>

            <p class="mt-1 text-xs text-slate-500">
              Upload your official company registration document.
            </p>
          </div>

          <button
            type="button"
            class="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
            @click="closeModal"
          >
            <svg
              class="h-5 w-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>


        <!-- Modal Body -->
        <div class="space-y-5 p-6">

          <!-- Information -->
          <div class="rounded-lg border border-blue-100 bg-blue-50 p-4">
            <div class="flex gap-3">

              <svg
                class="mt-0.5 h-5 w-5 shrink-0 text-blue-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M13 16h-1v-4h-1m1-4h.01M12 22a10 10 0 100-20 10 10 0 000 20z"
                />
              </svg>

              <div>
                <p class="text-sm font-semibold text-blue-800">
                  Accepted documents
                </p>

                <p class="mt-1 text-xs leading-5 text-blue-700">
                  Upload your CAC certificate or other official company
                  registration document.
                </p>
              </div>

            </div>
          </div>


          <!-- File Upload -->
          <div>

            <label class="mb-2 block text-sm font-semibold text-slate-700">
              Company Registration Document
              <span class="text-red-500">*</span>
            </label>

            <input
              ref="fileInput"
              type="file"
              class="hidden"
              accept=".pdf,.jpg,.jpeg"
              @change="handleFileChange"
            />

            <button
              type="button"
              class="flex w-full flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 px-6 py-8 text-center transition hover:border-blue-300 hover:bg-blue-50/50"
              @click="fileInput?.click()"
            >

              <div
                class="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600"
              >
                <svg
                  class="h-6 w-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="1.8"
                    d="M12 16V4m0 0L8 8m4-4l4 4M5 20h14"
                  />
                </svg>
              </div>

              <p class="text-sm font-semibold text-slate-700">
                {{ selectedFile ? selectedFile.name : 'Click to upload document' }}
              </p>

              <p class="mt-1 text-xs text-slate-400">
                PDF, JPG or JPEG • Maximum 1MB
              </p>

            </button>

            <!-- Validation -->
            <p
              v-if="fileError"
              class="mt-2 text-xs font-medium text-red-500"
            >
              {{ fileError }}
            </p>

          </div>

        </div>


        <!-- Modal Footer -->
        <div
          class="flex justify-end gap-3 border-t border-slate-100 bg-slate-50 px-6 py-4"
        >

          <button
            type="button"
            class="rounded-lg bg-white px-5 py-2.5 text-sm font-semibold text-slate-600 ring-1 ring-inset ring-slate-200 transition hover:bg-slate-100"
            @click="closeModal"
          >
            Cancel
          </button>

          <button
            type="button"
            :disabled="uploading"
            class="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            @click="uploadDocument"
          >
            {{ uploading ? 'Uploading...' : 'Submit Document' }}
          </button>

        </div>

      </div>
    </div>
  </Teleport>
</template>


<script setup lang="ts">
import { computed, ref } from 'vue'
import Swal from 'sweetalert2'
import ApiService from '../services/api/api.service'

interface UserData {
  accountid?: string
  merchantid?: string
  quidlyuserid?: string
}

interface Props {
  userData?: UserData | null
  businessName?: string
  registrationNumber?: string
  existingDocumentName?: string
}

const props = withDefaults(defineProps<Props>(), {
  userData: null,
  businessName: '',
  registrationNumber: '',
  existingDocumentName: ''
})

const emit = defineEmits<{
  uploaded: []
}>()

const showModal = ref(false)
const fileInput = ref<HTMLInputElement | null>(null)
const selectedFile = ref<File | null>(null)
const fileError = ref('')
const uploading = ref(false)

const documentName = ref(props.existingDocumentName)

const documentUploaded = computed(() => {
  return !!documentName.value
})

const openModal = () => {
  fileError.value = ''
  selectedFile.value = null
  showModal.value = true
}

const closeModal = () => {
  if (uploading.value) return

  showModal.value = false
  selectedFile.value = null
  fileError.value = ''

  if (fileInput.value) {
    fileInput.value.value = ''
  }
}

const handleFileChange = (event: Event) => {
  const target = event.target as HTMLInputElement

  fileError.value = ''

  if (!target.files?.length) {
    selectedFile.value = null
    return
  }

  const file = target.files[0]

  const validTypes = [
    'application/pdf',
    'image/jpeg',
    'image/jpg'
  ]

  if (!validTypes.includes(file.type)) {
    fileError.value = 'Only PDF, JPG and JPEG files are allowed.'
    selectedFile.value = null
    return
  }

  if (file.size > 1024 * 1024) {
    fileError.value = 'File size must be less than 1MB.'
    selectedFile.value = null
    return
  }

  selectedFile.value = file
}

const uploadDocument = async () => {
  fileError.value = ''

  if (!selectedFile.value) {
    fileError.value = 'Please select a company registration document.'
    return
  }

  if (!props.userData) {
    fileError.value = 'User information is not available.'
    return
  }

  uploading.value = true

  try {
    const requestData = {
      p_accountid: props.userData.accountid ?? '',
      p_merchantid: props.userData.merchantid ?? '',
      p_quidlyuserid: props.userData.quidlyuserid ?? '',
      businessdocument: selectedFile.value
    }

    const { data } = await ApiService.multipartPost(
      '/uploadCompanyDocuments',
      requestData
    )

    if (data?.status !== 1) {
      throw new Error(
        data?.message || 'Unable to upload company document.'
      )
    }

    documentName.value = selectedFile.value.name

    await Swal.fire({
      icon: 'success',
      title: 'Document Uploaded',
      text: 'Your company registration document has been submitted successfully.',
      confirmButtonColor: '#2563eb'
    })

    emit('uploaded')

    closeModal()

  } catch (error: any) {
    console.error('Company document upload failed:', error)

    await Swal.fire({
      icon: 'error',
      title: 'Upload Failed',
      text:
        error?.response?.data?.message ||
        error?.message ||
        'Unable to upload the document. Please try again.',
      confirmButtonColor: '#2563eb'
    })

  } finally {
    uploading.value = false
  }
}
</script>