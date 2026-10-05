from flask import Flask, render_template, request, jsonify
import tensorflow as tf
import numpy as np
import os


# ==========================================
# CREATE FLASK APPLICATION
# ==========================================

app = Flask(__name__)


# ==========================================
# LOAD TRAINED EMOTION MODEL
# ==========================================

model = tf.keras.models.load_model(
    "final_emotion_model.keras"
)


# ==========================================
# EMOTION CLASSES
# ==========================================

class_names = [
    "angry",
    "disgust",
    "fear",
    "happy",
    "neutral",
    "sad",
    "surprise"
]


# ==========================================
# HOME PAGE
# ==========================================

@app.route("/")
def home():

    return render_template("index.html")


# ==========================================
# PREDICTION
# ==========================================

@app.route("/predict", methods=["POST"])
def predict():

    # Check whether image was uploaded

    if "image" not in request.files:

        return jsonify({
            "error": "No image uploaded"
        })


    image_file = request.files["image"]


    if image_file.filename == "":

        return jsonify({
            "error": "No image selected"
        })


    # Save temporary image

    image_path = "temp_image.jpg"

    image_file.save(image_path)


    try:

        # Load image

        image = tf.keras.utils.load_img(
            image_path,
            target_size=(48, 48),
            color_mode="rgb"
        )


        # Convert image to array

        image_array = tf.keras.utils.img_to_array(
            image
        )


        # Add batch dimension

        image_array = np.expand_dims(
            image_array,
            axis=0
        )


        # VGG19 preprocessing

        image_array = tf.keras.applications.vgg19.preprocess_input(
            image_array
        )


        # Make prediction

        prediction = model.predict(
            image_array,
            verbose=0
        )


        # Get predicted emotion

        predicted_index = np.argmax(
            prediction[0]
        )


        predicted_emotion = class_names[
            predicted_index
        ]


        # Get confidence

        confidence = (
            prediction[0][predicted_index] * 100
        )


        # Get probabilities for all emotions

        probabilities = {}

        for i in range(len(class_names)):

            probabilities[class_names[i]] = round(
                float(prediction[0][i] * 100),
                2
            )


        return jsonify({

            "emotion": predicted_emotion,

            "confidence": round(
                float(confidence),
                2
            ),

            "probabilities": probabilities

        })


    except Exception as e:

        return jsonify({
            "error": str(e)
        })


    finally:

        # Delete temporary image

        if os.path.exists(image_path):

            os.remove(image_path)


# ==========================================
# RUN APPLICATION
# ==========================================

if __name__ == "__main__":

    app.run(
        debug=True
    )