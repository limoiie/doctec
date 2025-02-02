# -*- coding: utf-8 -*-

def analyze_vector_features(vector, result, chinese=False):
    """Common analysis logic for both doc and docx feature vectors"""
    messages = {
        122: {
            2: ('Longer Confused String', '较长的混淆字符串,'),
            1: ('Confused String', '混淆的字符串,')
        },
        123: {
            3: ('More Confused Strings', '较多的混淆字符串,'),
            2: ('Less Confused Strings', '少量的混淆字符串,')
        },
        124: {
            1: ('The Strings has function name', '字符串具有函数名称,')
        },
        125: {
            3: ('More long function name', '较多长函数名,'),
            2: ('Less long function name', '较少长函数名,')
        },
        126: {
            3: ('More long Strings', '较多长字符串,'),
            2: ('Less long Strings', '较少长字符串,')
        },
        127: {
            3: ('More long var', '较多长变量,'),
            2: ('Less long var', '较少长变量,')
        },
        128: {
            1: ('More circulation', '较多循环,')
        },
        129: {
            1: ('More Compare', '较多比较,')
        },
        130: {
            1: ('More Calculate', '较多计算,')
        },
        131: {
            3: ('More plus signs in Strings', '较多的加号在字符串中,'),
            2: ('Less plus signs in Strings', '较少的加号在字符串中,')
        }
    }

    for feature_id, value_map in messages.items():
        if vector[feature_id] in value_map:
            msg_en, msg_zh = value_map[vector[feature_id]]
            result += (msg_zh if chinese else msg_en) + '\n'
            
    return result 