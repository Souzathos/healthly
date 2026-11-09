import { api } from "./api";
import { appendImage } from "./upload";

export const PROFESSIONAL_TYPES = {
  nutritionist: { label: "Nutricionista", registry: "CRN" },
  physical_educator: { label: "Educador físico", registry: "CREF" },
};

// Pedido de selo de verificado, com a foto do registro profissional
export async function requestVerification(type, registryNumber, image) {
  const form = new FormData();
  form.append("type", type);
  form.append("registryNumber", registryNumber);
  await appendImage(form, "document", image);
  return api("/professional/requests", { method: "POST", body: form });
}

// { request: null } se a pessoa nunca pediu
export function getMyRequest() {
  return api("/professional/requests/me");
}

// Só admin
export function listPendingRequests() {
  return api("/professional/requests/pending");
}

export function reviewRequest(id, approve) {
  return api(`/professional/requests/${id}`, {
    method: "PATCH",
    body: JSON.stringify({ approve }),
  });
}
