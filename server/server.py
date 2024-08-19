import joblib
import random
import numpy as np
import pandas as pd

from sklearn.preprocessing import PolynomialFeatures, StandardScaler

def get_lat(lat):
    return lat + random.uniform(-0.000406*5, 0.000406*5)

def get_lng(lng):
    return lng + random.uniform(-0.000306*5, 0.000306*5)

if __name__ == "__main__":
    with open('files/pkl/model_v1.pkl', 'rb') as f:
        model = joblib.load(f)
    
    X = np.array([-6.911519,107.650041]).reshape(1,2)
    # load scaler
    X_scaled = scaler.transform(X)
    # load polynomial features
    X_scaled = poly.transform(X_scaled)

    Y_pred = model.predict(X_scaled) * 1e4
    print("coordinate: {0}".format(X))
    print("pred: {:,}".format(int(Y_pred)).replace(",", "."))
