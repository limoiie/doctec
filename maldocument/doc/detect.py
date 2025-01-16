# -*- coding: utf-8 -*-
import joblib
import numpy as np
import os
from . import get_doc_feature
from . import extractFeature
from shared.feature_analysis import analyze_vector_features

def detect(filename):
    MODEL_SAVE_PATH = os.path.join(os.path.dirname(__file__), "random_forest_model.pkl")
    model = joblib.load(MODEL_SAVE_PATH)
    analysis = extractFeature.OfficeFeatureExtractor(filename)
    doc_stream = get_doc_feature.get_doc_feature(filename)
    all_ole_code = str(doc_stream.get_doc_all_ole())
    vector = analysis.print_analysis(all_ole_code)
    vector = [int(x) for x in vector.split(",")]
    unknown_sample = np.array(vector).reshape(1, -1)
    probabilities = model.predict(unknown_sample)

    return probabilities

def describe(filename):
    try:
        analysis = extractFeature.OfficeFeatureExtractor(filename)
        doc_stream = get_doc_feature.get_doc_feature(filename)
        all_ole_code = str(doc_stream.get_doc_all_ole())
        vector = analysis.print_analysis(all_ole_code)
        vector = [int(x) for x in vector.split(",")]
        result = analysis.showResults(all_ole_code)
        
        return analyze_vector_features(vector, result)
    except:
        raise

def describe_chinese(filename):
    try:
        analysis = extractFeature.OfficeFeatureExtractor(filename)
        doc_stream = get_doc_feature.get_doc_feature(filename)
        all_ole_code = str(doc_stream.get_doc_all_ole())
        vector = analysis.print_analysis(all_ole_code)
        vector = [int(x) for x in vector.split(",")]
        result = analysis.showResults(all_ole_code)
        
        return analyze_vector_features(vector, result, chinese=True)
    except:
        raise