import os
import zipfile
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report
import zlib
import re
import time
import joblib

# 在文件顶部添加配置常量
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB
MAX_CONTENT_SIZE = 2 * 1024 * 1024  # 2MB
TIMEOUT = 30  # 秒

# 预编译正则表达式（在函数外部）
PATTERNS = {
    'obfuscated': re.compile(r'(StrReverse|Chr\(\d+\)|_\s*$)'),
    'network': re.compile(r'(MSXML2\.XMLHTTP|WinHttpRequest|\.Open\s+"GET")'),
    # ... 其他预编译正则表达式 ...
}

def extract_features(file_path):

    features = {
        'has_macros': 0,
        'has_ole_objects': 0,
        'AutoOpen': 0,
        'Shell': 0,
        'WScript_Shell': 0,
        'Execute': 0,
        'ActiveXObject': 0,
        'file_size': os.path.getsize(file_path),
        'num_files': 0,
        'compression_ratio': 0.0,
        'CreateObject': 0,
        'RegWrite': 0,
        'FileSystemObject': 0,

        'obfuscated_code': 0,  # 混淆代码检测
        'suspicious_functions': 0,  # 危险函数调用次数
        'auto_execute_triggers': 0,  # 自动执行触发点
        'network_operations': 0,  # 网络操作次数
        'file_operations': 0,  # 文件操作次数
        'registry_operations': 0,  # 注册表操作次数
        'base64_strings': 0,  # Base64编码字符串
        'hex_strings': 0  # 十六进制字符串
    }
    try:
        with zipfile.ZipFile(file_path, 'r') as z:
            total_content_size = 0
            features['num_files'] = len(z.namelist())
            
            dangerous_functions = {
                'AutoOpen', 'Shell', 'WScript.Shell', 'Execute',
                'ActiveXObject', 'CreateObject', 'RegWrite', 'FileSystemObject'
            }
            
            # 新增辅助检测函数
            def detect_suspicious_patterns(text):
                patterns = {
                    'obfuscated': r'(StrReverse|Chr\(\d+\)|_\s*$)',
                    'network': r'(MSXML2\.XMLHTTP|WinHttpRequest|\.Open\s+"GET")',
                    'file_ops': r'(SaveAs|FileCopy|Kill|CreateTextFile)',
                    'registry': r'(RegWrite|RegDelete|RegRead)',
                    'base64': r'([A-Za-z0-9+/]{4}){3,}[A-Za-z0-9+/]{2}==?',
                    'hex': r'(\\x[0-9a-fA-F]{2}|&H[0-9a-fA-F]{4,})'
                }
                results = {}
                for key, pattern in patterns.items():
                    results[key] = len(re.findall(pattern, text, re.IGNORECASE))
                return results
            
            for item in z.namelist():
                
                # 仅处理可能包含宏的文件
                if not ('vbaProject.bin' in item or 'oleObject' in item):
                    continue
                
                try:
                    zinfo = z.getinfo(item)
                    if zinfo.file_size > MAX_CONTENT_SIZE:
                        continue
                        
                    with z.open(item) as content_file:
                        content = content_file.read()
                        # 内容大小检查
                        if len(content) > MAX_CONTENT_SIZE:
                            continue
                            
                        text = content.decode('utf-8', errors='ignore')
                        total_content_size += len(text)
                        
                        for kw in dangerous_functions:
                            if kw in text:
                                features[kw.replace('.','_')] = 1
                                
                         
                        # 新增内容分析
                        patterns = detect_suspicious_patterns(text)
                        features['obfuscated_code'] = int(patterns['obfuscated'] > 1)
                        features['network_operations'] += patterns['network']
                        features['file_operations'] += patterns['file_ops']
                        features['registry_operations'] += patterns['registry']
                        features['base64_strings'] += patterns['base64']
                        features['hex_strings'] += patterns['hex']
                        
                        # 检测自动执行链
                        execute_chain = re.search(
                            r'(Document_Open|AutoOpen).*?\.Run\s+[\w"]+',
                            text, 
                            re.DOTALL|re.IGNORECASE
                        )
                        if execute_chain:
                            features['auto_execute_triggers'] = 1
                            
                        # 检测危险函数调用链
                        dangerous_calls = re.findall(
                            r'(Shell|WScript\.Shell|CreateObject).*?\(.*?\)',
                            text
                        )
                        features['suspicious_functions'] = len(dangerous_calls)
                except Exception as e:
                    print(f"Error analyzing {item}: {str(e)}")
                    continue
                    
            
            # 新增压缩率特征
            if total_content_size > 0:
                compressed_size = sum(zinfo.file_size for zinfo in z.infolist())
                features['compression_ratio'] = compressed_size / total_content_size
                
    except zipfile.BadZipFile:
        print(f"Bad zip file: {file_path}")
        return None
    except zlib.error as e:
        print(f"Zlib error for file {file_path}: {e}")
        return None

    return features

# 数据集准备
def prepare_dataset(benign_dir, malicious_dir, output_csv='dataset.csv'):
    data = []
    labels = []
    
    # 处理良性文件
    for filename in os.listdir(benign_dir):
        path = os.path.join(benign_dir, filename)
        print(path)
        feats = extract_features(path)
        if feats:
            data.append(feats)
            labels.append(0)  # 良性标签为0
    
    # 处理恶意文件
    for filename in os.listdir(malicious_dir):
        path = os.path.join(malicious_dir, filename)
        print(path)
        feats = extract_features(path)
        if feats:
            data.append(feats)
            labels.append(1)  # 恶意标签为1
    
    # 保存特征和标签到CSV文件
    df = pd.DataFrame(data)
    df['label'] = labels
    df.to_csv(output_csv, index=False)
    
    return df, labels

def train():
    # 路径配置（根据实际情况修改）
    benign_dir = r"E:\Project\data\good"
    malicious_dir = r"E:\Project\data\bad"

    # 准备数据集
    df, labels = prepare_dataset(benign_dir, malicious_dir)
    print(df)

    # 划分训练集和测试集
    X_train, X_test, y_train, y_test = train_test_split(
        df, labels, test_size=0.2, random_state=42)

    # 训练随机森林分类器
    clf = RandomForestClassifier(n_estimators=100, random_state=42)

    clf.fit(X_train, y_train)

    # 评估模型
    y_pred = clf.predict(X_test)
    print(classification_report(y_test, y_pred))

    # 保存模型（可选）

    joblib.dump(clf, 'malicious_doc_classifier.pkl')


def generate_malicious_reasons(features):
    """根据特征生成恶意理由说明"""
    reasons = []
    
    # 基础特征判断
    if features.get('has_macros'):
        reasons.append("文档包含宏代码")
    if features.get('has_ole_objects'):
        reasons.append("包含OLE对象")
    
    # 危险函数检测
    danger_functions = {
        'Shell': "检测到Shell函数调用",
        'WScript_Shell': "检测到WScript.Shell对象创建",
        'Execute': "检测到代码执行函数",
        'ActiveXObject': "检测到ActiveX对象创建",
        'CreateObject': "检测到COM对象创建",
        'RegWrite': "检测到注册表写入操作",
        'FileSystemObject': "检测到文件系统操作"
    }
    for func, desc in danger_functions.items():
        if features.get(func, 0) >= 1:
            reasons.append(desc)
    
    # 高级特征判断
    if features.get('obfuscated_code'):
        reasons.append("存在代码混淆特征（如StrReverse、Chr函数等）")
    if features.get('auto_execute_triggers'):
        reasons.append("包含自动执行触发链（如Document_Open或AutoOpen）")
    if features.get('network_operations', 0) > 0:
        reasons.append(f"检测到{features['network_operations']}次网络操作请求")
    if features.get('file_operations', 0) > 0:
        reasons.append(f"检测到{features['file_operations']}次敏感文件操作")
    if features.get('registry_operations', 0) > 0:
        reasons.append(f"检测到{features['registry_operations']}次注册表操作")
    if features.get('suspicious_functions', 0) > 2:
        reasons.append(f"检测到{features['suspicious_functions']}次危险函数调用链")
    if features.get('base64_strings', 0) > 3:
        reasons.append("包含多个Base64编码字符串")
    if features.get('hex_strings', 0) > 3:
        reasons.append("包含多个十六进制编码字符串")
    
    # 压缩特征
    if features.get('compression_ratio', 0) < 0.1:
        reasons.append("异常压缩率（可能包含隐藏内容）")
    
    return reasons


def predict_file(file_path):
    """
    预测单个文件是否为恶意文档
    :param file_path: 要预测的文件路径
    :param model_path: 训练好的模型路径（默认使用当前目录的模型）
    :return: 包含预测结果、概率和特征的字典
    """
    # 加载训练好的模型
    MODEL_SAVE_PATH = os.path.join(os.path.dirname(__file__), 'malicious_docx_classifier.pkl')

    clf = joblib.load(MODEL_SAVE_PATH)
    
  
        # 生成判断结果
    result = {
        "probability": '-',
        "reasons":""
    }

    

    # 提取文件特征
    features = extract_features(file_path)
    if features is None:
        result["reasons"] = "文件可能损坏或不支持格式"
        return result

    # 转换为DataFrame（保持与训练时相同的列顺序）
    try:
        df = pd.DataFrame([features], columns=clf.feature_names_in_)
    except AttributeError:
        # 兼容旧版本scikit-learn
        df = pd.DataFrame([features])

    # 执行预测
    try:
        proba = clf.predict_proba(df)[0][1]  # 恶意类的概率
        result['probability'] = float(proba)
    except:
        result["reasons"] = "文件可能损坏或不支持格式"
        return result
    
    # 生成恶意理由
    # if proba>threshold:
    #     result['reasons'] = generate_malicious_reasons(features)
    # else:
    #     result['reasons'] = []

    result['reasons'] = generate_malicious_reasons(features)
    return result

# 使用示例
if __name__ == "__main__":
    test_file = r'E:\Project\maldoctect\test_data_good\产品发布会.pptx'
    result = predict_file(test_file, 0.5)
    print(result)
    
    print(f"置信度: {result['probability']*100:.2f}%")
    if result['is_malicious']:
            print("恶意理由:")
            for i, reason in enumerate(result['reasons'], 1):
                print(f"{i}. {reason}")
    else:
            print("无")


