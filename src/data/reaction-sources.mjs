export const REACTION_SOURCES = Object.freeze({
  'LIBRE-WATER-EQUATION': Object.freeze({
    title: 'Chemical Equations — balanced hydrogen/oxygen to water equation',
    publisher: 'Chemistry LibreTexts',
    url: 'https://chem.libretexts.org/Courses/University_of_Illinois_Springfield/CHE_124%3A_General_Chemistry_for_the_Health_Professions_%28Morsch_and_Andrews%29/05%3A_Introduction_to_Chemical_Reactions/5.2%3A_Chemical_Equations',
    supports: Object.freeze(['reaction', 'states']),
  }),
  'OPENSTAX-METHANE-COMBUSTION': Object.freeze({
    title: 'Chemistry 2e §20.1 Hydrocarbons — methane combustion',
    publisher: 'OpenStax',
    url: 'https://openstax.org/books/chemistry-2e/pages/20-1-hydrocarbons',
    supports: Object.freeze(['reaction', 'states']),
  }),
  'LIBRE-HCL-NAOH': Object.freeze({
    title: 'Acid-base reactions — HCl + NaOH neutralization',
    publisher: 'Chemistry LibreTexts',
    url: 'https://chem.libretexts.org/Courses/Pasadena_City_College/PCC_Chemistry_2A/09%3A_Acids_and_Bases/9.01%3A_Acid-Base_Reactions/9.1.04%3A_Acid-base_reactions',
    supports: Object.freeze(['reaction', 'states']),
  }),
  'LIBRE-ZN-HCL': Object.freeze({
    title: 'Ideal Gas Law and Applications — zinc with hydrochloric acid',
    publisher: 'Chemistry LibreTexts',
    url: 'https://chem.libretexts.org/Courses/Los_Angeles_Trade_Technical_College/DMA_Chem_51/2%3A_Beginning_Chemistry_%28Ball%29/06%3A_Gases/6.6%3A_The_Ideal_Gas_Law_and_Some_Applications',
    supports: Object.freeze(['reaction', 'states']),
  }),
  'LIBRE-AGNO3-NACL': Object.freeze({
    title: 'Stoichiometry exercises — silver nitrate and sodium chloride precipitation',
    publisher: 'Chemistry LibreTexts',
    url: 'https://chem.libretexts.org/Courses/University_of_Kentucky/UK%3A_General_Chemistry/04%3A_Stoichiometry_of_Chemical_Reactions/4.E%3A_Stoichiometry_of_Chemical_Reactions_%28Exercises%29',
    supports: Object.freeze(['reaction', 'states']),
  }),
  'LIBRE-REACTION-PATTERNS': Object.freeze({
    title: 'Patterns of Chemical Reactions — ammonia synthesis and calcium carbonate decomposition',
    publisher: 'Chemistry LibreTexts',
    url: 'https://chem.libretexts.org/Courses/Williams_School/Chemistry_I/04%3A_Stoichiometry_of_Chemical_Reactions/4.04%3A_Patterns_of_Chemical_Reactions',
    supports: Object.freeze(['reaction', 'states', 'thermal-decomposition-context']),
  }),
  'LIBRE-ALUMINIUM-OXIDATION': Object.freeze({
    title: 'Spontaneous Processes exercises — aluminium oxidation to aluminium oxide',
    publisher: 'Chemistry LibreTexts',
    url: 'https://chem.libretexts.org/Courses/University_of_Florida/CHM2047%3A_One-Semester_General_Chemistry_%28Kleiman%29/11%3A_Spontaneous_Processes_and_Thermodynamic_Equilibrium/11.E%3A_Spontaneous_Processes_%28Exercises%29',
    supports: Object.freeze(['reaction', 'states']),
  }),
});

export function getReactionSource(sourceId) {
  return REACTION_SOURCES[sourceId] ?? null;
}
