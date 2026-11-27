function decorateTitle(block) {
  // Title cells can arrive as raw markdown ("# Title") rather than a heading.
  const titleCell = block.querySelector(':scope > div:nth-child(2) > div');
  if (!titleCell) return;

  const text = titleCell.textContent.trim();
  if (!/^#{1,6}\s/.test(text)) return;

  const heading = document.createElement('h1');
  heading.textContent = text.replace(/^#{1,6}\s+/, '');
  titleCell.replaceChildren(heading);
}

export default function decorate(block) {
  decorateTitle(block);
}