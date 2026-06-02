const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawn } = require('child_process');
const { randomUUID } = require('crypto');

/**
 * UTILS & FORMATTERS
 */

function escapeHtml(value) {
  if (value === null || value === undefined) return '';
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function formatDateNumeric(dateString) {
  if (!dateString) return '/';
  const d = new Date(dateString);
  if (Number.isNaN(d.getTime())) return String(dateString);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${dd}-${mm}-${yyyy}`;
}

function formatDateTimeForDisplay(dateString) {
  if (!dateString) return '/';
  const d = new Date(dateString);
  if (Number.isNaN(d.getTime())) return String(dateString);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  const hh = String(d.getHours()).padStart(2, '0');
  const min = String(d.getMinutes()).padStart(2, '0');
  return `${dd}/${mm}/${yyyy} ${hh}:${min}`;
}

function formatTime(dateString) {
  if (!dateString) return '00:00';
  const d = new Date(dateString);
  if (Number.isNaN(d.getTime())) return '00:00';
  const hh = String(d.getHours()).padStart(2, '0');
  const min = String(d.getMinutes()).padStart(2, '0');
  return `${hh}:${min}`;
}

function dateToFullArabicWords(dateString) {
  if (!dateString) return '................';
  const d = new Date(dateString);
  const days = ["الأحد", "الاثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"];
  const months = ["جانفي", "فيفري", "مارس", "أفريل", "ماي", "جوان", "جويلية", "أوت", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"];

  const dayName = days[d.getDay()];
  const dayNum = d.getDate();
  const monthName = months[d.getMonth()];
  const year = d.getFullYear();

  const yearMap = {
    2024: "ألفين وأربعة وعشرون",
    2025: "ألفين وخمسة وعشرون",
    2026: "ألفين وستة وعشرون",
    2027: "ألفين وسبعة وعشرون",
    2028: "ألفين وثمانية وعشرون",
    2029: "ألفين وتسعة وعشرون",
    2030: "ألفين وثلاثون"
  };
  const yearWords = yearMap[year] || year.toString();

  return `${dayName} ${dayNum} من شهر ${monthName} عام ${yearWords}`;
}

function mapRoleToArabic(roleValue) {
  const role = String(roleValue || '').trim().toLowerCase();
  if (!role) return 'عضو';

  if (role.includes('president') || role.includes('président') || role.includes('رئيس')) {
    return 'رئيس';
  }
  if (role.includes('secretaire') || role.includes('secrétaire') || role.includes('secretaire') || role.includes('أمين')) {
    return 'أمين اللجنة';
  }
  if (role.includes('membre') || role.includes('عضو')) {
    return 'عضو';
  }
  return escapeHtml(roleValue);
}

function mapFonctionToArabic(fonctionValue) {
  if (!fonctionValue) return 'عضو';
  const fonction = String(fonctionValue).trim().toLowerCase();
  if (fonction.includes('president') || fonction.includes('président')) return 'رئيس';
  if (fonction.includes('secretaire') || fonction.includes('secrétaire')) return 'أمين اللجنة';
  if (fonction.includes('membre')) return 'عضو';
  return fonctionValue;
}

function getLatestAnnounce(announces) {
  if (!announces || announces.length === 0) return null;
  return announces.reduce((latest, current) => {
    const latestDate = new Date(latest.Date_Publication);
    const currentDate = new Date(current.Date_Publication);
    return currentDate > latestDate ? current : latest;
  });
}

function buildOvertureTable({ op, acceptedSuppliers }) {
  const sortedSuppliers = [...acceptedSuppliers].sort((a, b) => {
    const dateA = new Date(a.dateDepot);
    const dateB = new Date(b.dateDepot);
    return dateA - dateB;
  });

  const rows = sortedSuppliers.map((supplier, index) => {
    const rank = index + 1;
    const raisonSocial = supplier.RaisonSocial;
    const nom = supplier.Nom;
    const address = supplier.Adresse
    const nif = supplier.Nif;
    const rc = supplier.Rc;
    const dateDepot = supplier.dateDepot;

    return `<tr>
      <td class="center">${rank}</td>
      <td class="center">
        ${escapeHtml(raisonSocial)}<br/>
        <span class="address-details">-${escapeHtml(nom)}-</span>
        <br/>
        <span class="address-details">-${escapeHtml(address)}-</span>
      </td>
      <td class="center">${escapeHtml(formatDateNumeric(dateDepot))}</td>
      <td class="right">تقرير مالي<br/>تقرير تقني<br/>وثائق ادارية</td>
      <td class="center">—</td>
    </tr>`;
  });

  return ` <table class="overture-table">
    <thead>
      <tr>
        <th>الرتبة</th>
        <th>اسم و عنوان المتعهد</th>
        <th>تاريخ و وقت الإيداع</th>
        <th>محتوى الظرف</th>
        <th>الملاحظات</th>
      </tr>
    </thead>
    <tbody>
      ${rows.join('') || `<tr><td colspan="5" class="center">لا توجد عروض مقبولة</td></tr>`}
    </tbody>
    </table> `;
}

function buildOvertureSecondPage({ op, acceptedSuppliers, totalSuppliers }) {
  const now = new Date();
  const currentDateFormatted = formatDateNumeric(now);
  const currentTime = formatTime(now);

  const announces = op?.announces || [];
  const latestAnnounce = getLatestAnnounce(announces);

  const operationNumber = op?.Numero || '/';
  const journalName = latestAnnounce?.Journal || '/';
  const publicationDate = latestAnnounce?.Date_Publication ? formatDateNumeric(latestAnnounce.Date_Publication) : '/';
  const announcementNumber = latestAnnounce?.Numero || '/';
  const deadlineDays = latestAnnounce?.Delai || '/';

  const acceptedCount = acceptedSuppliers.length;

  return `
  <div class="second-page">
      <p class="opening-statement">
        مع تسجيل حضور <strong>${acceptedCount}</strong> متعهدين مشاركين في هذه العملية في هذه الجلسة العلنية
      </p>
      <p class="opening-statement">
        بعد افتتاح الجلسة من طرف رئيس اللجنة، و التذكير بموضوع الصفقة و مراحل العملية منذ الإعلان عنها إلى غاية تاريخ و وقت فتح الأظرفة، و بعد التثبت من النصاب القانوني للجنة، شرع رئيس اللجنة في عملية فتح الأظرفة.
      </p>
      
      <p class="operation-details">
        الاعلان عن طلب العروض الوطني المفتوح مع اشتراط قدرات دنيا رقم <strong>${escapeHtml(operationNumber)}</strong> و الاشهار عنه في جريدة <strong>${escapeHtml(journalName)}</strong> بتاريخ <strong>${publicationDate}</strong> و المسجل تحت رقم <strong>${escapeHtml(announcementNumber)}</strong> حيث حددت مدة تحضير العروض ب <strong>${deadlineDays}</strong> ابتداء من أول نشر هذا الاعلان في الصحف الوطنية.
      </p>
      
      <p class="suppliers-stats">
        - سجلنا سحب <strong>${totalSuppliers}</strong> ملفا من طرف المتعاملين الاقتصاديين، و استقبلت اللجنة <strong>${acceptedCount}</strong> أظرفة لمتعهد بين المشاركين في هذه العملية.
      </p>
      
      <p class="verification-statement">
        - و بعد التثبت من صحة تسجيل العروض في السجل المخصص لذلك بدأت عملية فتح الأظرفة حسب ترتيب تسجيلها و تسجيل وثائقها حسب ما يلي:
      </p>
      
      <h3 class="table-main-title">جدول فتح الأظرفة حسب ترتيب التسجيل</h3>
      
      <div class="table-wrapper">
        ${buildOvertureTable({ op, acceptedSuppliers })}
      </div>
      
      <!-- Administration Stamp Placeholder -->
      <div class="signature-block">
        <div class="signature-left">
          <div class="signature-line">حرر في بسكرة في: ${currentDateFormatted}</div>
          <div class="signature-line">امضاء رئيس اللجنة</div>
          <div class="signature-space-large"></div>
        </div>
      </div>
    </div>
  `;
}

function buildOpeningTable({ op, lot }) {
  const suppliers = Array.isArray(op?.suppliers) ? op.suppliers : [];
  const evaluations = Array.isArray(op?.evaluations) ? op.evaluations : [];

  const rows = suppliers.map(s => {
    const supplierId = s?.Id ?? s?.id;
    const lotId = lot?.Id ?? lot?.id ?? null;
    const evalInfo = evaluations.find(e => {
      if (!e) return false;
      const sameSupplier = e.SupplierID === supplierId;
      const sameLot = lotId ? e.LotID === lotId : !e.LotID;
      return sameSupplier && sameLot;
    });

    const admin = evalInfo ? (evalInfo.AdminNote === 1 ? 'مقبول' : 'مرفوض') : '/';
    const tech = evalInfo ? (evalInfo.TechnicalNote?.toString() || '/') : '/';
    const fin = evalInfo ? (evalInfo.FinancialNote?.toString() || '/') : '/';
    const notes = evalInfo?.RejectionReason || '/';

    return `<tr>
      <td class="right">${escapeHtml(s?.Nom || '/')}</td>
      <td class="center">${escapeHtml(admin)}</td>
      <td class="center">${escapeHtml(tech)}</td>
      <td class="center">${escapeHtml(fin)}</td>
      <td class="right">${escapeHtml(notes)}</td>
    </tr>`;
  });

  return `<table>
    <thead>
      <tr>
        <th>المتعهد</th>
        <th>الملف الإداري</th>
        <th>العلامة التقنية</th>
        <th>العلامة المالية</th>
        <th>ملاحظات</th>
      </tr>
    </thead>
    <tbody>
      ${rows.join('') || `<tr><td colspan="5" class="center">/</td></tr>`}
    </tbody>
    </table> `;
}

function buildTechnicalTable({ op, lot }) {
  const evaluations = Array.isArray(op?.evaluations) ? op.evaluations : [];
  const lotId = lot?.Id ?? lot?.id ?? null;
  const evals = evaluations
    .filter(e => (lotId ? e?.LotID === lotId : !e?.LotID))
    .sort((a, b) => (b?.TechnicalNote || 0) - (a?.TechnicalNote || 0));

  const rows = evals.map(e => `<tr>
    <td class="right">${escapeHtml(e?.Nom || '/')}</td>
    <td class="center">${escapeHtml(e?.AdminNote === 1 ? 'مقبول' : 'مرفوض')}</td>
    <td class="center">${escapeHtml(e?.TechnicalNote?.toString() || '/')}</td>
    <td class="center">${escapeHtml(e?.AdminNote === 1 ? 'مؤهل' : 'غير مؤهل')}</td>
  </tr>`);

  return `<table>
    <thead>
      <tr>
        <th>المتعهد</th>
        <th>المسار الإداري</th>
        <th>العلامة التقنية</th>
        <th>الحالة</th>
      </tr>
    </thead>
    <tbody>
      ${rows.join('') || `<tr><td colspan="4" class="center">/</td></tr>`}
    </tbody>
    </table> `;
}

function buildFinancialTable({ op, lot }) {
  const evaluations = Array.isArray(op?.evaluations) ? op.evaluations : [];
  const lotId = lot?.Id ?? lot?.id ?? null;
  const evals = evaluations
    .filter(e => (lotId ? e?.LotID === lotId : !e?.LotID))
    .sort((a, b) => (b?.FinancialNote || 0) - (a?.FinancialNote || 0));

  const rows = evals.map(e => `<tr>
    <td class="right">${escapeHtml(e?.Nom || '/')}</td>
    <td class="center">${escapeHtml(e?.AdminNote === 1 ? 'مقبول' : 'مرفوض')}</td>
    <td class="center">${escapeHtml(e?.FinancialNote?.toString() || '/')}</td>
    <td class="center">${escapeHtml(e?.AdminNote === 1 ? 'مؤهل' : 'غير مؤهل')}</td>
  </tr>`);

  return `<table>
    <thead>
      <tr>
        <th>المتعهد</th>
        <th>المسار الإداري</th>
        <th>العلامة المالية</th>
        <th>الحالة</th>
      </tr>
    </thead>
    <tbody>
      ${rows.join('') || `<tr><td colspan="4" class="center">/</td></tr>`}
    </tbody>
    </table> `;
}

function buildOvertureByLot({ op, lot }) {
  const evaluations = Array.isArray(op?.evaluations) ? op.evaluations : [];
  const suppliers = Array.isArray(op?.suppliers) ? op.suppliers : [];

  const acceptedSupplierIds = evaluations
    .filter(e => e.AdminNote === 1)
    .map(e => e.SupplierID);

  const acceptedSuppliers = suppliers.filter(s => acceptedSupplierIds.includes(s.Id || s.id));
  const totalSuppliers = suppliers.length;

  return buildOvertureSecondPage({ op, acceptedSuppliers, totalSuppliers });
}

// New function for PV_EVALUATION detailed tables
function buildDetailedTechnicalTable({ op, lot }) {
  const evaluations = Array.isArray(op?.evaluations) ? op.evaluations : [];
  const suppliers = Array.isArray(op?.suppliers) ? op.suppliers : [];
  const lotId = lot?.Id ?? lot?.id ?? null;

  // Filter evaluations for this lot
  const lotEvaluations = evaluations.filter(e => (lotId ? e?.LotID === lotId : !e?.LotID));

  // Enrich with supplier details
  const enriched = lotEvaluations.map(e => {
    const supplier = suppliers.find(s => (s.Id || s.id) === e.SupplierID);
    return {
      ...e,
      RaisonSocial: supplier?.RaisonSocial || e?.Nom || '/',
      NomCommercial: supplier?.Nom || e?.Nom || '/',
      LotNumber: lot?.NumeroLot || lot?.Numero || lot?.id || '1'
    };
  }).sort((a, b) => (b?.TechnicalNote || 0) - (a?.TechnicalNote || 0));

  const rows = enriched.map((e, idx) => `<tr>
    <td class="center">${idx + 1}</td>
    <td class="right">${escapeHtml(e.RaisonSocial)}<br/><span class="address-details">${escapeHtml(e.NomCommercial)}</span></td>
    <td class="center">${escapeHtml(e.LotNumber)}</td>
    <td class="center">${escapeHtml(e.TechnicalNote?.toString() || '/')}</td>
  </tr>`);

  return `<table>
    <thead>
      <tr>
        <th>رقم الظرف</th>
        <th>الاسم التجاري للمتعهد</th>
        <th>رقم الحصة</th>
        <th>العلامة النهائية (تقني)</th>
      </tr>
    </thead>
    <tbody>
      ${rows.join('') || `<tr><td colspan="4" class="center">لا توجد بيانات</td></tr>`}
    </tbody>
    </table> `;
}

function buildDetailedFinancialTable({ op, lot }) {
  const evaluations = Array.isArray(op?.evaluations) ? op.evaluations : [];
  const suppliers = Array.isArray(op?.suppliers) ? op.suppliers : [];
  const lotId = lot?.Id ?? lot?.id ?? null;

  const lotEvaluations = evaluations.filter(e => (lotId ? e?.LotID === lotId : !e?.LotID));

  const enriched = lotEvaluations.map(e => {
    const supplier = suppliers.find(s => (s.Id || s.id) === e.SupplierID);
    return {
      ...e,
      RaisonSocial: supplier?.RaisonSocial || e?.Nom || '/',
      NomCommercial: supplier?.Nom || e?.Nom || '/',
      LotNumber: lot?.NumeroLot || lot?.Numero || lot?.id || '1'
    };
  }).sort((a, b) => (b?.FinancialNote || 0) - (a?.FinancialNote || 0));

  const rows = enriched.map((e, idx) => `<tr>
    <td class="center">${idx + 1}</td>
    <td class="right">${escapeHtml(e.RaisonSocial)}<br/><span class="address-details">${escapeHtml(e.NomCommercial)}</span></td>
    <td class="center">${escapeHtml(e.LotNumber)}</td>
    <td class="center">${escapeHtml(e.FinancialNote?.toString() || '/')}</td>
  </tr>`);

  return `<table>
    <thead>
      <tr>
        <th>رقم الظرف</th>
        <th>الاسم التجاري للمتعهد</th>
        <th>رقم الحصة</th>
        <th>العلامة النهائية (مالي)</th>
      </tr>
    </thead>
    <tbody>
      ${rows.join('') || `<tr><td colspan="4" class="center">لا توجد بيانات</td></tr>`}
    </tbody>
    </table> `;
}

function buildDecisionTable({ op, lot }) {
  const evaluations = Array.isArray(op?.evaluations) ? op.evaluations : [];
  const suppliers = Array.isArray(op?.suppliers) ? op.suppliers : [];
  const lotId = lot?.Id ?? lot?.id ?? null;

  const lotEvaluations = evaluations.filter(e => (lotId ? e?.LotID === lotId : !e?.LotID));

  const enriched = lotEvaluations.map(e => {
    const supplier = suppliers.find(s => (s.Id || s.id) === e.SupplierID);
    const finalNote = ((e.TechnicalNote || 0) + (e.FinancialNote || 0)) / 2;
    return {
      ...e,
      RaisonSocial: supplier?.RaisonSocial || e?.Nom || '/',
      NomCommercial: supplier?.Nom || e?.Nom || '/',
      LotNumber: lot?.NumeroLot || lot?.Numero || lot?.id || '1',
      FinalNote: finalNote.toFixed(2)
    };
  }).sort((a, b) => parseFloat(b.FinalNote) - parseFloat(a.FinalNote));

  const rows = enriched.map((e, idx) => `<tr>
    <td class="center">${idx + 1}</td>
    <td class="right">${escapeHtml(e.RaisonSocial)}<br/><span class="address-details">${escapeHtml(e.NomCommercial)}</span></td>
    <td class="center">${escapeHtml(e.LotNumber)}</td>
    <td class="center">${escapeHtml(e.FinalNote)}</td>
  </tr>`);

  return `<table>
    <thead>
      <tr>
        <th>رقم الظرف</th>
        <th>الاسم التجاري للمتعهد</th>
        <th>رقم الحصة</th>
        <th>العلامة النهائية</th>
      </tr>
    </thead>
    <tbody>
      ${rows.join('') || `<tr><td colspan="4" class="center">لا توجد بيانات</td></tr>`}
    </tbody>
    </table> `;
}

function buildEvaluationByLot({ op, lot }) {
  const detailedTechnical = buildDetailedTechnicalTable({ op, lot });
  const detailedFinancial = buildDetailedFinancialTable({ op, lot });
  const decisionTable = buildDecisionTable({ op, lot });
  const lotNumber = lot.NumeroLot || lot.Numero || lot.id || '1';
  const lotDesignation = lot.Designation || '';
  const now = new Date();
  const currentDateFormatted = formatDateNumeric(now);

  return `<div class="combined-tables-container">
  <h3 class="table-title">نتائج التقييم (الحصة: ${escapeHtml(lotNumber)})</h3>
    ${lotDesignation ? `<div class="lot-designation">${escapeHtml(lotDesignation)}</div>` : ''}
    
    <div class="table-wrapper">
      <h4 class="sub-table-header">أولاً: التقييم التقني</h4>
      ${detailedTechnical}
    </div>
    
    <div class="table-wrapper">
      <h4 class="sub-table-header">ثانياً: التقييم المالي</h4>
      ${detailedFinancial}
    </div>
    
    <div class="table-wrapper">
      <h4 class="sub-table-header">ثالثاً: جدول القرار النهائي</h4>
      ${decisionTable}
    </div>
  </div>
  <div style="page-break-after: always;"></div>`;
}

function buildCommissionTable(members) {
  const presentMembers = members.filter(m => m && m.Status === 1);
  if (!presentMembers.length) return '<p class="no-data">لا توجد أعضاء في اللجنة</p>';

  const rows = presentMembers.map((m, idx) => `<tr>
    <td class="right">${escapeHtml(m.Prenom || '')} ${escapeHtml(m.Nom || '')}</td>
    <td class="center">${escapeHtml(mapFonctionToArabic(m.Fonction || m.Role || ''))}</td>
  </tr>`);

  return `<table>
    <thead>
      <tr><th>الاسم واللقب</th><th>الوظيفة</th></tr>
    </thead>
    <tbody>${rows.join('')}</tbody>
    </table>`;
}

function buildBaseHtml({ title, data, tableBuilder, type }) {
  const session = data?.session || {};
  const members = Array.isArray(data?.members) ? data.members : [];
  const operations = Array.isArray(data?.operations) ? data.operations : [];
  const needsFirstPage = type === 'PV_OUVERTURE' || type === 'PV_EVALUATION';

  const now = new Date();
  const currentDateString = now.toISOString();
  const currentDateFormatted = formatDateNumeric(now);
  const currentTimeFormatted = formatTime(now);

  const presentMembers = members.filter(m => m && m.Status === 1);
  const absentMembers = members.filter(m => m && m.Status === 0);

  let firstPageHtml = '';
  if (needsFirstPage && operations.length > 0) {
    const op = operations[0];
    const opNumber = op?.Numero || op?.OperationID || '/';
    const opSubject = op?.Objet || '';

    firstPageHtml = `
    <div class="first-page">
        <h1 class="main-doc-title">${escapeHtml(title)}</h1>
        <div class="op-reference">طلب عروض وطني مع اشتراط قدرات دنيا رقم ${escapeHtml(opNumber)}</div>

        <p class="context-body">
          في يوم ${dateToFullArabicWords(currentDateString)} ${formatDateNumeric(currentDateString)} ميلادية، 
          وعلى الساعة ${formatTime(currentDateString)}، 
          بالمكتب رقم 08 بمديرية الجامعة، ووفقا لـ:
        </p>

        <div class="legal-references">
          1- أحكام المرسوم الرئاسي رقم 15-247 المؤرخ في: 16 سبتمبر 2015 المتضمن تنظيم الصفقات العمومية، وتفويضات المرفق العام.<br/>
          2- مقررة لجنة فتح الأظرفة وتقييم العروض رقم: 94/2024 المؤرخة في: ${formatDateNumeric(currentDateString)}.<br/>
          3- المواد: 4، 28، 29، 30 و 31 من دفتر الشروط التقني لـ: طلب عروض وطني مع اشتراط قدرات دنيا رقم: ${escapeHtml(opNumber)}.<br/>
          4- محضر فتح الأظرفة لـ: طلب عروض وطني مفتوح مع اشتراط قدرات دنيا رقم: ${escapeHtml(opNumber)}، بتاريخ ${formatDateNumeric(currentDateString)}.<br/>
          5- قرار مدير جامعة بسكرة رقم : 46/2025 بتاريخ 25/05/2025 حول إنشاء لجنة لدراسة جودة المنتوج لطلب عروض وطني رقم ${escapeHtml(opNumber)}.<br/>
          6- نتائج اللجان التقنية لدراسة جودة المنتوج بتاريخ: ${formatDateNumeric(currentDateString)}.<br/>
          7- شهادة الإعفاء من الرسوم الخاصة بالحصة رقم 1 فقط لـ: طلب عروض وطني مفتوح مع اشتراط قدرات دنيا رقم: ${escapeHtml(opNumber)}، الصادرة من المديرية العامة للبحث العلمي والتطوير التكنولوجي لوزارة التعليم العالي والبحث العلمي المستلمة بتاريخ ${formatDateNumeric(currentDateString)}.
        </div>

        <p class="context-body" style="margin-top: 10px;">
          انعقد اجتماع لأعضاء لجنة فتح الأظرفة وتقييم العروض، جلسة التقييم لطلب عروض وطني مفتوح مع اشتراط قدرات دنيا رقم ${escapeHtml(opNumber)} قصد تنفيذ العملية الآتية:
        </p>

        <div class="operation-objective">${escapeHtml(opSubject)}</div>

        <div class="lots-display">
          ${(op.lots || []).map((lot, idx) => {
      const lotNumber = lot.NumeroLot || lot.Numero || '';
      const lotDesignation = lot.Designation || '';
      return `<div class="lot-row">
              <div class="lot-number">الحصة رقم ${String(idx + 1).padStart(2, '0')}: <span class="latin">${escapeHtml(lotNumber)}</span></div>
              ${lotDesignation ? `<div class="lot-designation-text">${escapeHtml(lotDesignation)}</div>` : ''}
            </div>`;
    }).join('')}
        </div>

        <div class="members-container">
          <div class="present-members">
            <div class="sig-header">بحضور أعضاء اللجنة الآتية أسماؤهم:</div>
            ${presentMembers.length > 0 ? presentMembers.map((m, idx) => `
              <div class="sig-row">
                <span class="sig-name">${idx + 1}. ${escapeHtml(m.Prenom)} ${escapeHtml(m.Nom)}</span>
                <span class="sig-role">${mapRoleToArabic(m.Role)}</span>
                <span class="sig-slot"></span>
              </div>
            `).join('') : '<div class="sig-row"><span class="sig-name">/</span><span class="sig-role"></span><span class="sig-slot"></span></div>'}
          </div>
          <div class="absent-members">
            <div class="sig-header">الغياب</div>
            ${absentMembers.length > 0 ? absentMembers.map(m => `
              <div class="sig-row">
                <span class="sig-name">- ${escapeHtml(m.Prenom)} ${escapeHtml(m.Nom)}</span>
                <span class="sig-role">${mapRoleToArabic(m.Role)}</span>
                <span class="sig-slot"></span>
              </div>
            `).join('') : '<div class="sig-row"><span class="sig-name">/</span><span class="sig-role"></span><span class="sig-slot"></span></div>'}
          </div>
        </div>
      </div>
  <div style="page-break-after: always;"></div>
`;
  }

  let evaluationsHtml = '';
  if (type === 'PV_OUVERTURE') {
    const op = operations[0];
    if (op) {
      const evaluations = Array.isArray(op?.evaluations) ? op.evaluations : [];
      const suppliers = Array.isArray(op?.suppliers) ? op.suppliers : [];

      const acceptedSupplierIds = evaluations
        .filter(e => e.AdminNote === 1)
        .map(e => e.SupplierID);

      const acceptedSuppliers = suppliers.filter(s => acceptedSupplierIds.includes(s.Id || s.id));
      const totalSuppliers = suppliers.length;

      evaluationsHtml = buildOvertureSecondPage({ op, acceptedSuppliers, totalSuppliers });
    }
  } else if (type === 'PV_EVALUATION') {
    // Build commission table section
    const commissionHtml = `
      <div class="commission-section">
        <p class="commission-decision-text">
          بموجب قرار مدير جامعة رقم 2025/46 بتاريخ ${currentDateFormatted} تم إنشاء اللجنة التالية:
        </p>
        <div class="commission-table-wrapper">
          ${buildCommissionTable(members)}
        </div>
      </div>
      <div style="page-break-after: avoid;"></div>
    `;

    const tablesHtml = operations.map(op => {
      const lots = Array.isArray(op?.lots) && op.lots.length > 0 ? op.lots : [{ id: null }];
      return lots.map(lot => tableBuilder({ op, lot })).join('');
    }).join('');

    // Add signature block at the end
    const signatureHtml = `
      <div class="signature-block">
        <div class="signature-left">
          <div class="signature-line">حرر في بسكرة في: ${currentDateFormatted}</div>
          <div class="signature-line">امضاء رئيس اللجنة</div>
          <div class="signature-space-large"></div>
        </div>
      </div>
    `;

    evaluationsHtml = commissionHtml + tablesHtml + signatureHtml;
  } else {
    evaluationsHtml = operations.map(op => {
      const lots = Array.isArray(op?.lots) && op.lots.length > 0 ? op.lots : [{ id: null }];
      return lots.map(lot => tableBuilder({ op, lot })).join('');
    }).join('');
  }

  return `<!doctype html>
  <html lang="ar" dir="rtl">
    <head>
      <meta charset="utf-8" />
      <style>
        @page { size: A4; margin: 15mm; }
        * { box-sizing: border-box; }
        body {
          font-family: "Times New Roman", Times, serif;
          color: #000;
          font-size: 13px;
          line-height: 1.5; 
        }
        .header-static { text-align: center; margin-bottom: 10px; font-weight: bold; }
        .fr-small { font-size: 11px; margin-bottom: 2px; }

        .main-doc-title { text-align: center; font-size: 24px; font-weight: 900; margin: 10px 0; }
        .op-reference { text-align: center; font-size: 18px; font-weight: bold; margin-bottom: 15px; }
        .context-body { text-align: justify; margin: 6px 0; font-size: 14px; }
        .legal-references { font-size: 11px; padding-right: 15px; margin-bottom: 10px; text-align: justify; }
        .operation-objective { padding: 15px; margin: 15px 0; font-weight: normal; font-size: 14px; text-align: center; }
        .lots-display { margin-bottom: 20px; line-height: 1.6; }
        .lot-row { margin-bottom: 10px; }
        .lot-number { font-weight: bold; }
        .lot-designation-text { font-weight: normal; margin-right: 20px; font-size: 12px; color: #333; }

        .members-container { display: table; width: 100%; table-layout: fixed; margin-top: 25px; border-collapse: separate; border-spacing: 10px 0; direction: rtl; }
        .present-members { display: table-cell; width: 60%; padding: 0 10px; border: 1px solid #000; vertical-align: top; direction: rtl; }
        .absent-members { display: table-cell; width: 40%; padding: 0 10px; border: 1px solid #000; vertical-align: top; direction: rtl; }
        .sig-header { font-weight: bold; border-bottom: 1px solid #000; margin-bottom: 10px; padding-bottom: 4px; }
        .sig-row { margin-bottom: 8px; padding: 2px 0; white-space: nowrap; }
        .sig-name { display: inline-block; width: 48%; text-align: right; vertical-align: middle; }
        .sig-role { display: inline-block; width: 20%; text-align: center; font-weight: bold; vertical-align: middle; }
        .sig-slot { display: inline-block; width: 30%; border-bottom: 1px dotted #000; height: 16px; vertical-align: middle; }

        .second-page { margin-top: 20px; }
        .opening-statement { text-align: justify; margin: 15px 0; font-size: 14px; line-height: 1.6; }
        .operation-details { text-align: justify; margin: 15px 0; font-size: 14px; line-height: 1.6; }
        .suppliers-stats { text-align: justify; margin: 15px 0; font-size: 14px; line-height: 1.6; }
        .verification-statement { text-align: justify; margin: 15px 0; font-size: 14px; line-height: 1.6; }
        .closing-statement { text-align: justify; margin: 30px 0 20px; font-size: 14px; line-height: 1.6; }

        .table-main-title { text-align: center; font-size: 16px; font-weight: bold; margin: 25px 0 15px; text-decoration: underline; }

        table { width: 100%; border-collapse: collapse; margin-top: 10px; margin-bottom: 15px; }
        th, td { border: 1px solid #000; padding: 8px; font-size: 12px; vertical-align: top; }
        th { background-color: #f2f2f2; font-weight: bold; text-align: center; }
        .center { text-align: center; vertical-align: middle; }
        .right { text-align: right; vertical-align: middle; }
        .latin { direction: ltr; font-family: "Arial", sans-serif; }

        .address-details { font-size: 11px; color: #444; font-weight : bold }
        .table-wrapper { margin-bottom: 25px; overflow-x: auto; }

        .signatures-container { margin-top: 40px; margin-bottom: 20px; }
        .signature-line { margin-bottom: 15px; display: flex; align-items: center; }
        .signature-label { font-weight: bold; margin-left: 15px; min-width: 100px; }
        .signature-space { flex: 1; border-bottom: 1px solid #000; height: 20px; }

        .combined-tables-container { margin-bottom: 20px; }
        .table-title { margin: 20px 0 10px; text-decoration: underline; font-size: 16px; }
        .sub-table-header { margin-bottom: 5px; font-weight: bold; font-size: 14px; margin-top: 15px; }
        .lot-designation { font-weight: normal; margin-bottom: 15px; font-size: 13px; color: #333; }
        
        /* Stamp placeholder styles */
        .stamp-placeholder {
          margin-top: 40px;
          margin-bottom: 20px;
          display: flex;
          justify-content: flex-start;
          align-items: center;
          gap: 20px;
          border: 1px dashed #aaa;
          padding: 10px 20px;
          width: 250px;
        }
        .stamp-text {
          font-weight: bold;
          font-size: 14px;
          color: #333;
        }
        .stamp-space {
          width: 80px;
          height: 80px;
          border: 1px solid #000;
          border-radius: 50%;
          background: repeating-linear-gradient(45deg, #ddd, #ddd 10px, #fff 10px, #fff 20px);
        }
        
        /* Commission section styles */
        .commission-section {
          margin: 20px 0 30px;
        }
        .commission-decision-text {
          text-align: justify;
          font-size: 14px;
          margin-bottom: 15px;
          font-weight: bold;
        }
        .commission-table-wrapper {
          width: 60%;
          margin: 0 auto 20px auto;
        }
        .commission-table-wrapper table {
          width: 100%;
          margin: 0 auto;
        }
        .commission-table-wrapper th,
        .commission-table-wrapper td {
          padding: 8px 12px;
        }
        
        /* Signature block styles */
        .signature-block {
          margin-top: 50px;
          margin-bottom: 30px;
          display: flex;
          justify-content: flex-end;
        }
        .signature-left {
          text-align: left;
          width: 300px;
        }
        .signature-line {
          margin-bottom: 15px;
          font-size: 14px;
          font-weight: bold;
        }
        .signature-space-large {
          margin-top: 30px;
          border-bottom: 1px solid #000;
          width: 200px;
          height: 30px;
        }
        
        .no-data {
          text-align: center;
          padding: 10px;
          color: #666;
        }
      </style>
    </head>
    <body>
      <header class="header-static">
        <div>الجمهورية الجزائرية الديمقراطية الشعبية</div>
        <div class="fr-small">République Algérienne Démocratique et Populaire</div>
        <div>وزارة التعليم العالي والبحث العلمي - جامعة محمد خيضر بسكرة</div>
        <div>لجنة فتح الأظرفة وتقييم العروض</div>
      </header>

      ${firstPageHtml}
      ${evaluationsHtml}
    </body>
  </html>`;
}

function getTemplateConfig(type) {
  switch (type) {
    case 'PV_OUVERTURE':
      return { title: 'محضر فتح الأظرفة', tableBuilder: buildOvertureByLot };
    case 'PV_EVALUATION':
      return { title: 'محضر تقييم العروض', tableBuilder: buildEvaluationByLot };
    default:
      return null;
  }
}

function runWkhtmltopdf(htmlPath) {
  const wkhtmltopdfPath = process.env.WKHTMLTOPDF_PATH || 'wkhtmltopdf';
  return new Promise((resolve, reject) => {
    const args = [
      '--encoding', 'utf-8',
      '--print-media-type',
      '--disable-smart-shrinking',
      '--margin-top', '15mm',
      '--margin-bottom', '15mm',
      htmlPath, '-'
    ];
    const child = spawn(wkhtmltopdfPath, args, { windowsHide: true });
    const chunks = [];
    const errChunks = [];
    child.stdout.on('data', d => chunks.push(d));
    child.stderr.on('data', d => errChunks.push(d));
    child.on('error', err => reject(err));
    child.on('close', code => {
      if (code !== 0) {
        const stderr = Buffer.concat(errChunks).toString('utf8');
        reject(new Error(stderr || `wkhtmltopdf exited with code ${code} `));
        return;
      }
      resolve(Buffer.concat(chunks));
    });
  });
}

const renderPvPdfController = async (req, res) => {
  const { type, data, filename } = req.body || {};
  const config = getTemplateConfig(type);

  if (!config) return res.status(400).json({ success: false, message: 'Invalid document type' });
  if (!data || !data.session) return res.status(400).json({ success: false, message: 'Missing data payload' });

  const tempDir = path.join(os.tmpdir(), 'biskra-univ-pvs');
  if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });
  const htmlFile = path.join(tempDir, `${randomUUID()}.html`);

  try {
    const html = buildBaseHtml({
      title: config.title,
      data,
      tableBuilder: config.tableBuilder,
      type: type
    });

    fs.writeFileSync(htmlFile, html, 'utf8');
    const pdfBuffer = await runWkhtmltopdf(htmlFile);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename = "${(filename || 'document.pdf').replaceAll('"', '')}"`);
    return res.status(200).send(pdfBuffer);
  } catch (error) {
    console.error('Error generating PDF:', error);
    return res.status(500).json({
      success: false,
      message: 'PDF Generation Failed',
      details: error.message
    });
  } finally {
    try { if (fs.existsSync(htmlFile)) fs.unlinkSync(htmlFile); } catch (_) { }
  }
};

module.exports = { renderPvPdfController };