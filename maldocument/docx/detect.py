#!/usr/bin/env python 2.7
# -*- coding: utf-8 -*-
import joblib
import numpy as np
import os
from . import extractFeature
from . import oleDocx
from . import xmlDocx
from . import vbaDocx
from shared.feature_analysis import analyze_vector_features

def get_all_code(filename):
    vba_parser = vbaDocx.vba_parser(filename)
    ole_parser = oleDocx.ole_parser(filename)
    xml_parser = xmlDocx.xml_parser(filename)
    
    vba_code = vba_parser.get_vba()
    ole_code = ole_parser.get_ole()
    xml_code = xml_parser.get_xml_dde()
    
    return str(vba_code) + xml_code + ole_code

def detect(filename):
    MODEL_SAVE_PATH = os.path.join(os.path.dirname(__file__), "random_forest_model.pkl")
    model = joblib.load(MODEL_SAVE_PATH)
    analysis = extractFeature.OfficeFeatureExtractor(filename)
    all_code = get_all_code(filename)
    vector = analysis.print_analysis(all_code)
    vector = [int(x) for x in vector.split(",")]
    for i in range(672 - len(vector)):
        vector.append(-1)
    unknown_sample = np.array(vector).reshape(1, -1)
    probabilities = model.predict(unknown_sample)

    return probabilities[0]

def describe(filename):
    try:
        all_code = get_all_code(filename)
        analysis = extractFeature.OfficeFeatureExtractor(filename)
        vector = analysis.print_analysis(all_code)
        vector = [int(x) for x in vector.split(",")]
        result = analysis.showResults(all_code)
        
        return analyze_vector_features(vector, result)
    except:
        raise

def describe_chinese(filename):
    try:
        all_code = get_all_code(filename)
        analysis = extractFeature.OfficeFeatureExtractor(filename)
        vector = analysis.print_analysis(all_code)
        vector = [int(x) for x in vector.split(",")]
        result = analysis.showResults(all_code)
        
        return analyze_vector_features(vector, result, chinese=True)
    except:
        raise

