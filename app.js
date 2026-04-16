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