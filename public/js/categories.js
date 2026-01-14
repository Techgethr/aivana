// categories.js - Category management functionality

document.addEventListener('DOMContentLoaded', function() {
  loadCategories();

  // Show/hide category form
  document.getElementById('add-category-btn').addEventListener('click', function() {
    document.getElementById('form-title').textContent = 'Add New Category';
    document.getElementById('category-form').reset();
    document.getElementById('category-id').value = '';
    document.getElementById('category-form-container').style.display = 'block';
  });

  document.getElementById('cancel-category-btn').addEventListener('click', function() {
    document.getElementById('category-form-container').style.display = 'none';
  });

  // Handle form submission
  document.getElementById('category-form').addEventListener('submit', async function(e) {
    e.preventDefault();

    const categoryId = document.getElementById('category-id').value;
    const categoryData = {
      name: document.getElementById('category-name').value,
      description: document.getElementById('category-description').value
    };

    try {
      let response;
      if (categoryId) {
        // Update existing category
        response = await fetch(`/api/categories/${categoryId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(categoryData)
        });
      } else {
        // Create new category
        response = await fetch('/api/categories', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(categoryData)
        });
      }

      if (response.ok) {
        document.getElementById('category-form-container').style.display = 'none';
        loadCategories(); // Refresh the category list
      } else {
        const errorData = await response.json();
        alert(errorData.error || 'Error saving category');
      }
    } catch (error) {
      console.error('Error saving category:', error);
      alert('Error saving category');
    }
  });
});

async function loadCategories() {
  try {
    const tbody = document.getElementById('categories-tbody');
    tbody.innerHTML = '<tr><td colspan="5">Loading categories...</td></tr>';

    const response = await fetch('/api/categories/all');
    const categories = await response.json();

    if (categories.length === 0) {
      tbody.innerHTML = '<tr><td colspan="5">No categories found</td></tr>';
      return;
    }

    tbody.innerHTML = '';
    categories.forEach(category => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${category.id}</td>
        <td>${category.name}</td>
        <td>${category.description || '-'}</td>
        <td>${new Date(category.created_at).toLocaleDateString()}</td>
        <td class="actions-cell">
          <button onclick="editCategory(${category.id})" class="btn-primary">Edit</button>
        </td>
      `;
      tbody.appendChild(row);
    });
  } catch (error) {
    console.error('Error loading categories:', error);
    document.getElementById('categories-tbody').innerHTML = '<tr><td colspan="5">Error loading categories</td></tr>';
  }
}

async function editCategory(categoryId) {
  try {
    const response = await fetch(`/api/categories/${categoryId}`);
    const category = await response.json();

    if (category) {
      document.getElementById('form-title').textContent = 'Edit Category';
      document.getElementById('category-id').value = category.id;
      document.getElementById('category-name').value = category.name;
      document.getElementById('category-description').value = category.description || '';

      document.getElementById('category-form-container').style.display = 'block';
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  } catch (error) {
    console.error('Error loading category for edit:', error);
  }
}

