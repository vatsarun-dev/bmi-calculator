const form = document.getElementById("bmiForm");
const metricBtn = document.getElementById("metricBtn");
const imperialBtn = document.getElementById("imperialBtn");
const metricHeightWrap = document.getElementById("metricHeightWrap");
const imperialHeightWrap = document.getElementById("imperialHeightWrap");
const metricWeightWrap = document.getElementById("metricWeightWrap");
const imperialWeightWrap = document.getElementById("imperialWeightWrap");
const personName = document.getElementById("personName");
const heightCm = document.getElementById("heightCm");
const weightKg = document.getElementById("weightKg");
const heightFt = document.getElementById("heightFt");
const heightIn = document.getElementById("heightIn");
const weightLbs = document.getElementById("weightLbs");
const errorMsg = document.getElementById("errorMsg");
const bmiValue = document.getElementById("bmiValue");
const bmiCategory = document.getElementById("bmiCategory");
const resultBox = document.getElementById("resultBox");
const resetBtn = document.getElementById("resetBtn");
const historyList = document.getElementById("historyList");

const storageKey = "bmi_history";
let unitMode = "metric";

function setMode(mode) {
  unitMode = mode;
  const isMetric = mode === "metric";

  metricBtn.classList.toggle("active", isMetric);
  imperialBtn.classList.toggle("active", !isMetric);

  metricHeightWrap.classList.toggle("hidden", !isMetric);
  metricWeightWrap.classList.toggle("hidden", !isMetric);
  imperialHeightWrap.classList.toggle("hidden", isMetric);
  imperialWeightWrap.classList.toggle("hidden", isMetric);

  clearError();
}

function clearError() {
  errorMsg.textContent = "";
}

function showError(message) {
  errorMsg.textContent = message;
}

function getCategory(bmi) {
  if (bmi < 18.5) return { label: "Underweight", status: "under" };
  if (bmi < 25) return { label: "Normal weight", status: "normal" };
  if (bmi < 30) return { label: "Overweight", status: "over" };
  return { label: "Obese", status: "obese" };
}

function updateResult(bmi) {
  const category = getCategory(bmi);
  bmiValue.textContent = bmi.toFixed(2);
  bmiCategory.textContent = category.label;

  resultBox.classList.remove("status-under", "status-normal", "status-over", "status-obese");
  resultBox.classList.add(`status-${category.status}`);

  return category;
}

function calculateMetricBMI() {
  const hCm = Number(heightCm.value);
  const wKg = Number(weightKg.value);

  if (!hCm || !wKg || hCm <= 0 || wKg <= 0) {
    showError("Please enter valid positive values for height and weight.");
    return null;
  }

  const hM = hCm / 100;
  return wKg / (hM * hM);
}

function calculateImperialBMI() {
  const ft = Number(heightFt.value || 0);
  const inches = Number(heightIn.value || 0);
  const lbs = Number(weightLbs.value);

  if (ft < 0 || inches < 0 || !lbs || lbs <= 0) {
    showError("Please enter valid positive values for feet/inches and weight.");
    return null;
  }

  const totalInches = (ft * 12) + inches;
  if (totalInches <= 0) {
    showError("Height must be greater than 0.");
    return null;
  }

  return (lbs / (totalInches * totalInches)) * 703;
}

function getHistory() {
  try {
    const data = JSON.parse(localStorage.getItem(storageKey)) || [];
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

function saveToHistory(entry) {
  const history = getHistory();
  history.unshift(entry);
  const trimmed = history.slice(0, 10);
  localStorage.setItem(storageKey, JSON.stringify(trimmed));
}

function renderHistory() {
  const history = getHistory();

  if (history.length === 0) {
    historyList.innerHTML = '<li class="empty">No saved BMI results yet.</li>';
    return;
  }

  historyList.innerHTML = history
    .map((item) => `
      <li>
        <span>${item.name}</span>
        <strong>${item.bmi} (${item.category})</strong>
      </li>
    `)
    .join("");
}

form.addEventListener("submit", (event) => {
  event.preventDefault();
  clearError();

  const bmi = unitMode === "metric" ? calculateMetricBMI() : calculateImperialBMI();
  if (bmi === null) return;

  const category = updateResult(bmi);
  const cleanName = personName.value.trim() || "Anonymous";

  saveToHistory({
    name: cleanName,
    bmi: bmi.toFixed(2),
    category: category.label,
    unit: unitMode,
    ts: Date.now()
  });

  renderHistory();
});

resetBtn.addEventListener("click", () => {
  form.reset();
  clearError();
  bmiValue.textContent = "--";
  bmiCategory.textContent = "Enter details to calculate";
  resultBox.classList.remove("status-under", "status-normal", "status-over", "status-obese");
  setMode("metric");
});

metricBtn.addEventListener("click", () => setMode("metric"));
imperialBtn.addEventListener("click", () => setMode("imperial"));

setMode("metric");
renderHistory();
