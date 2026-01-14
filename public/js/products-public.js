// products-public.js - Public products page functionality

document.addEventListener('DOMContentLoaded', function() {
  loadProducts();
  loadCategories();
  
  // Setup search and filter
  document.getElementById('search-input').addEventListener('input', debounce(loadProducts, 300));
  document.getElementById('category-filter').addEventListener('change', loadProducts);
});

function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

async function loadProducts() {
  try {
    const searchInput = document.getElementById('search-input').value;
    const categoryFilter = document.getElementById('category-filter').value;
    
    let url = '/api/products';
    const params = new URLSearchParams();
    
    if (searchInput) {
      params.append('search', searchInput);
    }
    
    if (categoryFilter) {
      params.append('category', categoryFilter);
    }
    
    if (params.toString()) {
      url += '?' + params.toString();
    }
    
    const productsGrid = document.getElementById('products-grid');
    productsGrid.innerHTML = '<p>Loading products...</p>';
    
    const response = await fetch(url);
    const products = await response.json();
    
    if (products.length === 0) {
      productsGrid.innerHTML = '<p>No products found</p>';
      return;
    }
    
    productsGrid.innerHTML = '';
    products.forEach(product => {
      const productCard = document.createElement('div');
      productCard.className = 'product-card';
      productCard.innerHTML = `
        <div class="product-image">
          ${product.image_url ? 
            `<img src="${product.image_url}" alt="${product.name}">` : 
            '<div class="placeholder-image">No Image</div>'
          }
        </div>
        <div class="product-info">
          <h3>${product.name}</h3>
          <p class="product-description">${product.description || 'No description available'}</p>
          <div class="product-price">$${parseFloat(product.price).toFixed(2)}</div>
          <div class="product-stock">In Stock: ${product.stock_quantity}</div>
          <div class="product-seller">Sold by: ${product.seller_name}</div>
          <div class="product-actions">
            <button class="btn-primary" onclick="buyProduct(${product.id})">Buy Now</button>
            <button class="btn-secondary" onclick="askAI('${encodeURIComponent(product.name)}')">Ask AI</button>
          </div>
        </div>
      `;
      productsGrid.appendChild(productCard);
    });
  } catch (error) {
    console.error('Error loading products:', error);
    document.getElementById('products-grid').innerHTML = '<p>Error loading products</p>';
  }
}

async function loadCategories() {
  try {
    const response = await fetch('/api/categories');
    const categories = await response.json();
    
    const categoryFilter = document.getElementById('category-filter');
    
    categories.forEach(category => {
      const option = document.createElement('option');
      option.value = category;
      option.textContent = category;
      categoryFilter.appendChild(option);
    });
  } catch (error) {
    console.error('Error loading categories:', error);
  }
}

function buyProduct(productId) {
  // In a real implementation, this would start the purchase process
  // For now, we'll just show an alert
  alert(`Ready to purchase product ID: ${productId}. In a full implementation, this would connect to the blockchain transaction system.`);
}

function askAI(productName) {
  // In a real implementation, this would open the AI chat interface
  // For now, we'll just show an alert
  alert(`Asking AI about: ${decodeURIComponent(productName)}. In a full implementation, this would open the AI assistant interface.`);
}