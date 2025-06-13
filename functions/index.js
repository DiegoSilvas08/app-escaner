const functions = require("firebase-functions");
const axios = require("axios");
const Jimp = require("jimp");
const admin = require("firebase-admin");

admin.initializeApp();
const db = admin.firestore();

function codificarUrl(url) {
  try {
    const urlObj = new URL(url);
    urlObj.pathname = encodeURI(urlObj.pathname);
    return urlObj.toString();
  } catch (error) {
    console.error("Error codificando URL:", error);
    return url;
  }
}

async function descargarImagen(url) {
  const response = await axios.get(url, {responseType: "arraybuffer"});
  return Buffer.from(response.data, "binary");
}

function estaMarcada(imagen, x, y, radio = 5) {
  const regionSize = radio * 2;
  let suma = 0;
  let count = 0;

  for (let dx = -radio; dx < radio; dx++) {
    for (let dy = -radio; dy < radio; dy++) {
      const px = x + dx;
      const py = y + dy;

      if (px >= 0 && py >= 0 && px < imagen.bitmap.width && py < imagen.bitmap.height) {
        const color = Jimp.intToRGBA(imagen.getPixelColor(px, py));
        suma += color.r;
        count++;
      }
    }
  }

  const promedio = suma / count;
  return promedio < 128;
}

async function obtenerRespuestasCorrectas(examId) {
  const examRef = db.collection('exams').doc(examId);
  const doc = await examRef.get();
  
  if (!doc.exists) {
    throw new functions.https.HttpsError(
      'not-found',
      'Examen no encontrado'
    );
  }
  
  return doc.data().correctAnswers || [];
}

function calcularPuntaje(respuestasUsuario, respuestasCorrectas) {
  let correctas = 0;
  const results = [];
  
  respuestasUsuario.forEach((respuesta, index) => {
    const isCorrect = respuesta === respuestasCorrectas[index];
    if (isCorrect) correctas++;
    
    results.push({
      selected: respuesta,
      correct: respuestasCorrectas[index],
      isCorrect
    });
  });
  
  return {
    score: correctas,
    totalQuestions: respuestasCorrectas.length,
    answers: results
  };
}

async function procesarImagen(buffer) {
  const imagen = await Jimp.read(buffer);
  imagen.grayscale().invert();

  const coordenadasRespuestas = [];

  const respuestas = coordenadasRespuestas.map((fila) => {
    for (let i = 0; i < fila.length; i++) {
      const [x, y] = fila[i];
      if (estaMarcada(imagen, x, y)) return String.fromCharCode(65 + i);
    }
    return " ";
  });

  return respuestas.filter(r => r !== " ");
}

exports.calificarExamen = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'Se requiere autenticación'
    );
  }

  try {
    const { imageUrl, examId, userId } = data;

    if (!imageUrl || !examId) {
      throw new functions.https.HttpsError(
        'invalid-argument',
        'imageUrl y examId son requeridos'
      );
    }

    const respuestasCorrectas = await obtenerRespuestasCorrectas(examId);
    
    const buffer = imageUrl.startsWith('data:') ? 
      Buffer.from(imageUrl.split(',')[1], 'base64') : 
      await descargarImagen(codificarUrl(imageUrl));
    
    const respuestasUsuario = await procesarImagen(buffer);
    
    const { score, totalQuestions, answers } = calcularPuntaje(
      respuestasUsuario, 
      respuestasCorrectas
    );

    const resultData = {
      userId,
      examId,
      score,
      totalQuestions,
      answers,
      imageUrl,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      status: 'graded'
    };

    await db.collection('exam_results').add(resultData);

    return {
      success: true,
      score,
      answers,
      correctAnswers: respuestasCorrectas,
      totalQuestions
    };

  } catch (error) {
    console.error("Error en calificarExamen:", error);
    throw new functions.https.HttpsError(
      'internal',
      error.message || 'Error al procesar el examen'
    );
  }
});