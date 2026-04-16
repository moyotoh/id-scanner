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

const hints = new Map();
hints.set(ZXing.DecodeHintType.TRY_HARDER, true);
hints.set(ZXing.DecodeHintType.POSSIBLE_FORMATS, [
  ZXing.BarcodeFormat.CODE_128,
  ZXing.BarcodeFormat.CODE_39,
  ZXing.BarcodeFormat.PDF_417,
  ZXing.BarcodeFormat.QR_CODE,
]);

const codeReader = new ZXing.BrowserMultiFormatReader(hints);

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