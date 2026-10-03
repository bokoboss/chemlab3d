import { REACTION_LIBRARY } from '../../../data/reactions.mjs';
import { REACTION_SOURCES } from '../../../data/reaction-sources.mjs';

function countOccurrences(source, needle) {
  if (!needle) return 0;
  return source.split(needle).length - 1;
}

function replaceExpected(source, needle, replacement, expectedCount, label) {
  const actualCount = countOccurrences(source, needle);
  if (actualCount !== expectedCount) {
    throw new Error(`${label}: expected ${expectedCount} occurrence(s), found ${actualCount}`);
  }
  return source.split(needle).join(replacement);
}

function assertSourceSupport(sourceId, support, context) {
  const source = REACTION_SOURCES[sourceId];
  if (!source) throw new Error(`${context}: unknown reaction source '${sourceId}'`);
  if (!Array.isArray(source.supports) || !source.supports.includes(support)) {
    throw new Error(`${context}: source '${sourceId}' does not declare support for '${support}'`);
  }
}

function validateReactionSourceCoverage() {
  for (const reaction of REACTION_LIBRARY) {
    for (const sourceId of reaction.sources) {
      assertSourceSupport(sourceId, 'reaction', `${reaction.id}/reaction`);
    }
    for (const species of [...reaction.reactants, ...reaction.products]) {
      if (species.stateSource) {
        assertSourceSupport(species.stateSource, 'states', `${reaction.id}/${species.formula}/state`);
      }
    }
    for (const condition of reaction.conditions) {
      assertSourceSupport(condition.source, 'conditions', `${reaction.id}/condition`);
    }
    if (reaction.catalyst?.source) {
      assertSourceSupport(reaction.catalyst.source, 'catalyst', `${reaction.id}/catalyst`);
    }
    if (reaction.facts?.temperatureSource) {
      assertSourceSupport(reaction.facts.temperatureSource, 'temperature', `${reaction.id}/temperature`);
    }
    if (reaction.facts?.thermochemistrySource) {
      assertSourceSupport(reaction.facts.thermochemistrySource, 'thermochemistry', `${reaction.id}/thermochemistry`);
    }
  }
}

function relevantSourceIds(reaction) {
  const ids = new Set(reaction.sources);
  for (const species of [...reaction.reactants, ...reaction.products]) {
    if (species.stateSource) ids.add(species.stateSource);
  }
  for (const condition of reaction.conditions) ids.add(condition.source);
  if (reaction.catalyst?.source) ids.add(reaction.catalyst.source);
  if (reaction.facts?.temperatureSource) ids.add(reaction.facts.temperatureSource);
  if (reaction.facts?.thermochemistrySource) ids.add(reaction.facts.thermochemistrySource);
  return [...ids];
}

function buildSourceClientSource() {
  const sourceData = JSON.stringify(REACTION_SOURCES);
  const sourceIdsByReaction = JSON.stringify(Object.fromEntries(
    REACTION_LIBRARY.map((reaction) => [reaction.id, relevantSourceIds(reaction)]),
  ));

  return `  // CHEMLAB_REACTION_SOURCE_UI_BEGIN
  const REACTION_SOURCE_DATA = ${sourceData};
  const REACTION_SOURCE_IDS_BY_REACTION = ${sourceIdsByReaction};
  const REACTION_SOURCE_SUPPORT_LABELS = {
    reaction: 'สมการ',
    states: 'สถานะสาร',
    conditions: 'เงื่อนไข',
    catalyst: 'ตัวเร่ง',
    temperature: 'อุณหภูมิ',
    thermochemistry: 'เทอร์โมเคมี',
  };

  function renderReactionLabSources(reaction) {
    const container = document.getElementById('reactionlab-sources');
    if (!container || !reaction) return;
    const sourceIds = REACTION_SOURCE_IDS_BY_REACTION[reaction.id] || [];
    if (!sourceIds.length) {
      container.innerHTML = '<span style="color:var(--accent-amber);">ยังไม่มีแหล่งอ้างอิงที่ลงทะเบียน</span>';
      return;
    }

    const links = sourceIds.map(sourceId => {
      const source = REACTION_SOURCE_DATA[sourceId];
      if (!source) return '';
      const label = (source.publisher ? source.publisher + ' — ' : '') + source.title;
      const supportText = (source.supports || [])
        .map(key => REACTION_SOURCE_SUPPORT_LABELS[key] || key)
        .join(' • ');
      return '<div style="margin-bottom:0.45rem;">'
        + '<a href="' + source.url + '" target="_blank" rel="noopener noreferrer" style="color:var(--accent-cyan); text-decoration:none; border-bottom:1px dotted rgba(0,240,255,0.45);">' + label + '</a>'
        + (supportText ? '<div style="margin-top:0.12rem; color:var(--text-dim); font-size:0.68rem;">รองรับข้อมูล: ' + supportText + '</div>' : '')
        + '</div>';
    }).filter(Boolean);

    container.innerHTML = links.join('');
  }
  // CHEMLAB_REACTION_SOURCE_UI_END`;
}

export function applyReactionSourceUi(html) {
  validateReactionSourceCoverage();

  const curriculumAnchor = '                <div id="reactionlab-curriculum" style="font-size:0.75rem; color:var(--text-muted); line-height:1.5;"></div>';
  const withSources = `                <div style="padding:0.75rem; border-radius:10px; background:rgba(0,240,255,0.045); border:1px solid rgba(0,240,255,0.13);">
                  <div style="font-size:0.76rem; font-weight:700; color:#fff; margin-bottom:0.35rem;">📚 แหล่งอ้างอิงของปฏิกิริยานี้</div>
                  <div id="reactionlab-sources" style="font-size:0.72rem; line-height:1.55;"></div>
                </div>

${curriculumAnchor}`;
  html = replaceExpected(html, curriculumAnchor, withSources, 1, 'Reaction Lab visible provenance panel');

  const formulaFunctionAnchor = '  function reactionLabDisplayFormula(formula) {';
  html = replaceExpected(
    html,
    formulaFunctionAnchor,
    `${buildSourceClientSource()}\n\n${formulaFunctionAnchor}`,
    1,
    'Reaction Lab source registry client data',
  );

  const curriculumRenderAnchor = "    const curriculum = document.getElementById('reactionlab-curriculum');";
  html = replaceExpected(
    html,
    curriculumRenderAnchor,
    `    renderReactionLabSources(reaction);\n\n${curriculumRenderAnchor}`,
    1,
    'Reaction Lab source rendering call',
  );

  return html;
}
