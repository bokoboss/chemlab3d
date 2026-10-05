/**
 * Evidence registry for educational QA. These records identify the source and
 * scope used for review; they are not automatically injected as learner-facing
 * claims. Claim-level mappings are added only after a content item is reviewed.
 */
export const EDUCATIONAL_QA_SOURCES = Object.freeze({
  'obec-science-core-2560': Object.freeze({
    title: 'ตัวชี้วัดและสาระการเรียนรู้แกนกลาง กลุ่มสาระการเรียนรู้วิทยาศาสตร์ (ฉบับปรับปรุง พ.ศ. 2560)',
    publisher: 'สำนักงานคณะกรรมการการศึกษาขั้นพื้นฐาน (สพฐ.)',
    url: 'https://www.academic.obec.go.th/web/document/view/286',
    scope: 'Thai basic-education science standards and indicators',
  }),
  'ipst-chemistry-guide-2560': Object.freeze({
    title: 'คู่มือการใช้หลักสูตรรายวิชาเพิ่มเติมวิทยาศาสตร์ วิชาเคมี ระดับมัธยมศึกษาตอนปลาย (ฉบับปรับปรุง พ.ศ. 2560)',
    publisher: 'สถาบันส่งเสริมการสอนวิทยาศาสตร์และเทคโนโลยี (สสวท.)',
    url: 'https://www.scimath.org/ebook-chemistry/item/8417-2-2560-2551',
    scope: 'Upper-secondary additional chemistry learning outcomes and guidance',
  }),
  'bipm-si-mole-2026': Object.freeze({
    title: 'SI Brochure / SI base unit: mole',
    publisher: 'Bureau International des Poids et Mesures (BIPM)',
    url: 'https://www.bipm.org/en/si-base-units/mole',
    scope: 'Exact SI definition of the mole and Avogadro constant',
  }),
  'iupac-stp-goldbook-2025': Object.freeze({
    title: 'IUPAC Gold Book — STP / standard conditions for gases',
    publisher: 'International Union of Pure and Applied Chemistry (IUPAC)',
    url: 'https://goldbook.iupac.org/terms/view/S06036',
    scope: 'STP definition: 273.15 K and 100 kPa',
  }),
  'obec-lower-secondary-science-guide-2560': Object.freeze({
    title: 'คู่มือการใช้หลักสูตร กลุ่มสาระการเรียนรู้วิทยาศาสตร์ (ฉบับปรับปรุง พ.ศ. 2560) ระดับมัธยมศึกษาตอนต้น',
    publisher: 'สำนักงานคณะกรรมการการศึกษาขั้นพื้นฐาน (สพฐ.)',
    url: 'https://www.academic.obec.go.th/web/document/view/297',
    scope: 'Lower-secondary science curriculum guidance',
  }),
});
