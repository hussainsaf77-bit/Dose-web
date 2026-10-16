#!/bin/bash
set -e

echo "=============================================="
echo "🚀 تحديث منصة جرعة (Dose v3.6 - Lab & Metabolism)"
echo "=============================================="

# Go to repo directory
cd "$(dirname "$0")"

FOUND_ZIP=""

# Search common Android / Termux download paths
CANDIDATES=(
  "$HOME/storage/downloads/dose_pediatric_update.zip"
  "$HOME/storage/shared/Download/dose_pediatric_update.zip"
  "/sdcard/Download/dose_pediatric_update.zip"
  "/sdcard/Downloads/dose_pediatric_update.zip"
  "$HOME/Downloads/dose_pediatric_update.zip"
  "./dose_pediatric_update.zip"
  "../dose_pediatric_update.zip"
  "$HOME/storage/downloads/dose_v36_final.zip"
  "$HOME/storage/shared/Download/dose_v36_final.zip"
  "/sdcard/Download/dose_v36_final.zip"
  "/sdcard/Downloads/dose_v36_final.zip"
  "$HOME/Downloads/dose_v36_final.zip"
  "./dose_v36_final.zip"
  "../dose_v36_final.zip"
)

for f in "${CANDIDATES[@]}"; do
  if [ -f "$f" ]; then
    FOUND_ZIP="$f"
    break
  fi
done

# If not found exact name, search for any dose_*.zip in downloads
if [ -z "$FOUND_ZIP" ]; then
  for d in "/sdcard/Download" "$HOME/storage/downloads" "$HOME/Downloads"; do
    MATCH=$(ls -t "$d"/dose_*.zip 2>/dev/null | head -n 1 || true)
    if [ -n "$MATCH" ] && [ -f "$MATCH" ]; then
      FOUND_ZIP="$MATCH"
      break
    fi
  done
fi

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
git commit -m "feat: deploy pediatric vision AI with on-device OCR and instant dosing" || true
git push origin main --force || git push origin master --force || git push origin HEAD --force

echo ""
echo "=============================================="
echo "✅ تم التحديث والدفع إلى GitHub بنجاح تام!"
echo "🎯 يقوم Vercel الآن بنشر التحديث تلقائياً خلال 30 ثانية."
echo "افتح موقعك: https://web-dose.vercel.app"
echo "=============================================="
