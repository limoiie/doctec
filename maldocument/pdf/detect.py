#-*- coding:utf-8 -*-
import joblib
import pandas as pd
from .utils import str2num,header2num,extract_features
import os

MODEL_SAVE_PATH = os.path.join(os.path.dirname(__file__), "random_forest_model.pkl")
feature_names = [
        'pdfsize', 'metadata size', 'pages', 'xref length', 'title characters',
        'isEncrypted', 'embedded files', 'images', 'text',
        'header', 'obj', 'endobj', 'stream', 'endstream', 'xref', 'trailer', 'startxref',
        'pageno', 'encrypt', 'ObjStm', 'JS', 'Javascript', 'AA', 'OpenAction', 'Acroform',
        'JBIG2Decode', 'RichMedia', 'launch', 'EmbeddedFile', 'XFA', 'URI', 'Colors'
    ]

def feature_clearn(features):
    features[8] = 1 if features[8] == 'Yes' else (-1 if features[8] in ('unclear', '-1') else 0)
    features[9] = header2num(features[9])
    features[10:] = [str2num(value) for value in features[10:]]

    return features

def predict_with_saved_model(f):
    # 加载保存的模型
    model = joblib.load(MODEL_SAVE_PATH)

    # 读取新数据
    features = extract_features(f)[1:]  # [97, 291, 1, 25, 5, 0, 0, 0, 'No', '%PDF-1.5', '23', '23', '11', '11', '1', '1', '1', '1', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0']
    features_clearn = feature_clearn(features)
    feature_vector = pd.DataFrame([features_clearn], columns=feature_names)

    # 进行预测
    predictions = model.predict(feature_vector)

    return features_clearn, predictions[0]

def describe(features):
    descriptions = []

    if features[10] != features[11] or features[12] != features[13]:
        descriptions.append("文件格式错误")
    if features[20] > 0 and features[21] > 0:
        descriptions.append("含有可疑脚本代码")
    if features[29] > 0:
        descriptions.append("含有可疑表单")
    if features[28] > 0:
        descriptions.append("含有可疑附件")
    if features[30] > 0:
        descriptions.append("含有可疑链接")

    return ', '.join(descriptions)

def detect(filename):
    feature_vector, predictions = predict_with_saved_model(filename)
    result = ''
    if predictions == 1:
        result = describe(feature_vector)
    return predictions, result
