import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyDW-HsndyJlo-A9wsD6nVk0NcLJbTPj9_A",
  authDomain: "tore-barcode.firebaseapp.com",
  projectId: "tore-barcode",
  storageBucket: "tore-barcode.firebasestorage.app",
  messagingSenderId: "238997857731",
  appId: "1:238997857731:web:41ead174e0b5a49eecc976",
  key: "AIzaSyDne70MvbSQfyrl95nFU-UjBslJcWDCsQY"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const resultEl = document.getElementById("result");

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

const html5QrCode = new Html5Qrcode("reader");

html5QrCode.start(
  { facingMode: "environment" },
  {
    fps: 15,
    qrbox: { width: 280, height: 120 },
    formatsToSupport: [
      Html5QrcodeSupportedFormats.CODE_128,
      Html5QrcodeSupportedFormats.CODE_39,
      Html5QrcodeSupportedFormats.PDF_417,
      Html5QrcodeSupportedFormats.QR_CODE,
    ],
    experimentalFeatures: { useBarCodeDetectorIfSupported: true },
  },
  async (code) => {
    if (cooldown) return;
    cooldown = true;

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
  },
  () => {}
);