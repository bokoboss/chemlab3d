import { makeReaction } from '../chemistry/reactions.mjs';

const starterRecords = [
  {
    id: 'water-formation',
    sources: ['LIBRE-WATER-EQUATION'],
    reactants: [
      { formula: 'H2', coefficient: 2, state: 'g', stateSource: 'LIBRE-WATER-EQUATION' },
      { formula: 'O2', coefficient: 1, state: 'g', stateSource: 'LIBRE-WATER-EQUATION' },
    ],
    products: [{ formula: 'H2O', coefficient: 2, state: 'l', stateSource: 'LIBRE-WATER-EQUATION' }],
    curriculum: { levels: ['ม.ต้น'], topics: ['สมการเคมี', 'การดุลสมการ'] },
  },
  {
    id: 'methane-combustion',
    sources: ['OPENSTAX-METHANE-COMBUSTION'],
    reactants: [
      { formula: 'CH4', coefficient: 1, state: 'g', stateSource: 'OPENSTAX-METHANE-COMBUSTION' },
      { formula: 'O2', coefficient: 2, state: 'g', stateSource: 'OPENSTAX-METHANE-COMBUSTION' },
    ],
    products: [
      { formula: 'CO2', coefficient: 1, state: 'g', stateSource: 'OPENSTAX-METHANE-COMBUSTION' },
      { formula: 'H2O', coefficient: 2, state: 'g', stateSource: 'OPENSTAX-METHANE-COMBUSTION' },
    ],
    curriculum: { levels: ['ม.ต้น', 'ม.ปลาย'], topics: ['สมการเคมี', 'การดุลสมการ'] },
  },
  {
    id: 'hydrochloric-acid-sodium-hydroxide',
    sources: ['LIBRE-HCL-NAOH'],
    reactants: [
      { formula: 'HCl', coefficient: 1, state: 'aq', stateSource: 'LIBRE-HCL-NAOH' },
      { formula: 'NaOH', coefficient: 1, state: 'aq', stateSource: 'LIBRE-HCL-NAOH' },
    ],
    products: [
      { formula: 'NaCl', coefficient: 1, state: 'aq', stateSource: 'LIBRE-HCL-NAOH' },
      { formula: 'H2O', coefficient: 1, state: 'l', stateSource: 'LIBRE-HCL-NAOH' },
    ],
    curriculum: { levels: ['ม.ต้น', 'ม.ปลาย'], topics: ['กรด-เบส', 'สมการเคมี'] },
  },
  {
    id: 'zinc-hydrochloric-acid',
    sources: ['LIBRE-ZN-HCL'],
    reactants: [
      { formula: 'Zn', coefficient: 1, state: 's', stateSource: 'LIBRE-ZN-HCL' },
      { formula: 'HCl', coefficient: 2, state: 'aq', stateSource: 'LIBRE-ZN-HCL' },
    ],
    products: [
      { formula: 'ZnCl2', coefficient: 1, state: 'aq', stateSource: 'LIBRE-ZN-HCL' },
      { formula: 'H2', coefficient: 1, state: 'g', stateSource: 'LIBRE-ZN-HCL' },
    ],
    curriculum: { levels: ['ม.ต้น', 'ม.ปลาย'], topics: ['ปฏิกิริยาเคมี', 'การดุลสมการ'] },
  },
  {
    id: 'silver-nitrate-sodium-chloride',
    sources: ['LIBRE-AGNO3-NACL'],
    reactants: [
      { formula: 'AgNO3', coefficient: 1, state: 'aq', stateSource: 'LIBRE-AGNO3-NACL' },
      { formula: 'NaCl', coefficient: 1, state: 'aq', stateSource: 'LIBRE-AGNO3-NACL' },
    ],
    products: [
      { formula: 'AgCl', coefficient: 1, state: 's', stateSource: 'LIBRE-AGNO3-NACL' },
      { formula: 'NaNO3', coefficient: 1, state: 'aq', stateSource: 'LIBRE-AGNO3-NACL' },
    ],
    curriculum: { levels: ['ม.ปลาย'], topics: ['สมการเคมี', 'ปฏิกิริยาตกตะกอน', 'ปฏิกิริยาแลกเปลี่ยน'] },
  },
  {
    id: 'calcium-carbonate-decomposition',
    sources: ['LIBRE-REACTION-PATTERNS'],
    reactants: [{ formula: 'CaCO3', coefficient: 1, state: 's', stateSource: 'LIBRE-REACTION-PATTERNS' }],
    products: [
      { formula: 'CaO', coefficient: 1, state: 's', stateSource: 'LIBRE-REACTION-PATTERNS' },
      { formula: 'CO2', coefficient: 1, state: 'g', stateSource: 'LIBRE-REACTION-PATTERNS' },
    ],
    conditions: [{ text: 'ให้ความร้อน (thermal decomposition)', source: 'LIBRE-REACTION-PATTERNS' }],
    curriculum: { levels: ['ม.ต้น', 'ม.ปลาย'], topics: ['ปฏิกิริยาสลายตัว', 'สมการเคมี', 'การดุลสมการ'] },
  },
  {
    id: 'ammonia-formation',
    sources: ['LIBRE-REACTION-PATTERNS'],
    reactants: [
      { formula: 'N2', coefficient: 1, state: 'g', stateSource: 'LIBRE-REACTION-PATTERNS' },
      { formula: 'H2', coefficient: 3, state: 'g', stateSource: 'LIBRE-REACTION-PATTERNS' },
    ],
    products: [{ formula: 'NH3', coefficient: 2, state: 'g', stateSource: 'LIBRE-REACTION-PATTERNS' }],
    curriculum: { levels: ['ม.ปลาย'], topics: ['สมการเคมี', 'ปริมาณสารสัมพันธ์'] },
  },
  {
    id: 'aluminium-oxide-formation',
    sources: ['LIBRE-ALUMINIUM-OXIDATION'],
    reactants: [
      { formula: 'Al', coefficient: 4, state: 's', stateSource: 'LIBRE-ALUMINIUM-OXIDATION' },
      { formula: 'O2', coefficient: 3, state: 'g', stateSource: 'LIBRE-ALUMINIUM-OXIDATION' },
    ],
    products: [{ formula: 'Al2O3', coefficient: 2, state: 's', stateSource: 'LIBRE-ALUMINIUM-OXIDATION' }],
    curriculum: { levels: ['ม.ต้น', 'ม.ปลาย'], topics: ['ปฏิกิริยาเคมี', 'ออกซิเดชัน-รีดักชัน', 'สมการเคมี'] },
  },
];

export const REACTION_LIBRARY = Object.freeze(starterRecords.map((record) => makeReaction(record)));
