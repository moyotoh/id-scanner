import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

// 🔧 Replace these with your actual Firebase config
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const resultEl = document.getElementById("result");
const videoEl = document.getElementById("video");

let lastScanned = null;
let cooldown = false;

const codeReader = new ZXing.BrowserMultiFormatReader();

codeReader.decodeFromVideoDevice(null, videoEl, async (result, err) => {
  if (!result || cooldown) return;

  const code = result.getText();
  if (code === lastScanned) return;

  lastScanned = code;
  cooldown = true;
  setTimeout(() => { cooldown = false; lastScanned = null; }, 3000);

  resultEl.className = "";
  resultEl.textContent = "Checking...";

  try {
    const docRef = doc(db, "students", code);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      resultEl.textContent = "✓ Found";
      resultEl.className = "found";
    } else {
      resultEl.textContent = "✗ Not found";
      resultEl.className = "notfound";
    }
  } catch (e) {
    resultEl.textContent = "Error: " + e.message;
  }
});