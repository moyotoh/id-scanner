import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const resultEl = document.getElementById("result");
const videoEl = document.getElementById("video");

let cooldown = false;
let resetTimer = null;

function showResult(text, type) {
  resultEl.textContent = text;
  resultEl.className = "visible " + type;

  if (resetTimer) clearTimeout(resetTimer);
  resetTimer = setTimeout(() => {
    resultEl.className = "";
    resultEl.textContent = "";
    cooldown = false;
  }, 2500);
}

const codeReader = new ZXing.BrowserMultiFormatReader();

codeReader.decodeFromVideoDevice(null, videoEl, async (result, err) => {
  if (!result || cooldown) return;
  cooldown = true;

  const code = result.getText();
  resultEl.className = "visible";
  resultEl.textContent = "Sjekker...";

  try {
    const docRef = doc(db, "students", code);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      showResult("✓ Funnet: " + code, "found");
    } else {
      showResult("✗ Ikke funnet: " + code, "notfound");
    }
  } catch (e) {
    showResult("Feil: " + e.message, "notfound");
  }
});