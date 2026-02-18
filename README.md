k có j
fetch('http://localhost:3000/api/payment/manual-approve/TBBMLQ1VGIJ882430', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('token')}`,
    'Content-Type': 'application/json'
  }
}).then(r => r.json()).then(data => console.log('✅ Kết quả:', JSON.stringify(data, null, 2))).catch(e => console.error(e));    