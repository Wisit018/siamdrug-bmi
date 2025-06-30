const express = require('express');
const path = require('path');
const fs = require('fs');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

// BMI Calculation API
app.post('/api/bmi', (req, res) => {
  console.log('BMI API called', req.body);
  const { fullname, phone, age, height, weight, gender } = req.body;
  if (!age || !height || !weight || !gender) {
    return res.status(400).json({ error: 'กรุณากรอกข้อมูลให้ครบถ้วน' });
  }
  const heightM = height / 100;
  const bmi = weight / (heightM * heightM);
  let category = '';
  // กำหนดเกณฑ์ BMI ตามเพศและอายุ
  let healthyMin = 18.5, healthyMax = 24.9;
  if (gender === 'female') {
    healthyMin = 18.0; healthyMax = 23.9;
  }
  if (age >= 60) {
    healthyMin -= 1; healthyMax += 1.5;
  }
  if (bmi < healthyMin) category = 'Underweight';
  else if (bmi <= healthyMax) category = 'Healthy';
  else if (bmi <= 29.9) category = 'Overweight';
  else category = 'Obese';

  // --- Save history to JSON file ---
  const historyFile = path.join(__dirname, 'bmi-history.json');
  let history = [];
  try {
    if (fs.existsSync(historyFile)) {
      const raw = fs.readFileSync(historyFile, 'utf8');
      history = JSON.parse(raw);
    }
  } catch (e) {
    console.error('Read history error:', e);
    history = [];
  }
  try {
    history.push({
      timestamp: new Date().toISOString(),
      fullname, phone, gender, age, height, weight, bmi: bmi.toFixed(1), category
    });
    fs.writeFileSync(historyFile, JSON.stringify(history, null, 2), 'utf8');
  } catch (e) {
    console.error('Write history error:', e);
  }

  res.json({ bmi: bmi.toFixed(1), category });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 