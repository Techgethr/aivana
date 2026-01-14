// products.js - Product management functionality

document.addEventListener('DOMContentLoaded', function() {
  loadProducts();
  
  // Show/hide product form
  document.getElementById('add-product-btn').addEventListener('click', function() {
    document.getElementById('form-title').textContent = 'Add New Product';
    document.getElementById('product-form').reset();
    document.getElementById('product-id').value = '';
    document.getElementById('product-form-container').style.display = 'block';
  });
  
  document.getElementById('cancel-btn').addEventListener('click', function() {
    document.getElementById('product-form-container').style.display = 'none';
  });
  
  // Handle form submission
  document.getElementById('product-form').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const productId = document.getElementById('product-id').value;
    const productData = {
      name: document.getElementById('name').value,
      description: document.getElementById('description').value,
      price: parseFloat(document.getElementById('price').value),
      category: document.getElementById('category').value,
      stock_quantity: parseInt(document.getElementById('stock_quantity').value),
      image_url: document.getElementById('image_url').value
    };
    
    try {
      let response;
      if (productId) {
        // Update existing product
        response = await fetch(`/api/products/${productId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(productData)
        });
      } else {
        // Create new product
        response = await fetch('/api/products', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(productData)
        });
      }
      
      if (response.ok) {
        document.getElementById('product-form-container').style.display = 'none';
        loadProducts(); // Refresh the product list
      } else {
        alert('Error saving product');
      }
    } catch (error) {
      console.error('Error saving product:', error);
      alert('Error saving product');
    }
  });
});

async function loadProducts() {
  try {
    const tbody = document.getElementById('products-tbody');
    tbody.innerHTML = '<tr><td colspan="7">Loading products...</td></tr>';
    
    const response = await fetch('/api/products/my');
    const products = await response.json();
    
    if (products.length === 0) {
      tbody.innerHTML = '<tr><td colspan="7">No products found</td></tr>';
      return;
    }
    
    tbody.innerHTML = '';
    products.forEach(product => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${product.id}</td>
        <td>${product.name}</td>
        <td>$${parseFloat(product.price).toFixed(2)}</td>
        <td>${product.stock_quantity}</td>
        <td>${product.category || '-'}</td>
        <td><span class="status-badge ${product.status}">${product.status}</span></td>
        <td class="actions-cell">
          <button onclick="editProduct(${product.id})" class="btn-primary">Edit</button>
          <button onclick="deleteProduct(${product.id})" class="btn-secondary">Delete</button>
        </td>
      `;
      tbody.appendChild(row);
    });
  } catch (error) {
    console.error('Error loading products:', error);
    document.getElementById('products-tbody').innerHTML = '<tr><td colspan="7">Error loading products</td></tr>';
  }
}

async function editProduct(productId) {
  try {
    const response = await fetch(`/api/products/${productId}`);
    const product = await response.json();
    
    if (product) {
      document.getElementById('form-title').textContent = 'Edit Product';
      document.getElementById('product-id').value = product.id;
      document.getElementById('name').value = product.name;
      document.getElementById('description').value = product.description || '';
      document.getElementById('price').value = product.price;
      document.getElementById('category').value = product.category || '';
      document.getElementById('stock_quantity').value = product.stock_quantity;
      document.getElementById('image_url').value = product.image_url || '';
      
      document.getElementById('product-form-container').style.display = 'block';
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  } catch (error) {
    console.error('Error loading product for edit:', error);
  }
}

async function deleteProduct(productId) {
  if (!confirm('Are you sure you want to delete this product?')) {
    return;
  }
  
  try {
    const response = await fetch(`/api/products/${productId}`, {
      method: 'DELETE'
    });
    
    if (response.ok) {
      loadProducts(); // Refresh the product list
    } else {
      alert('Error deleting product');
    }
  } catch (error) {
    console.error('Error deleting product:', error);
    alert('Error deleting product');
  }
}

// Add CSS for status badge
const style = document.createElement('style');
style.textContent = `
  .status-badge {
    padding: 0.25rem 0.5rem;
    border-radius: 4px;
    font-size: 0.8rem;
    font-weight: 500;
  }
  
  .status-badge.active {
    background-color: #dcfce7;
    color: #166534;
  }
  
  .status-badge.inactive {
    background-color: #fee2e2;
    color: #991b1b;
  }
`;
document.head.appendChild(style);