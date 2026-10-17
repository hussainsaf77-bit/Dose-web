/**
 * Robust file downloader for Web and mobile iframes.
 * Overcomes iframe download restrictions by fetching as Blob and triggering DOM click.
 */
export async function downloadZipFile(
  filename: string = 'dose_update_new.zip',
  onStatusChange?: (status: 'idle' | 'downloading' | 'success' | 'error', message?: string) => void
): Promise<boolean> {
  try {
    if (onStatusChange) onStatusChange('downloading', 'جاري تحميل ملف التحديث...');
    
    // Attempt blob fetch to bypass iframe download restriction
    const response = await fetch(`/${filename}?t=${Date.now()}`);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const blob = await response.blob();
    const blobUrl = window.URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = blobUrl;
    link.setAttribute('download', filename);
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
    }, 2000);

    if (onStatusChange) onStatusChange('success', 'تم بدء تنزيل الملف إلى جهازك بنجاح!');
    return true;
  } catch (err: any) {
    console.warn('Blob download fallback:', err);
    // Fallback: direct window navigation
    try {
      window.location.href = `/${filename}`;
      if (onStatusChange) onStatusChange('success', 'جاري توجيه المتصفح لتنزيل الملف...');
      return true;
    } catch (e2) {
      if (onStatusChange) onStatusChange('error', 'تعذر التنزيل التلقائي داخل المعاينة');
      return false;
    }
  }
}
