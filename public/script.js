// Sync slider and input for height
const heightInput = document.getElementById('height');
const heightSlider = document.getElementById('height-slider');
heightInput.value = heightSlider.value;
heightInput.addEventListener('input', e => {
  heightSlider.value = e.target.value;
});
heightSlider.addEventListener('input', e => {
  heightInput.value = e.target.value;
});

// Sync slider and input for weight
const weightInput = document.getElementById('weight');
const weightSlider = document.getElementById('weight-slider');
weightInput.value = weightSlider.value;
weightInput.addEventListener('input', e => {
  weightSlider.value = e.target.value;
});
weightSlider.addEventListener('input', e => {
  weightInput.value = e.target.value;
});

// BMI descriptions by category (Thai)
const bmiDescriptions = {
  'Underweight': 'คุณมีน้ำหนักน้อยกว่ามาตรฐาน ควรปรึกษาผู้เชี่ยวชาญด้านสุขภาพเพื่อขอคำแนะนำ',
  'Healthy': 'คุณมีน้ำหนักอยู่ในเกณฑ์ปกติ รักษาสุขภาพให้ดีต่อไป!',
  'Overweight': 'คุณมีน้ำหนักเกินเกณฑ์ปกติ ควรปรับเปลี่ยนพฤติกรรมเพื่อสุขภาพที่ดีขึ้น',
  'Obese': 'คุณมีน้ำหนักมากกว่ามาตรฐาน ซึ่งอาจเสี่ยงต่อสุขภาพ ควรปรึกษาแพทย์เพื่อขอคำแนะนำที่เหมาะสม'
};

// Calculate healthy weight range for BMI 20-25
function healthyWeightRange(heightCm) {
  const heightM = heightCm / 100;
  const min = Math.round(20 * heightM * heightM * 10) / 10;
  const max = Math.round(25 * heightM * heightM * 10) / 10;
  return { min, max };
}

// เก็บประวัติการคำนวณ
const bmiHistory = [];

function renderHistory() {
  const card = document.getElementById('history-card');
  if (bmiHistory.length === 0) {
    card.style.display = 'none';
    return;
  }
  card.style.display = 'block';
  let html = '<div class="history-header">ประวัติการคำนวณ</div>';
  html += '<div class="history-list">';
  for (let i = bmiHistory.length - 1; i >= 0; i--) {
    const h = bmiHistory[i];
    html += `<div class="history-item">
      <div class="history-row"><span class="history-label">ชื่อ:</span> <span class="history-value">${h.fullname}</span></div>
      <div class="history-row"><span class="history-label">เบอร์โทร:</span> <span class="history-value">${h.phone}</span></div>
      <div class="history-row"><span class="history-label">เพศ:</span> <span class="history-value">${h.gender === 'male' ? 'ชาย' : 'หญิง'}</span></div>
      <div class="history-row"><span class="history-label">อายุ:</span> <span class="history-value">${h.age}</span></div>
      <div class="history-row"><span class="history-label">ส่วนสูง:</span> <span class="history-value">${h.height} ซม.</span></div>
      <div class="history-row"><span class="history-label">น้ำหนัก:</span> <span class="history-value">${h.weight} กก.</span></div>
      <div class="history-row"><span class="history-label">BMI:</span> <span class="history-bmi">${h.bmi}</span> <span class="history-category">${h.category}</span></div>
    </div>`;
  }
  html += '</div>';
  card.innerHTML = html;
}

document.getElementById('bmi-form').addEventListener('submit', async function(e) {
  e.preventDefault();
  const fullname = document.getElementById('fullname').value;
  const phone = document.getElementById('phone').value;
  const height = parseFloat(heightInput.value);
  const weight = parseFloat(weightInput.value);
  const gender = document.getElementById('gender').value;
  const age = parseInt(document.getElementById('age').value, 10);
  const res = await fetch('/api/bmi', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ fullname, phone, age, height, weight, gender })
  });
  const data = await res.json();
  if (data.error) {
    alert(data.error);
    return;
  }
  document.getElementById('result-card').style.display = 'block';
  document.getElementById('bmi-value').textContent = data.bmi;
  document.getElementById('bmi-category').textContent = data.category;
  document.getElementById('bmi-description').textContent = bmiDescriptions[data.category] || '';
  // Suggested healthy weight range
  const range = healthyWeightRange(height);
  document.getElementById('min-weight').textContent = range.min;
  document.getElementById('max-weight').textContent = range.max;
  // Move indicator on the bar
  const bmi = parseFloat(data.bmi);
  let percent = 0;
  if (bmi < 18.5) percent = (bmi / 40) * 100;
  else if (bmi < 25) percent = (18.5 / 40) * 100 + ((bmi - 18.5) / (25 - 18.5)) * ((25 - 18.5) / 40 * 100);
  else if (bmi < 30) percent = (25 / 40) * 100 + ((bmi - 25) / (30 - 25)) * ((30 - 25) / 40 * 100);
  else percent = (30 / 40) * 100 + ((bmi - 30) / (40 - 30)) * ((40 - 30) / 40 * 100);
  if (percent > 100) percent = 100;
  if (percent < 0) percent = 0;
  const indicator = document.getElementById('bmi-indicator');
  indicator.style.left = `calc(${percent}% )`;
  // --- เพิ่มประวัติ ---
  bmiHistory.push({ fullname, phone, gender, age, height, weight, bmi: data.bmi, category: data.category });
  renderHistory();
});

// สร้าง segment bar ไล่สี
function createBMISegments() {
  const bar = document.querySelector('.bmi-bar-segments');
  bar.innerHTML = '';
  const n = 50;
  for (let i = 0; i < n; i++) {
    const seg = document.createElement('div');
    seg.className = 'bmi-bar-segment';
    // ไล่สี: ฟ้า (#4a90e2) -> เขียว (#50e3c2) -> เหลือง (#f8e71c) -> ส้ม (#f5a623) -> แดง (#e74c3c)
    // ใช้ HSL ไล่ hue จาก 210 (ฟ้า) -> 160 (เขียว) -> 55 (เหลือง) -> 35 (ส้ม) -> 6 (แดง)
    let color;
    if (i < n * 0.25) {
      // ฟ้า -> เขียว
      const t = i / (n * 0.25);
      color = `hsl(${210 - 50 * t}, 70%, 60%)`;
    } else if (i < n * 0.5) {
      // เขียว -> เหลือง
      const t = (i - n * 0.25) / (n * 0.25);
      color = `hsl(${160 - 105 * t}, 80%, 60%)`;
    } else if (i < n * 0.75) {
      // เหลือง -> ส้ม
      const t = (i - n * 0.5) / (n * 0.25);
      color = `hsl(${55 - 20 * t}, 90%, 60%)`;
    } else {
      // ส้ม -> แดง
      const t = (i - n * 0.75) / (n * 0.25);
      color = `hsl(${35 - 29 * t}, 80%, 55%)`;
    }
    seg.style.background = color;
    bar.appendChild(seg);
  }
}
createBMISegments(); 