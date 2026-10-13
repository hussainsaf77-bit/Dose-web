import { MANUAL_LAB_TEST_OPTIONS, UserManualRow, PatientDemographics, getTestRefRangeForPatient } from '../data/manualLabOptions';
import { ParsedClinicalReport, ParsedLabItem } from './medicalOcrParser';

export function evaluateUserManualLabRows(
  rows: UserManualRow[],
  demographics?: PatientDemographics
): ParsedClinicalReport {
  const validRows = rows.filter(r => r.name.trim() && r.value.trim());

  if (validRows.length === 0) {
    return {
      isValidReport: false,
      validationError: 'NO_DATA',
      testName: 'لم يتم إدخال أي تحاليل',
      clinicalSummaryTitle: 'يرجى اختيار تحليل واحد على الأقل وإدخال نتيجته',
      urgencyLevel: 'normal',
      items: [],
      detailedExplanation: 'يرجى اختيار اسم التحليل من القائمة، وتحديد الوحدة، وإدخال القيمة الرقمية للتحليل.',
      recommendations: ['اختر اسم الفحص من القائمة.', 'أدخل النتيجة الرقمية.', 'انقر زر إضافة التحليل ثم زر التحليل.']
    };
  }

  const items: ParsedLabItem[] = [];

  for (const row of validRows) {
    // Find matching definition
    const def = MANUAL_LAB_TEST_OPTIONS.find(o => o.id === row.testId || o.nameAr === row.name || o.nameEn === row.name);

    // Dynamic ref range tailored to patient gender and age
    const tailored = def ? getTestRefRangeForPatient(def, demographics) : null;

    // Clean value
    const cleanValStr = row.value.trim();
    const isLessThan = cleanValStr.startsWith('<') || cleanValStr.includes('أقل من');
    const isGreaterThan = cleanValStr.startsWith('>') || cleanValStr.includes('أكبر من');

    // Extract numeric float
    const numMatch = cleanValStr.replace(/[^0-9.]/g, '');
    const num = parseFloat(numMatch);

    let status: 'normal' | 'low' | 'high' | 'critical' = 'normal';
    const effectiveRange = row.range || (tailored ? tailored.range : (def ? def.defaultRange : 'حسب المرجع المرفق'));
    const effectiveUnit = row.unit || (def ? def.defaultUnit : '');

    const minNorm = tailored ? tailored.minNormal : (def ? def.minNormal : 0);
    const maxNorm = tailored ? tailored.maxNormal : (def ? def.maxNormal : 0);
    const critLow = tailored?.criticalLow ?? def?.criticalLow;
    const critHigh = tailored?.criticalHigh ?? def?.criticalHigh;

    if (!isNaN(num)) {
      if (def) {
        if (critLow !== undefined && num < critLow) status = 'critical';
        else if (critHigh !== undefined && num > critHigh) status = 'critical';
        else if (num < minNorm) status = isLessThan ? 'normal' : 'low';
        else if (num > maxNorm) status = isGreaterThan ? 'high' : 'high';
        else status = 'normal';

        if (isLessThan && num <= minNorm) status = 'low';
      } else {
        // Evaluate from range string: e.g. "70 - 100" or "< 140"
        const rangeNums = effectiveRange.match(/([0-9]+(?:\.[0-9]+)?)/g);
        if (rangeNums && rangeNums.length >= 2) {
          const rMin = parseFloat(rangeNums[0]);
          const rMax = parseFloat(rangeNums[1]);
          if (!isNaN(rMin) && !isNaN(rMax) && rMin < rMax) {
            if (num < rMin * 0.5) status = 'critical';
            else if (num > rMax * 2) status = 'critical';
            else if (num < rMin) status = 'low';
            else if (num > rMax) status = 'high';
          }
        } else if (effectiveRange.includes('<') && rangeNums && rangeNums.length >= 1) {
          const maxVal = parseFloat(rangeNums[0]);
          if (num > maxVal) status = 'high';
        }
      }
    }

    let clinicalNote = '';
    if (def) {
      clinicalNote = def.explanationNote(num, status, effectiveUnit);
      if (tailored?.note && status !== 'normal') {
        clinicalNote += ` (${tailored.note})`;
      }
    } else {
      if (status === 'high') clinicalNote = `قيمة (${row.name}) مرتفعة عن النطاق المرجعي (${effectiveRange}).`;
      else if (status === 'low') clinicalNote = `قيمة (${row.name}) منخفضة عن النطاق المرجعي (${effectiveRange}).`;
      else if (status === 'critical') clinicalNote = `قيمة حرجة تستوجب تقييماً طبياً عاجلاً لمؤشر (${row.name}).`;
      else clinicalNote = `قيمة (${row.name}) طبيعية ومتوازنة ضمن النطاق المرجعي (${effectiveRange}).`;
    }

    items.push({
      name: def ? `${def.nameAr}` : row.name,
      value: `${cleanValStr}${effectiveUnit ? ` ${effectiveUnit}` : ''}`,
      numericValue: isNaN(num) ? undefined : num,
      referenceRange: effectiveRange,
      unit: effectiveUnit,
      status,
      clinicalNote
    });
  }

  // Clinical Summary & Theme Analysis
  const abnormalItems = items.filter(i => i.status !== 'normal');
  const criticalItems = items.filter(i => i.status === 'critical');
  const hasHighHoma = items.some(i => (i.name.includes('HOMA-IR') || i.name.includes('مقاومة الإنسولين')) && i.status === 'high');
  const hasLowFerritin = items.some(i => (i.name.includes('Ferritin') || i.name.includes('مخزون الحديد')) && i.status === 'low');
  const hasLowVitD = items.some(i => (i.name.includes('Vitamin D') || i.name.includes('فيتامين د')) && i.status === 'low');

  let urgencyLevel: 'normal' | 'medium' | 'high' | 'critical' = 'normal';
  if (criticalItems.length > 0) urgencyLevel = 'critical';
  else if (abnormalItems.length >= 2) urgencyLevel = 'high';
  else if (abnormalItems.length === 1) urgencyLevel = 'medium';

  let summaryTitle = '';
  const explanationParagraphs: string[] = [];
  const recommendations: string[] = [];

  if (hasHighHoma && hasLowFerritin && hasLowVitD) {
    summaryTitle = 'ثلاثي اضطراب الأيض: مقاومة إنسولين مرتفعة مع استنزاف مخزون الحديد ونقص فيتامين د3';
    explanationParagraphs.push(
      'يُظهر التقييم السريري الدقيق نمطاً أيضياً وغذائياً مترابطاً: ارتفاع مقاومة الإنسولين الخلوية (HOMA-IR)، مترافقاً مع استنزاف شديد في مخازن الحديد (Ferritin) ونقص حاد في فيتامين د3.'
    );
    explanationParagraphs.push(
      'الأثر السريري المباشر: يفسر هذا المزيج تماماً الشعور بالإرهاق المستمر، تساقط الشعر، الخمول البدني، بطء الحرق، وصعوبة نزول الوزن.'
    );
    recommendations.push('💊 البدء الفوري بكورس تعويضي لمخزون الحديد (مكملات حديد عالية الامتصاص مثل Ferrous Bisglycinate بعد استشارة الطبيب).');
    recommendations.push('☀️ تعويض نقص فيتامين د3 بجرعة علاجية (50,000 وحدة دولية أسبوعياً لمدة 8 أسابيع بعد وجبة دسمة، يعقبها جرعة وقائية).');
    recommendations.push('🥗 اتباع حمية منخفضة المؤشر الجلايسيمي (Low GI) وتقليل السكريات والنشويات المكررة مع رياضة المقاومة لتحسين حساسية مستقبلات الإنسولين.');
    recommendations.push('🩺 مراجعة طبيب الغدد الصماء والباطنية لمتابعة الحالة واستبعاد تكيس المبايض أو متلازمة الأيض.');
  } else if (abnormalItems.length > 0) {
    summaryTitle = `تقرير التحاليل المدخلة: تم رصد ${abnormalItems.length} مؤشر خارج النطاق الطبيعي من أصل ${items.length}`;
    explanationParagraphs.push(
      `تمت مراجعة وتحليل كافة الفحوصات المدخلة يدوياً (${items.length} تحاليل): تبين وجود ${abnormalItems.length} فحص يستدعي الانتباه الطبي والمتابعة السريرية.`
    );
    abnormalItems.forEach(item => {
      if (item.clinicalNote) {
        explanationParagraphs.push(`• ${item.name}: ${item.clinicalNote}`);
      }
    });
    recommendations.push('عرض التقرير على الطبيب المعالج لمطابقة النتائج مع الأعراض السريرية والتاريخ المرضي.');
    recommendations.push('إعادة فحص المؤشرات غير الطبيعية بعد فترة زمنية مناسبة لتقييم الاستجابة.');
    recommendations.push('الاهتمام بالتغذية الصحية المتوازنة وشرب كميات كافية من الماء وممارسة النشاط البدني المنتظم.');
  } else {
    summaryTitle = `كافة التحاليل المدخلة (${items.length} تحاليل) سليمة وضمن النطاق الطبيعي المثالي 🟢`;
    explanationParagraphs.push(
      `تمت مراجعة جميع الفحوصات المخبرية المدخلة (${items.length} فحص) ومقارنتها بالنطاقات المرجعية الدولية المعتمدة: أظهرت جميعها قيماً متوازنة وسليمة تعكس كفاءة واستقراراً في وظائف الجسم الحيوية.`
    );
    items.forEach(item => {
      if (item.clinicalNote) {
        explanationParagraphs.push(`• ${item.name}: ${item.clinicalNote}`);
      }
    });
    recommendations.push('الحفاظ على نمط الحياة الصحي والنشاط البدني المنتظم لتعزيز هذه المؤشرات الممتازة.');
    recommendations.push('إجراء الفحوصات الدورية الروتينية سنوياً للاطمئنان المستمر.');
  }

  const demoTag = demographics && (demographics.gender || demographics.age)
    ? ` (المريض: ${demographics.gender === 'female' ? 'أنثى' : demographics.gender === 'male' ? 'ذكر' : 'غير محدد'}${demographics.age ? `، ${demographics.age} سنة` : ''})`
    : '';

  return {
    isValidReport: true,
    testName: `تقرير الفحوصات المخبرية المدخلة يدوياً (${items.length} فحص)${demoTag}`,
    clinicalSummaryTitle: summaryTitle,
    urgencyLevel,
    items,
    detailedExplanation: explanationParagraphs.join('\n\n'),
    recommendations
  };
}
