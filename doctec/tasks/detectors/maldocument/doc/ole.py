import os
import re
import time
import math
import joblib
import pandas as pd
import olefile
from collections import defaultdict
from oletools.olevba import VBA_Parser
from sklearn.ensemble import RandomForestClassifier
from sklearn.feature_selection import RFECV
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report
import sys

# 配置常量
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB
ANALYSIS_TIMEOUT = 45  # 秒

# 预编译正则表达式
PATTERNS = {
    'shell': re.compile(r'(Shell|WScript\.Shell|CreateObject)'),
    'auto_open': re.compile(r'(AutoOpen|Document_Open|Workbook_Open)'),
    'suspicious': re.compile(r'(RegWrite|SaveAs|Kill|CreateTextFile|ADODB\.Stream)'),
    'obfuscation': re.compile(r'(Chr\(|StrReverse|ExecuteGlobal|Base64|Xor)'),
    'network': re.compile(r'(MSXML2\.XMLHTTP|WinHttpRequest|\.Open\s+"GET")'),
    'hex': re.compile(r'(&H[0-9A-F]{4,})'),
    'dynamic_exec': re.compile(r'Execute\s+(\w+)\s*=\s*(\w+)\s*&\s*Chr\(\d+\)', re.I),
    'suspicious_stream': re.compile(r'(VBA|macro|payload|exploit)', re.I),
    'suspicious_apis': re.compile(r'(Shell|RegWrite|CreateObject|Open)')
}


def entropy(s):
    """计算字符串熵值"""
    freq = {}
    for char in s:
        freq[char] = freq.get(char, 0) + 1
    prob = [f / len(s) for f in freq.values()]
    return -sum(p * math.log(p) / math.log(2) for p in prob)


def analyze_obfuscation(code):
    """反混淆特征分析"""
    lines = code.split('\n')
    obf_features = {
        'high_entropy_str': 0,
        'dynamic_exec': 0,
        'hex_obfuscation': 0,
        'compression_ratio': 0.0
    }

    # 高熵字符串检测
    strings = re.findall(r'"([^"]+)"', code)
    obf_features['high_entropy_str'] = sum(1 for s in strings if entropy(s) > 3.5)

    # 动态代码构造
    obf_features['dynamic_exec'] = len(PATTERNS['dynamic_exec'].findall(code))

    # 十六进制混淆
    obf_features['hex_obfuscation'] = len(PATTERNS['hex'].findall(code))

    # 代码压缩率
    cleaned_code = code.replace(' ', '').replace('\t', '')
    obf_features['compression_ratio'] = len(code) / (len(cleaned_code) + 1e-5)

    return obf_features


def analyze_api_calls(code):
    """API调用图分析"""
    call_graph = defaultdict(set)
    current_func = None

    for line in code.split('\n'):
        # 检测函数定义
        if line.strip().startswith(('Sub ', 'Function ')):
            parts = line.split()
            current_func = parts[1].split('(')[0] if len(parts) > 1 else None
        # 检测API调用
        elif current_func:
            for api in PATTERNS['suspicious_apis'].findall(line):
                call_graph[current_func].add(api)

    # 计算特征
    api_features = {
        'max_api_depth': 0,
        'cross_func_calls': 0.0,
        'dangerous_combinations': 0
    }

    if call_graph:
        # 计算调用深度（从入口函数开始）
        entry_points = [f for f in call_graph if 'Auto' in f or 'Open' in f]
        for entry in entry_points:
            stack = [(entry, 1)]
            while stack:
                func, depth = stack.pop()
                api_features['max_api_depth'] = max(api_features['max_api_depth'], depth)
                for callee in call_graph[func]:
                    stack.append((callee, depth + 1))

        # 跨函数调用比例
        total_calls = sum(len(callees) for callees in call_graph.values())
        api_features['cross_func_calls'] = total_calls / len(call_graph)

        # 危险组合检测（如Shell后接网络请求）
        dangerous_pairs = [('CreateObject', 'Open'), ('RegWrite', 'Shell')]
        api_features['dangerous_combinations'] = sum(
            1 for funcs in call_graph.values()
            for pair in dangerous_pairs
            if pair[0] in funcs and pair[1] in funcs
        )

    return api_features


def extract_ole_features(file_path):
    """增强版OLE特征提取"""
    start_time = time.time()
    features = {
        # 基础特征
        'file_size': os.path.getsize(file_path),
        'has_macros': 0,
        'macro_count': 0,
        'suspicious_functions': 0,
        'auto_exec_triggers': 0,
        'obfuscated_code': 0,

        # 结构特征
        'ole_objects': 0,
        'hidden_streams': 0,
        'suspicious_streams': 0,
        'max_dir_depth': 0,



        # 反混淆特征
        'high_entropy_str': 0,
        'dynamic_exec_count': 0,
        'hex_obfuscation': 0,
        'code_compression_ratio': 0.0,

        # API调用特征
        'max_api_depth': 0,
        'cross_func_ratio': 0.0,
        'dangerous_combinations': 0
    }

    try:

        # OLE结构分析
        with olefile.OleFileIO(file_path) as ole:
            streams = ole.listdir()
            features.update({
                'ole_objects': sum(1 for s in streams if s[0].startswith('Ole')),
                'hidden_streams': sum(1 for s in streams if s[0].startswith('\x05')),
                'suspicious_streams': sum(1 for s in streams if PATTERNS['suspicious_stream'].search('/'.join(s))),
                'max_dir_depth': max(len(s) for s in streams),

            })

        # 宏分析
        vba_parser = VBA_Parser(file_path)
        macro_code = ""
        if vba_parser.detect_vba_macros():
            features['has_macros'] = 1
            try:
                macro_data = []
                for vba in vba_parser.extract_macros():
                    if time.time() - start_time > ANALYSIS_TIMEOUT:
                        break
                    macro_data.append(vba[3])
                    features['macro_count'] += 1

                macro_code = '\n'.join(macro_data)

                # 基础特征
                features.update({
                    'auto_exec_triggers': len(PATTERNS['auto_open'].findall(macro_code)),
                    'suspicious_functions': len(PATTERNS['suspicious'].findall(macro_code)),
                    'obfuscated_code': len(PATTERNS['obfuscation'].findall(macro_code)),
                })

                # 反混淆分析
                obf_feats = analyze_obfuscation(macro_code)
                features.update({
                    'high_entropy_str': obf_feats['high_entropy_str'],
                    'dynamic_exec_count': obf_feats['dynamic_exec'],
                    'hex_obfuscation': obf_feats['hex_obfuscation'],
                    'code_compression_ratio': obf_feats['compression_ratio']
                })

                # API调用分析
                api_feats = analyze_api_calls(macro_code)
                features.update({
                    'max_api_depth': api_feats['max_api_depth'],
                    'cross_func_ratio': api_feats['cross_func_calls'],
                    'dangerous_combinations': api_feats['dangerous_combinations']
                })

            except Exception as e:
                print(f"宏分析错误: {str(e)}")
            finally:
                vba_parser.close()

        return features

    except Exception as e:
        print(f"文件解析失败 {file_path}: {str(e)}")
        return None


# 特征选择增强版训练
def train_enhanced():
    df = pd.read_csv('ole1_dataset1.csv')
    X = df.drop('label', axis=1)
    y = df['label']

    # 递归特征消除
    selector = RFECV(
        estimator=RandomForestClassifier(n_estimators=50),
        step=1,
        cv=3,
        scoring='f1'
    )
    X_selected = selector.fit_transform(X, y)

    # 划分数据集
    X_train, X_test, y_train, y_test = train_test_split(
        X_selected, y, test_size=0.2, random_state=42
    )

    # 优化后的模型
    clf = RandomForestClassifier(
        n_estimators=200,
        max_depth=12,
        class_weight='balanced',
        random_state=42,
        n_jobs=-1
    )

    clf.fit(X_train, y_train)

    # 评估
    y_pred = clf.predict(X_test)
    print(classification_report(y_test, y_pred))

    # 保存模型和特征选择器
    joblib.dump(clf, 'enhanced_ole_model.pkl')
    joblib.dump(selector, 'feature_selector.pkl')
    print("模型和特征选择器已保存")


def generate_malicious_reasons(features):
    reasons = []
        
    # 根据特征生成判断理由
    if features.get('has_macros', 0) == 1:
        reasons.append("包含宏代码")
    if features.get('suspicious_functions', 0) > 3:
        reasons.append(f"检测到{features['suspicious_functions']}个可疑函数调用")
    if features.get('auto_exec_triggers', 0) > 0:
        reasons.append("存在自动执行触发器")
    if features.get('obfuscated_code', 0) > 5:
        reasons.append("代码高度混淆")
    if features.get('high_entropy_str', 0) > 3:
        reasons.append("包含高熵混淆字符串")
    if features.get('hex_obfuscation', 0) > 5:
        reasons.append("检测到十六进制混淆")
    if features.get('code_compression_ratio', 0) > 1.5:
        reasons.append("异常代码压缩率")
    if features.get('max_api_depth', 0) > 3:
        reasons.append("复杂的API调用链")
    if features.get('dangerous_combinations', 0) > 0:
        reasons.append("检测到危险API组合")
    if features.get('suspicious_streams', 0) > 0:
        reasons.append("存在可疑数据流")

    return reasons

def prepare_dataset(benign_dir, malicious_dir, output_csv='ole1_dataset1.csv'):
    data = []
    labels = []

    # 处理良性样本
    for fname in os.listdir(benign_dir):
        path = os.path.join(benign_dir, fname)
        feats = extract_ole_features(path)
        if feats:
            data.append(feats)
            labels.append(0)
            print(f"处理良性文件: {fname}")

    # 处理恶意样本
    for fname in os.listdir(malicious_dir):
        path = os.path.join(malicious_dir, fname)
        feats = extract_ole_features(path)
        if feats:
            data.append(feats)
            labels.append(1)
            print(f"处理恶意文件: {fname}")

    df = pd.DataFrame(data)
    df['label'] = labels
    df.to_csv(output_csv, index=False)


# 增强版预测函数
def predict_file(file_path):
    """增强版预测函数"""
    result = {
        "probability": '-',
        "reasons":""
    }
    if getattr(sys, 'frozen', False):
        base_dir = os.path.join(__file__[:__file__.index('doctec')],'build')  # 打包后的资源路径
    else:
        base_dir = 'E:\Project\maldoctect\doctec\public'  # 开发环境路径

    MODEL_SAVE_PATH1 = os.path.join(base_dir, 'checkpoints', 'enhanced_ole_model.pkl')
    MODEL_SAVE_PATH2 = os.path.join(base_dir, 'checkpoints', 'feature_selector.pkl')

    # 加载模型和选择器
    clf = joblib.load(MODEL_SAVE_PATH1)
    selector = joblib.load(MODEL_SAVE_PATH2)

     # 提取特征
    features = extract_ole_features(file_path)
    if not features:
        result['reasons'] = '特征提取失败'
        return result

    # 转换为DataFrame
    df = pd.DataFrame([features])

    # 特征选择
    selected = selector.transform(df)

    # 预测
    proba = clf.predict_proba(selected)[0][1]
    result['probability'] = float(proba)
    result['reasons'] = "；".join(generate_malicious_reasons(features))
    return result


# 使用示例
if __name__ == "__main__":
    # 重新训练增强模型
    # prepare_dataset(r"E:\Project\data\stream\good", r"E:\Project\data\stream/bad")  # 需要先准备数据
    # train_enhanced()

    # 执行预测
    result = predict_file(r"E:\Project\maldoctect\附件11：答辩表决票.doc")
    print(result)