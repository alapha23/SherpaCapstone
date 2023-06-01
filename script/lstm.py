"""
Script for running the LSTM model. Takes in the uploaded csv file -> Make sure there are at least 200 recordings in the df -> reshape it for the model -> Output the prediction.

When should this script be executed?
-> As soon as the user clicks on the "Predict using LSTM" button.
"""

import pandas as pd
import numpy as np
import sys, os
from tensorflow.keras.models import load_model

filepath = sys.argv[1]

df = pd.read_csv(filepath)
row_count = len(df)
min = 200

model_path = os.path.join(os.getcwd(), "script")
model_path = os.path.join(model_path, "lstm.h5")
lstm_model = load_model(model_path)

#Check if the input csv has enough number of recordings. We need at least 200 recordings

if(row_count >= min):
    test = df.iloc[:min, 1:10].values
    test = test.reshape((1, 200, 9))
    prediction = lstm_model.predict(test)
    if(prediction <= 0.5):
        condition = "Healthy"
        prediction = 1-prediction
    else:
        condition = "Unhealthy"
    print(f";(LSTM) There is {prediction*100}% chance that the plant is {condition}")

else:
    print(";Not enough number of recordings. The model requires at least 200 recordings in the csv file")


