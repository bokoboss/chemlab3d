import { makeReaction } from '../chemistry/reactions.mjs';

const starterRecords = [
  {
    id: 'water-formation',
    reactants: [
      { formula: 'H2', coefficient: 2 },
      { formula: 'O2', coefficient: 1 },
    ],
    products: [{ formula: 'H2O', coefficient: 2 }],
    curriculum: { levels: ['ม.ต้น'], topics: ['สมการเคมี', 'การดุลสมการ'] },
  },
  {
    id: 'methane-combustion',
    reactants: [
      { formula: 'CH4', coefficient: 1 },
      { formula: 'O2', coefficient: 2 },
    ],
    products: [
      { formula: 'CO2', coefficient: 1 },
      { formula: 'H2O', coefficient: 2 },
    ],
    curriculum: { levels: ['ม.ต้น', 'ม.ปลาย'], topics: ['สมการเคมี', 'การดุลสมการ'] },
  },
  {
    id: 'hydrochloric-acid-sodium-hydroxide',
    reactants: [
      { formula: 'HCl', coefficient: 1 },
      { formula: 'NaOH', coefficient: 1 },
    ],
    products: [
      { formula: 'NaCl', coefficient: 1 },
      { formula: 'H2O', coefficient: 1 },
    ],
    curriculum: { levels: ['ม.ต้น', 'ม.ปลาย'], topics: ['กรด-เบส', 'สมการเคมี'] },
  },
  {
    id: 'zinc-hydrochloric-acid',
    reactants: [
      { formula: 'Zn', coefficient: 1 },
      { formula: 'HCl', coefficient: 2 },
    ],
    products: [
      { formula: 'ZnCl2', coefficient: 1 },
      { formula: 'H2', coefficient: 1 },
    ],
    curriculum: { levels: ['ม.ต้น', 'ม.ปลาย'], topics: ['ปฏิกิริยาเคมี', 'การดุลสมการ'] },
  },
  {
    id: 'silver-nitrate-sodium-chloride',
    reactants: [
      { formula: 'AgNO3', coefficient: 1 },
      { formula: 'NaCl', coefficient: 1 },
    ],
    products: [
      { formula: 'AgCl', coefficient: 1 },
      { formula: 'NaNO3', coefficient: 1 },
    ],
    curriculum: { levels: ['ม.ปลาย'], topics: ['สมการเคมี', 'ปฏิกิริยาแลกเปลี่ยน'] },
  },
  {
    id: 'calcium-carbonate-decomposition',
    reactants: [{ formula: 'CaCO3', coefficient: 1 }],
    products: [
      { formula: 'CaO', coefficient: 1 },
      { formula: 'CO2', coefficient: 1 },
    ],
    curriculum: { levels: ['ม.ต้น', 'ม.ปลาย'], topics: ['ปฏิกิริยาเคมี', 'การดุลสมการ'] },
  },
  {
    id: 'ammonia-formation',
    reactants: [
      { formula: 'N2', coefficient: 1 },
      { formula: 'H2', coefficient: 3 },
    ],
    products: [{ formula: 'NH3', coefficient: 2 }],
    curriculum: { levels: ['ม.ปลาย'], topics: ['สมการเคมี', 'ปริมาณสารสัมพันธ์'] },
  },
  {
    id: 'aluminium-oxide-formation',
    reactants: [
      { formula: 'Al', coefficient: 4 },
      { formula: 'O2', coefficient: 3 },
    ],
    products: [{ formula: 'Al2O3', coefficient: 2 }],
    curriculum: { levels: ['ม.ต้น', 'ม.ปลาย'], topics: ['สมการเคมี', 'การดุลสมการ'] },
  },
];

export const REACTION_LIBRARY = Object.freeze(starterRecords.map((record) => makeReaction(record)));
