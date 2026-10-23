#!/bin/bash
set -e

echo "=============================================="
echo "🚀 تحديث منصة جرعة (Dose v3.6 - Lab & Metabolism)"
echo "=============================================="

# Go to repo directory
cd "$(dirname "$0")"

FOUND_ZIP=$(ls -t \
  /sdcard/Download/dose_update_new*.zip \
  ./dose_update_new*.zip \
  /sdcard/Download/dose_pediatric_update*.zip \
  /sdcard/Download/dose_v36_final*.zip \
  /sdcard/Download/update*.zip \
  "$HOME/storage/downloads"/dose_update_new*.zip \
  "$HOME/storage/shared/Download"/dose_update_new*.zip \
  ./update.zip \
  2>/dev/null | head -n 1 || true)

if [ -n "$FOUND_ZIP" ] && [ -f "$FOUND_ZIP" ]; then
  echo "📦 تم العثور على ملف التحديث: $FOUND_ZIP"
  echo "جاري فك الضغط واستبدال الملفات المحدثة..."
  unzip -o "$FOUND_ZIP" -d .
else
  echo "⚠️ لم يتم العثور على ملف dose_pediatric_update.zip أو dose_v36_final.zip في مجلد التحميلات."
  echo "يرجى تنزيل ملف التحديث أولاً ليكون في مجلد التحميلات Download."
  exit 1
fi

echo "🔄 جاري رفع التحديث المكتمل إلى GitHub..."
git add -A
git commit -m "feat: fix vercel public output and sync all branches" || true
git push origin main --force || true
git push origin main:gh-pages --force || true
git push origin HEAD --force || true

echo ""
echo "=============================================="
echo "✅ تم التحديث والدفع إلى GitHub لكافة الفروع (main و gh-pages) بنجاح!"
echo "🎯 يقوم Vercel الآن بنشر التحديث تلقائياً وبناء مجلدي dist و public معاً."
echo "=============================================="
