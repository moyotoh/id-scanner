import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { getFirestore, doc, getDoc, deleteDoc } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

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
let framesSinceDetect = 0;
let consecutiveDetects = 0;
let pendingCode = null;

function showResult(text, type) {
  resultEl.textContent = text;
  resultEl.className = "visible " + type;
  if (resetTimer) clearTimeout(resetTimer);
  resetTimer = setTimeout(() => {
    resultEl.className = "";
    resultEl.textContent = "";
    cooldown = false;
    framesSinceDetect = 0;
    consecutiveDetects = 0;
    pendingCode = null;
    showHint("Hold strekkoden i bildet");
  }, 2500);
}

function showHint(text) {
  resultEl.textContent = text;
  resultEl.className = "visible hint";
}

async function handleCode(code) {
  if (cooldown) return;
  if (code === pendingCode) {
    consecutiveDetects++;
  } else {
    pendingCode = code;
    consecutiveDetects = 1;
  }

  if (consecutiveDetects < 3) {
    showHint("Skanner...");
    return;
  }

  cooldown = true;
  showHint("Skanner...");

  setTimeout(async () => {
    try {
      const docSnap = await getDoc(doc(db, "students", code));
      if (docSnap.exists()) {
        await deleteDoc(doc(db, "students", code));
        showResult("✓ Funnet: " + code, "found");
      } else {
        showResult("✗ Ikke funnet: " + code, "notfound");
      }
    } catch (e) {
      showResult("Feil: " + e.message, "notfound");
    }
  }, 600);
}

navigator.mediaDevices.getUserMedia({
  video: { facingMode: "environment", width: { ideal: 1920 }, height: { ideal: 1080 } }
}).then(stream => {
  videoEl.srcObject = stream;
  videoEl.play();
  showHint("Hold strekkoden i bildet");

  if ("BarcodeDetector" in window) {
    const detector = new BarcodeDetector({
      formats: ["code_128", "code_39", "pdf417", "qr_code"]
    });

    async function scanNative() {
      if (videoEl.readyState === videoEl.HAVE_ENOUGH_DATA && !cooldown) {
        try {
          const barcodes = await detector.detect(videoEl);
          if (barcodes.length > 0) {
            framesSinceDetect = 0;
            await handleCode(barcodes[0].rawValue);
          } else {
            consecutiveDetects = 0;
            pendingCode = null;
            framesSinceDetect++;
            if (framesSinceDetect > 60) {
              showHint("Ingen strekkode funnet – prøv å juster avstanden");
            } else if (framesSinceDetect > 30) {
              showHint("Hold strekkoden stødig i bildet");
            } else {
              showHint("Hold strekkoden i bildet");
            }
          }
        } catch (e) {}
      }
      requestAnimationFrame(scanNative);
    }
    scanNative();

  } else {
    // ZXing fallback for browsers without BarcodeDetector
    const hints = new Map();
    hints.set(ZXing.DecodeHintType.TRY_HARDER, true);
    const codeReader = new ZXing.BrowserMultiFormatReader(hints);
    codeReader.decodeFromVideoElement(videoEl, async (result, err) => {
      if (!result || cooldown) return;
      await handleCode(result.getText());
    });
  }

}).catch(err => {
  resultEl.textContent = "Kamerafeil: " + err.message;
  resultEl.className = "visible notfound";
});