from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd
import numpy as np
from sklearn.linear_model import LinearRegression
from sklearn.metrics.pairwise import cosine_similarity
from sklearn.feature_extraction.text import CountVectorizer

app = Flask(__name__)
CORS(app)

# --- Trending Destinations ---
@app.route('/trending-destinations', methods=['POST'])
def trending_destinations():
    data = request.json.get("destinations", {})
    predictions = {}
    for destination, trends in data.items():
        X = np.array(range(len(trends))).reshape(-1, 1)  # Time periods
        y = np.array(trends)  # Popularity values

        # Train a linear regression model
        model = LinearRegression()
        model.fit(X, y)

        # Predict the next trend value
        next_value = model.predict(np.array([[len(trends)]]))[0]
        predictions[destination] = next_value

    return jsonify(predictions)

# --- Personalized Recommendations ---
@app.route('/recommendations', methods=['POST'])
def recommendations():
    customer = request.json.get("customer", {})
    packages = request.json.get("packages", [])
    preferences = customer.get("preferences", {})

    # Convert package tags to a feature matrix
    tags = [pkg["tags"] for pkg in packages]
    vectorizer = CountVectorizer()
    package_matrix = vectorizer.fit_transform(tags)

    # Convert customer preferences to a vector
    preference_vector = np.array([[preferences.get(tag, 0) for tag in vectorizer.get_feature_names_out()]])

    # Calculate similarity scores
    similarity_scores = cosine_similarity(preference_vector, package_matrix)

    # Rank packages based on similarity scores
    ranked_packages = sorted(
        [{"package_id": pkg["id"], "score": score} for pkg, score in zip(packages, similarity_scores[0])],
        key=lambda x: x["score"],
        reverse=True,
    )

    return jsonify(ranked_packages)

# Run the server
if __name__ == '__main__':
    app.run(port=5000, debug=True)

