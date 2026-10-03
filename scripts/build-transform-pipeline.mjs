export function applyBuildTransforms(html, transforms) {
  if (typeof html !== 'string') {
    throw new TypeError('Build pipeline input must be an HTML string.');
  }
  if (!Array.isArray(transforms)) {
    throw new TypeError('Build pipeline transforms must be an array.');
  }

  let current = html;
  for (const [index, transform] of transforms.entries()) {
    if (typeof transform !== 'function') {
      throw new TypeError(`Build transform at index ${index} must be a function.`);
    }
    current = transform(current);
    if (typeof current !== 'string') {
      throw new TypeError(`Build transform at index ${index} must return an HTML string.`);
    }
  }
  return current;
}
