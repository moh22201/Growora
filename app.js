const startBtn = document.getElementById('startBtn');
document.getElementById('year').textContent = new Date().getFullYear();
startBtn.addEventListener('click', () => {
  alert('مرحبًا بك في Growora! هذه نسخة الواجهة التأسيسية. سنفعّل أنظمة اللعب بعد تجهيز قاعدة البيانات والمنطق الآمن.');
});
