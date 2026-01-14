// dashboard.js - Dashboard functionality

document.addEventListener('DOMContentLoaded', function() {
  loadDashboardStats();
  loadRecentActivity();
});

async function loadDashboardStats() {
  try {
    const response = await fetch('/api/stats');
    const stats = await response.json();
    
    document.getElementById('total-products').textContent = stats.totalProducts || 0;
    document.getElementById('total-orders').textContent = stats.totalOrders || 0;
    document.getElementById('total-revenue').textContent = `$${stats.totalRevenue || '0.00'}`;
  } catch (error) {
    console.error('Error loading dashboard stats:', error);
  }
}

async function loadRecentActivity() {
  try {
    const activityList = document.getElementById('activity-list');
    activityList.innerHTML = '<p>Loading recent activity...</p>';
    
    const response = await fetch('/api/activity');
    const activities = await response.json();
    
    if (activities.length === 0) {
      activityList.innerHTML = '<p>No recent activity</p>';
      return;
    }
    
    activityList.innerHTML = '';
    activities.forEach(activity => {
      const activityDiv = document.createElement('div');
      activityDiv.className = 'activity-item';
      activityDiv.innerHTML = `
        <p><strong>${activity.type}</strong>: ${activity.description}</p>
        <small>${new Date(activity.timestamp).toLocaleString()}</small>
      `;
      activityList.appendChild(activityDiv);
    });
  } catch (error) {
    console.error('Error loading recent activity:', error);
    document.getElementById('activity-list').innerHTML = '<p>Error loading activity</p>';
  }
}