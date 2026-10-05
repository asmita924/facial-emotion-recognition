console.log("EmotionAI JavaScript loaded!");

const imageInput = document.getElementById("imageInput");
const imagePreview = document.getElementById("imagePreview");
const predictButton = document.getElementById("predictButton");
const clearButton = document.getElementById("clearButton");
const result = document.getElementById("result");

let selectedFile = null;


// ===============================
// IMAGE SELECTION & PREVIEW
// ===============================

imageInput.addEventListener("change", function () {

    const file = this.files[0];

    if (!file) return;

    const allowedTypes = [
        "image/jpeg",
        "image/jpg",
        "image/png"
    ];

    if (!allowedTypes.includes(file.type)) {

        alert("Please select a JPG, JPEG or PNG image.");

        imageInput.value = "";

        return;
    }

    selectedFile = file;

    const reader = new FileReader();

    reader.onload = function (event) {

        // Put image inside the existing div
        imagePreview.innerHTML = `
            <img
                src="${event.target.result}"
                alt="Selected Image"
                class="preview-image"
            >
        `;

        imagePreview.style.display = "block";

        clearButton.style.display = "inline-block";
    };

    reader.readAsDataURL(file);
});


// ===============================
// ANALYZE EMOTION
// ===============================

predictButton.addEventListener("click", async function () {

    if (!selectedFile) {

        alert("Please select an image first.");

        return;
    }

    predictButton.disabled = true;

    predictButton.innerHTML = "⏳ Analyzing...";


    result.innerHTML = `
        <div class="loading-box">

            <div class="loader"></div>

            <h3>
                Analyzing Facial Expression
            </h3>

            <p>
                Our AI is processing the image...
            </p>

        </div>
    `;


    const formData = new FormData();

    formData.append("image", selectedFile);


    try {

        const response = await fetch("/predict", {

            method: "POST",

            body: formData

        });


        const data = await response.json();


        if (data.error) {

            result.innerHTML = `
                <div class="error-box">
                    ❌ ${data.error}
                </div>
            `;

            return;
        }


        displayResult(data);


    } catch (error) {

        result.innerHTML = `
            <div class="error-box">
                ❌ Something went wrong. Please try again.
            </div>
        `;

        console.error(error);

    } finally {

        predictButton.disabled = false;

        predictButton.innerHTML = "✨ Analyze Emotion";

    }

});


// ===============================
// DISPLAY RESULT
// ===============================

function displayResult(data) {

    result.innerHTML = `

        <div class="result-card">

            <div class="emotion-icon">
                ${getEmoji(data.emotion)}
            </div>

            <h2>
                ${data.emotion.toUpperCase()}
            </h2>

            <div class="confidence">

                Confidence:
                <strong>
                    ${data.confidence}%
                </strong>

            </div>


            <div class="probability-section">

                <h3>
                    Emotion Probabilities
                </h3>

                <div id="probabilityBars"></div>

            </div>

        </div>
    `;


    createProbabilityBars(data.probabilities);
}


// ===============================
// PROBABILITY BARS
// ===============================

function createProbabilityBars(probabilities) {

    const container =
        document.getElementById("probabilityBars");


    for (const emotion in probabilities) {

        const percentage =
            probabilities[emotion];


        const row =
            document.createElement("div");

        row.className =
            "probability-row";


        row.innerHTML = `

            <div class="probability-label">

                <span>
                    ${emotion}
                </span>

                <span>
                    ${percentage}%
                </span>

            </div>


            <div class="progress-container">

                <div
                    class="progress-bar"
                    style="width: 0%"
                >
                </div>

            </div>

        `;


        container.appendChild(row);


        setTimeout(function () {

            row.querySelector(
                ".progress-bar"
            ).style.width = percentage + "%";

        }, 100);

    }

}


// ===============================
// REMOVE IMAGE
// ===============================

clearButton.addEventListener("click", function () {

    selectedFile = null;

    imageInput.value = "";


    imagePreview.innerHTML = "";

    imagePreview.style.display = "none";


    clearButton.style.display = "none";


    result.innerHTML = `

        <div class="empty-result">

            <div class="empty-icon">
                😊
            </div>

            <h3>
                Ready to Analyze
            </h3>

            <p>
                Upload a facial image and click
                <strong>Analyze Emotion</strong>
                to get your result.
            </p>

        </div>

    `;

});


// ===============================
// EMOTION EMOJIS
// ===============================

function getEmoji(emotion) {

    const emojis = {

        angry: "😠",

        disgust: "🤢",

        fear: "😨",

        happy: "😊",

        neutral: "😐",

        sad: "😢",

        surprise: "😲"

    };


    return emojis[
        emotion.toLowerCase()
    ] || "🙂";

}