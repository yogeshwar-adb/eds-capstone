const PAGE_SIZE = 8;

function createButton(label, className) {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = className;
  button.textContent = label;
  return button;
}

function createProductItem(product) {
  const item = document.createElement('li');
  item.className = 'product-list-item';

  // Image
  if (product.image) {
    console.log('Image URL:', product.image);

    const image = document.createElement('img');
    image.className = 'product-list-image';
    image.src = product.image;
    image.alt = product.title || 'Product image';
    image.loading = 'lazy';

    image.onload = () => {
      console.log('Loaded:', product.image);
    };

    image.onerror = () => {
      console.error('Failed to load image:', product.image);

      image.src = 'https://placehold.co/400x300?text=No+Image';
    };

    item.append(image);
  }

  const content = document.createElement('div');
  content.className = 'product-list-content';

  const title = document.createElement('h3');
  title.textContent = product.title || 'Untitled Product';

  const description = document.createElement('p');
  description.className = 'product-list-description';
  description.textContent = product.description || '';

  const category = document.createElement('p');
  category.className = 'product-list-category';
  category.textContent = product.category
    ? `Category: ${product.category}`
    : '';

  const price = document.createElement('p');
  price.className = 'product-list-price';
  price.textContent = product.price || '';

  content.append(
    title,
    description,
    category,
    price,
  );

  item.append(content);

  const shopButton = createButton(
    product.buttonText || 'Shop Now',
    'product-list-checkout',
  );

  item.append(shopButton);

  return item;
}

export default async function decorate(block) {
  const sourceLink = block.querySelector('a');

  const jsonPath = sourceLink
    ? sourceLink.href
    : '/sheets/all-lights.json';

  console.log('Fetching JSON from:', jsonPath);

  block.textContent = '';

  const status = document.createElement('p');
  status.className = 'product-list-status';
  status.textContent = 'Loading products...';
  status.setAttribute('role', 'status');

  block.append(status);

  try {
    const response = await fetch(jsonPath);

    if (!response.ok) {
      throw new Error(
        `Request failed with status ${response.status}`,
      );
    }

    const json = await response.json();

    console.log('JSON Response:', json);

    const products = Array.isArray(json.data)
      ? json.data
      : [];

    block.textContent = '';

    if (!products.length) {
      status.textContent =
        'No products available.';
      block.append(status);
      return;
    }

    const list = document.createElement('ul');
    list.className = 'product-list-items';

    const pagination = document.createElement('nav');
    pagination.className =
      'product-list-pagination';

    const previousButton = createButton(
      'Previous',
      'product-list-previous',
    );

    const pageInfo =
      document.createElement('span');

    pageInfo.className =
      'product-list-page-info';

    pageInfo.setAttribute(
      'aria-live',
      'polite',
    );

    const nextButton = createButton(
      'Next',
      'product-list-next',
    );

    pagination.append(
      previousButton,
      pageInfo,
      nextButton,
    );

    let currentPage = 1;

    const totalPages = Math.ceil(
      products.length / PAGE_SIZE,
    );

    function renderPage() {
      const start =
        (currentPage - 1) * PAGE_SIZE;

      const end = start + PAGE_SIZE;

      const pageProducts =
        products.slice(start, end);

      list.textContent = '';

      pageProducts.forEach((product) => {
        list.append(
          createProductItem(product),
        );
      });

      pageInfo.textContent = `Page ${currentPage} of ${totalPages}`;

      previousButton.disabled =
        currentPage === 1;

      nextButton.disabled =
        currentPage === totalPages;
    }

    previousButton.addEventListener(
      'click',
      () => {
        if (currentPage > 1) {
          currentPage--;
          renderPage();
        }
      },
    );

    nextButton.addEventListener(
      'click',
      () => {
        if (currentPage < totalPages) {
          currentPage++;
          renderPage();
        }
      },
    );

    block.append(list, pagination);

    renderPage();
  } catch (error) {
    console.error(
      'Unable to load products:',
      error,
    );

    status.textContent =
      'Unable to load products.';

    status.classList.add(
      'product-list-error',
    );
  }
}