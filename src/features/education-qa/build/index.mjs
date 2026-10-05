import { extractJsonConst, replaceJsonConst } from '../../../education/qa/inventory.mjs';
import { GUIDE_TEXT_PATCHES, QUEST_DESCRIPTION_PATCHES } from '../../../education/qa/content-review.mjs';

const MARKER = 'CHEMLAB_EDUCATIONAL_QA_V1';

function replaceExpected(source, needle, replacement, label) {
  const count = source.split(needle).length - 1;
  if (count !== 1) throw new Error(`${label}: expected 1 match, found ${count}`);
  return source.replace(needle, replacement);
}

export function applyEducationalQa(html) {
  if (html.includes(MARKER)) throw new Error('educational QA already applied');

  const quests = extractJsonConst(html, 'QUESTS_DATA');
  const reviewedQuests = quests.map((quest) => {
    const desc = QUEST_DESCRIPTION_PATCHES[quest.id];
    if (!desc) throw new Error(`quest ${quest.id}: missing reviewed description`);
    return { ...quest, desc };
  });
  html = replaceJsonConst(html, 'QUESTS_DATA', reviewedQuests);

  for (const [before, after] of GUIDE_TEXT_PATCHES) {
    html = replaceExpected(html, before, after, `guide QA patch: ${before.slice(0, 40)}`);
  }

  html = replaceExpected(
    html,
    '</body>',
    `<div id="${MARKER}" data-status="educational-qa-in-progress" hidden></div>\n</body>`,
    'educational QA marker',
  );
  return html;
}

export const EDUCATION_QA_BUILD_TRANSFORMS = Object.freeze([applyEducationalQa]);
