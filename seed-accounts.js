// ============================================================
// storage/upload.js  –  Cloudinary upload helpers
//
// Cloud Name:   ddkndbq5d
// Upload Preset: RequestForm (Unsigned)
//
// No API secret needed — uses unsigned preset for safe
// direct uploads from the frontend.
//
// Folder structure in Cloudinary:
//   mrf-system/requests/{requestId}/illustrations/
//   mrf-system/attachments/{requestId}/approved/
//   mrf-system/attachments/{requestId}/denied/
//   mrf-system/attachments/{requestId}/final_approved/
//   mrf-system/summaries/{requestId}/
// ============================================================

const CLOUD_NAME   = "ddkndbq5d";
const UPLOAD_PRESET = "RequestForm";
const UPLOAD_URL   = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/upload`;

// ── Core upload function ──────────────────────────────────────
/**
 * Upload a file to Cloudinary with progress tracking.
 *
 * @param {File}     file
 * @param {string}   folder      Cloudinary folder path
 * @param {Function} onProgress  called with 0–100 percentage
 * @returns {Promise<{url: string, publicId: string}>}
 */
export function uploadFile(file, folder, onProgress = () => {}) {
  return new Promise((resolve, reject) => {
    const formData = new FormData();
    formData.append("file",           file);
    formData.append("upload_preset",  UPLOAD_PRESET);
    formData.append("folder",         folder);
    formData.append("use_filename",   "true");
    formData.append("unique_filename","true");

    const xhr = new XMLHttpRequest();

    // Progress tracking
    xhr.upload.addEventListener("progress", (e) => {
      if (e.lengthComputable) {
        const pct = Math.round((e.loaded / e.total) * 100);
        onProgress(pct);
      }
    });

    xhr.addEventListener("load", () => {
      if (xhr.status === 200) {
        const res = JSON.parse(xhr.responseText);
        resolve({
          url:      res.secure_url,   // HTTPS download URL
          publicId: res.public_id,    // Used for deletion
        });
      } else {
        const err = JSON.parse(xhr.responseText);
        reject(new Error(err.error?.message || "Upload failed"));
      }
    });

    xhr.addEventListener("error", () => reject(new Error("Network error during upload")));
    xhr.addEventListener("abort", () => reject(new Error("Upload aborted")));

    xhr.open("POST", UPLOAD_URL);
    xhr.send(formData);
  });
}

// ── Specific upload helpers ───────────────────────────────────

/** Upload illustration / flow diagram for Request Form Section 3. */
export async function uploadIllustration(requestId, file, onProgress) {
  validateFile(file, {
    allowedTypes: ["image/jpeg", "image/png", "image/gif", "application/pdf"],
    maxMB: 20,
  });
  return uploadFile(file, `mrf-system/requests/${requestId}/illustrations`, onProgress);
}

/** Upload an approved-request attachment. */
export async function uploadApprovedAttachment(requestId, file, onProgress) {
  validateFile(file);
  return uploadFile(file, `mrf-system/attachments/${requestId}/approved`, onProgress);
}

/** Upload a denied-request attachment. */
export async function uploadDeniedAttachment(requestId, file, onProgress) {
  validateFile(file);
  return uploadFile(file, `mrf-system/attachments/${requestId}/denied`, onProgress);
}

/** Upload a final-approved request with e-signature. */
export async function uploadFinalApprovedAttachment(requestId, file, onProgress) {
  validateFile(file);
  return uploadFile(file, `mrf-system/attachments/${requestId}/final_approved`, onProgress);
}

/** Upload generated summary PDF. */
export async function uploadSummaryPDF(requestId, pdfBlob, onProgress) {
  validateFile(pdfBlob, {
    allowedTypes: ["application/pdf"],
    maxMB: 20,
  });
  return uploadFile(pdfBlob, `mrf-system/summaries/${requestId}`, onProgress);
}

// ── Validate before upload ────────────────────────────────────
/**
 * Throws an error if the file type or size is not allowed.
 */
export function validateFile(file, {
  allowedTypes = ["application/pdf", "image/jpeg", "image/png"],
  maxMB = 10,
} = {}) {
  if (!allowedTypes.includes(file.type)) {
    throw new Error(
      `File type not allowed: ${file.type}. Allowed: ${allowedTypes.join(", ")}`
    );
  }
  if (file.size > maxMB * 1024 * 1024) {
    throw new Error(`File size exceeds ${maxMB}MB limit.`);
  }
  return true;
}

// ── Usage Example ─────────────────────────────────────────────
//
// import { uploadApprovedAttachment, validateFile } from "./storage/upload.js";
// import { saveAttachment } from "./firestore/attachments-summaries-users.js";
//
// async function handleUpload(file, requestId) {
//   try {
//     validateFile(file);
//
//     const { url, publicId } = await uploadApprovedAttachment(
//       requestId,
//       file,
//       (pct) => {
//         document.getElementById("progress-bar").style.width = pct + "%";
//         document.getElementById("progress-label").textContent = pct + "%";
//       }
//     );
//
//     // Save the URL to Firestore
//     await saveAttachment(requestId, "approved", url, file.name);
//     alert("File uploaded successfully!");
//
//   } catch (err) {
//     alert("Upload failed: " + err.message);
//   }
// }