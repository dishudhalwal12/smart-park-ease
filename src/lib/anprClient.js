const API_BASE = '/api/anpr';

async function request(path, options = {}, timeoutMs = 30000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(`${API_BASE}${path}`, {
      ...options,
      signal: controller.signal,
    });

    const payload = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(payload.detail || payload.error || `ANPR request failed (${response.status}).`);
    }

    return payload;
  } catch (error) {
    if (error.name === 'AbortError') {
      throw new Error('ANPR request timed out. Try another image.');
    }
    throw error;
  } finally {
    clearTimeout(timer);
  }
}

export async function checkAnprHealth() {
  return request('/health', { method: 'GET' }, 5000);
}

export async function recognizePlate(imageFile) {
  const formData = new FormData();
  formData.append('image', imageFile);

  return request('/recognize', {
    method: 'POST',
    body: formData,
  });
}
