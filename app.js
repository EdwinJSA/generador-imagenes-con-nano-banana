// const express = require('express');
// const { GoogleGenerativeAI } = require('@google/generative-ai');
// const multer = require('multer');
// require('dotenv').config();

// const app = express();
// const upload = multer({ storage: multer.memoryStorage() }); 

// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));
// app.set('view engine', 'ejs');
// app.set('views', __dirname + '/views');

// const genAI = new GoogleGenerativeAI(process.env.API_KEY);

// app.get('/', (req, res) => {
//     res.render('index', { image: null, error: null });
// })

// app.post('/generar', upload.single('logo'), async (req, res) => {
//     try {
//         const { prompt, style, aspectRatio, colors, typography } = req.body;

//         const model = genAI.getGenerativeModel({ model: "gemini-3.1-flash-image-preview" });

//         const textInstruction = `
//             Task: Create a professional advertising graphic in ULTRA HIGH RESOLUTION (2K o 4K) with the following details:
//             Requirements:
//             - Concept: ${prompt}
//             - Style: ${style}
//             - Visual Palette: ${colors}
//             - Typography: ${typography}
//             - Aspect Ratio: ${aspectRatio}
//             - CRITICAL: Use the attached image as the ONLY company logo. Do not generate or invent any other logos or brand icons. Place it naturally in the composition.
//         `;

//         let contentParts = [textInstruction];

//         if (req.file) {
//             contentParts.push({
//                 inlineData: {
//                     data: req.file.buffer.toString("base64"),
//                     mimeType: req.file.mimetype
//                 }
//             });
//         }

//         const numeroDePropuestas = 3;
//         const promesas = [];

//         for (let i = 0; i < numeroDePropuestas; i++) {
//             promesas.push(model.generateContent(contentParts));
//         }

//         const resultados = await Promise.all(promesas);
//         const imagenesGeneradas = [];

//         resultados.forEach(result => {
//             const candidate = result.response.candidates[0];
//             const imagePart = candidate.content.parts.find(part => part.inlineData);
            
//             if (imagePart) {
//                 const imageBase64 = imagePart.inlineData.data;
//                 const mimeType = imagePart.inlineData.mimeType || 'image/png';
//                 imagenesGeneradas.push(`data:${mimeType};base64,${imageBase64}`);
//             }
//         });

//         if (imagenesGeneradas.length > 0) {
//             res.render('index', { images: imagenesGeneradas, error: null });
//         } else {
//             res.render('index', { images: null, error: "La IA no pudo generar las imágenes. Intenta ser más específico." });
//         }

//     } catch (error) {
//         console.error("Error:", error);
//         res.render('index', { images: null, error: "Hubo un error..." }); // <-- Plural aquí también
//     }
// });


// module.exports = app;


const express = require('express');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const multer = require('multer');
const random = require('./utils/random');
require('dotenv').config();

const app = express();
const upload = multer({ storage: multer.memoryStorage() }); 

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.set('view engine', 'ejs');
app.set('views', __dirname + '/views');

const genAI = new GoogleGenerativeAI(process.env.API_KEY);

app.get('/', (req, res) => {
    res.render('index', { images: null, error: null });
})


app.post('/generar', upload.single('logo'), async (req, res) => {
    try {
        const { prompt, colors, typography, aspectRatio } = req.body;
        const model = genAI.getGenerativeModel({ model: "gemini-3.1-flash-image-preview" });

        const variaciones = [
            {
                type: "action-heavy",
                outfit: "full white protective suit with respirator mask and gloves",
                scene: "actively spraying a bed with visible mist spreading in the air",
                environment: "residential bedroom, slightly dramatic lighting",
                mood: "intense, high action",
                ratio: "4:5"
            },
            {
                type: "precision-work",
                outfit: "light professional uniform with gloves",
                scene: "carefully applying treatment to mattress seams using a small sprayer",
                environment: "close-up bedroom scene",
                mood: "detailed, precise, technical",
                ratio: "4:5"
            },
            {
                type: "inspection",
                outfit: "uniform polo shirt with cap and flashlight",
                scene: "inspecting a mattress closely with a flashlight",
                environment: "dim bedroom, focused lighting",
                mood: "investigation, expert diagnosis",
                ratio: "4:5"
            },
            {
                type: "trust-home",
                outfit: "clean red and black uniform",
                scene: "standing next to a clean bed, smiling slightly, holding equipment",
                environment: "bright modern bedroom",
                mood: "safe, calm, trustworthy",
                ratio: "4:5"
            },
            {
                type: "family-safe",
                outfit: "friendly professional uniform",
                scene: "technician explaining service to a family near a bedroom",
                environment: "clean home interior",
                mood: "friendly, safe for family",
                ratio: "4:5"
            },
            {
                type: "equipment-focus",
                outfit: "industrial uniform",
                scene: "holding and preparing professional fumigation equipment",
                environment: "garage or home entrance",
                mood: "professional tools, expert service",
                ratio: "1:1"
            },
            {
                type: "corporate-branding",
                outfit: "dark gray uniform with cap",
                scene: "standing next to a branded service vehicle outside a house",
                environment: "residential exterior",
                mood: "business, premium service",
                ratio: "16:9"
            },
            {
                type: "before-after",
                outfit: "protective uniform",
                scene: "half image showing untreated bed and half clean treated bed",
                environment: "split visual bedroom scene",
                mood: "transformation, effectiveness",
                ratio: "1:1"
            },
            {
                type: "hygiene-clean",
                outfit: "clean white uniform",
                scene: "spraying lightly in a spotless bedroom with sunlight entering",
                environment: "very bright and minimal room",
                mood: "clean, fresh, hygienic",
                ratio: "4:5"
            },
            {
                type: "entry-service",
                outfit: "uniform with backpack sprayer",
                scene: "technician entering a house through the front door with equipment",
                environment: "house entrance exterior",
                mood: "service arrival, professional",
                ratio: "16:9"
            }
        ];

        const imagenesGeneradas = [];

        const variacionesAleatorias = random.getRandomVariations(variaciones, 3);

        for (const v of variacionesAleatorias) {
            const fullPrompt = `
                You are a professional advertising creative director.

                Client request:
                "${prompt}"

                Create a photorealistic pest control advertisement in 2K.

                MAIN SUBJECT:
                A professional Hispanic male pest control technician.

                STRICT VARIATION RULES:

                - Outfit: ${v.outfit}
                - Scene: ${v.scene}
                - Environment: ${v.environment}
                - Mood: ${v.mood}

                The variation MUST look clearly different from other versions in:
                - clothing
                - posture
                - situation
                - visual storytelling

                Keep consistent:
                - same service (pest control)
                - same client message
                - same contact info if provided

                Design:

                - Clean advertising layout
                - Space for text
                - Color palette: ${colors || "red and white"}
                - Aspect ratio: ${ aspectRatio || v.ratio}

                Style:

                - Ultra realistic photography
                - Natural lighting
                - Sharp focus

                Avoid:

                - Cartoon
                - 3D render
                - Unrealistic skin
            `;

            let currentContentParts = [fullPrompt];
            if (req.file) {
                currentContentParts.push({
                    inlineData: {
                        data: req.file.buffer.toString("base64"),
                        mimeType: req.file.mimetype
                    }
                });
            }

            const result = await model.generateContent(currentContentParts);
            const candidate = result.response.candidates[0];
            const imagePart = candidate.content.parts.find(p => p.inlineData);
            
            if (imagePart) {
                imagenesGeneradas.push(`data:${imagePart.inlineData.mimeType};base64,${imagePart.inlineData.data}`);
            }
        }

        if (imagenesGeneradas.length > 0) {
            res.render('index', { images: imagenesGeneradas, error: null });
        } else {
            res.render('index', { images: null, error: "No se pudieron generar las imágenes." });
        }

    } catch (error) {
        console.error("Error técnico:", error);
        res.render('index', { images: null, error: "Error en el servidor. Intenta de nuevo." });
    }
});



app.listen(3000, () => {
    console.log('Servidor iniciado en el puerto http://localhost:3000/');
});