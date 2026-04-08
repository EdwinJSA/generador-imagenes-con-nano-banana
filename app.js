const express = require('express');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const multer = require('multer');
require('dotenv').config();

const app = express();
const upload = multer({ storage: multer.memoryStorage() }); 

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.set('view engine', 'ejs');
app.set('views', __dirname + '/views');

const genAI = new GoogleGenerativeAI(process.env.API_KEY);

app.get('/', (req, res) => {
    res.render('index', { image: null, error: null });
})

app.post('/generar', upload.single('logo'), async (req, res) => {
    try {
        const { prompt, style, aspectRatio, colors, typography } = req.body;

        const model = genAI.getGenerativeModel({ model: "gemini-3.1-flash-image-preview" });

        const textInstruction = `
            Task: Create a professional advertising graphic.
            Requirements:
            - Concept: ${prompt}
            - Style: ${style}
            - Visual Palette: ${colors}
            - Typography: ${typography}
            - Aspect Ratio: ${aspectRatio}
            - CRITICAL: Use the attached image as the ONLY company logo. Do not generate or invent any other logos or brand icons. Place it naturally in the composition.
        `;

        let contentParts = [textInstruction];

        if (req.file) {
            contentParts.push({
                inlineData: {
                    data: req.file.buffer.toString("base64"),
                    mimeType: req.file.mimetype
                }
            });
        }

        const result = await model.generateContent(contentParts);
        const response = await result.response;
        const candidate = response.candidates[0];

        const imagePart = candidate.content.parts.find(part => part.inlineData);

        if (imagePart) {
            const imageBase64 = imagePart.inlineData.data;
            const mimeType = imagePart.inlineData.mimeType || 'image/png';
            const imageSrc = `data:${mimeType};base64,${imageBase64}`;
            
            res.render('index', { image: imageSrc, error: null });
        } else {
            res.render('index', { image: null, error: "La IA generó texto pero no una imagen. Intenta ser más específico." });
        }

    } catch (error) {
        console.error("Error en Kira AI:", error);
        res.render('index', { image: null, error: "Hubo un problema al procesar la imagen con el logo." });
    }
});
