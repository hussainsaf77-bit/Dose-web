/**
 * Robust file downloader for Web, iframe previews, and mobile browsers.
 * Handles iframe sandbox blocks by providing blob download, direct navigation,
 * and a visible fallback popup with a direct clickable link and copyable URL.
 */
export async function downloadZipFile(
  filename: string = 'dose_update_new.zip',
  onStatusChange?: (status: 'idle' | 'downloading' | 'success' | 'error', message?: string) => void
): Promise<boolean> {
  const fullUrl = typeof window !== 'undefined' 
    ? `${window.location.origin}/${filename}`
    : `/${filename}`;

  try {
    if (onStatusChange) onStatusChange('downloading', 'جاري تجهيز وتنزيل ملف التحديث...');

    // Attempt blob fetch
    const response = await fetch(`/${filename}?t=${Date.now()}`);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const blob = await response.blob();
    const blobUrl = window.URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = blobUrl;
    link.setAttribute('download', filename);
    link.setAttribute('target', '_blank');
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    
    setTimeout(() => {
      try {
        document.body.removeChild(link);
        window.URL.revokeObjectURL(blobUrl);
      } catch {
        // ignore cleanup error
      }
    }, 4000);

    if (onStatusChange) onStatusChange('success', 'تم بدء تنزيل الملف! إذا لم يبدأ التنزيل تلقائياً، استخدم الرابط المباشر أدناه.');
    showDownloadDialog(filename, fullUrl);
    return true;
  } catch (err: any) {
    console.warn('Download fetch/blob failed, using direct navigation fallback:', err);
    showDownloadDialog(filename, fullUrl);
    if (onStatusChange) onStatusChange('error', 'يرجى فتح الرابط المباشر في نافذة جديدة للتنزيل.');
    return false;
  }
}

function showDownloadDialog(filename: string, fullUrl: string) {
  if (typeof document === 'undefined') return;
  
  // Remove existing banner if present
  const existing = document.getElementById('dose-download-helper-modal');
  if (existing) existing.remove();

  const modal = document.createElement('div');
  modal.id = 'dose-download-helper-modal';
  modal.className = 'fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4';
  modal.innerHTML = `
    <div class="bg-slate-900 border border-teal-500/50 rounded-2xl max-w-lg w-full p-6 text-white shadow-2xl relative text-right" dir="rtl">
      <div class="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
        <h3 class="text-base font-bold text-teal-400 flex items-center gap-2">
          <span>📦</span>
          <span>تحميل حزمة التحديث البرمجية (${filename})</span>
        </h3>
        <button id="close-dl-modal" class="text-slate-400 hover:text-white p-1 rounded-lg text-lg leading-none cursor-pointer">&times;</button>
      </div>

      <p class="text-xs text-slate-300 leading-relaxed mb-4">
        إذا منع متصفحك أو إطار المعاينة التنزيل التلقائي، يمكنك تحميل الملف مباشرة أو نسخ الرابط وفتحه في متصفحك:
      </p>

      <div class="flex flex-col gap-3 mb-4">
        <a 
          href="${fullUrl}" 
          download="${filename}"
          target="_blank" 
          rel="noopener noreferrer"
          class="flex items-center justify-center gap-2 w-full py-3 px-4 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-600 hover:to-emerald-700 text-white font-bold text-sm shadow-lg transition-all"
        >
          <span>⬇️ اضغط هنا لبدء التنزيل المباشر (19.4 MB)</span>
        </a>

        <div class="flex items-center gap-2 bg-slate-950 p-2.5 rounded-xl border border-slate-800">
          <input 
            id="dl-url-input" 
            type="text" 
            readonly 
            value="${fullUrl}" 
            class="bg-transparent text-xs text-slate-400 flex-1 outline-none font-mono" 
            dir="ltr"
          />
          <button 
            id="copy-dl-btn" 
            class="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs font-bold text-teal-300 rounded-lg transition-colors cursor-pointer"
          >
            نسخ الرابط
          </button>
        </div>
      </div>

      <div class="text-[11px] text-slate-400 leading-normal bg-slate-800/40 p-3 rounded-xl border border-slate-700/50">
        💡 <strong>طريقة الترقية على Vercel / GitHub:</strong><br/>
        1. قم بتنزيل الملف <code>${filename}</code>.<br/>
        2. فك ضغط الملف وضع المحتويات في مجلد المشروع.<br/>
        3. ارفع الملفات إلى GitHub لتتولى Vercel التحديث تلقائياً.
      </div>
    </div>
  `;

  document.body.appendChild(modal);

  const closeBtn = modal.querySelector('#close-dl-modal');
  if (closeBtn) closeBtn.addEventListener('click', () => modal.remove());

  modal.addEventListener('click', (e) => {
    if (e.target === modal) modal.remove();
  });

  const copyBtn = modal.querySelector('#copy-dl-btn');
  const inputEl = modal.querySelector('#dl-url-input') as HTMLInputElement | null;
  if (copyBtn && inputEl) {
    copyBtn.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(inputEl.value);
        copyBtn.textContent = 'تم النسخ!';
        setTimeout(() => { copyBtn.textContent = 'نسخ الرابط'; }, 2000);
      } catch {
        inputEl.select();
        document.execCommand('copy');
        copyBtn.textContent = 'تم النسخ!';
        setTimeout(() => { copyBtn.textContent = 'نسخ الرابط'; }, 2000);
      }
    });
  }
}

