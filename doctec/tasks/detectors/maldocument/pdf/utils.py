import os
import pymupdf
from . import pdfid


def extract_features(f):
    filename = os.path.basename(f)

    # 从 pymupdf 提取的基本特征
    try:
        doc = pymupdf.open(f)
        metadata = doc.metadata
        title = metadata.get('title', '')
        isEncrypted = 1 if metadata.get('encryption') else 0
        objects = doc.xref_length()
        numPages = doc.page_count
        pdfsize = int(os.path.getsize(f) / 1000)
        found = "No"
        text = ""
        try:
            for page in doc:
                text += page.get_text()
                if len(text) > 100:
                    found = "Yes"
                    break
        except:
            found = "unclear"

        embedcount = doc.embfile_count()
        imgcount = 0
        try:
            for k in range(len(doc)):
                try:
                    imgcount += len(doc.get_page_images(k))
                except:
                    imgcount = -1
                    break
        except:
            pass

        # 将基本特征添加到列表
        gen_features = [filename, pdfsize, len(str(metadata).encode('utf-8')), numPages, objects, len(title),
                        isEncrypted, embedcount, imgcount, found]
    except Exception as e:
        # 如果打开文件失败，返回默认值
        print(f"Error processing {f}: {e}")
        gen_features = [filename, -1, -1, -1, -1, -1, -1, -1, -1, -1]

    num_missing = 10 - len(gen_features)
    gen_features += ['-1'] * num_missing
    # 获取 pdfid 特征
    # out = subprocess.getoutput(f"python pdfid/pdfid.py {f}")
    # lines = out.splitlines()
    options = {
        'scan': False,  # 例如启用扫描
        'all': False,
        'extra': False,
        'force': True,
        'disarm': False,
        'plugins': '',
        'csv': False,
        'minimumscore': 0.0,
        'verbose': False,
        'select': '',
        'nozero': False,
        'output': 'output.log',
        'pluginoptions': '',
        'literalfilenames': False,
        'recursedir': False
    }

    class Option:
        pass

    option_obj = Option()
    for key, value in options.items():
        setattr(option_obj, key, value)
    filenames = [f]  # 将 f 放入一个列表中，作为参数传递
    structural_features = pdfid.run_pdfid(filenames, option_obj)

    num_missing = 23 - len(structural_features)
    structural_features += ['-1'] * num_missing

    # 合并所有特征，并返回
    features = gen_features + structural_features
    return features

def header2num(x: str):
    """
    Convert string to number for column 'header'.

    x = '\t%PDF-1.' -> 1.
    x = '\t%PDF-1.3' -> 1.3
    x = '\t%PDF-1.3"' -> 1.3
    x = '\t%PDF-1.3"' -> 1.3
    otherwise -> -1.0

    :param x: string
    :return: number in float
    """
    import re

    if x == '\ta':
        return 10.0
    if x == '\t2]':
        return 11.0
    if '%PDF-aaa' in x:
        return 12.0

    m = re.search(r'%PDF-\\*(\\x)?(\d+(\.\d+)?)', x)
    if m:
        return float(m.group(2))
    return -1


def str2num(x: str):
    """
    Convert string to number for column 'images', 'obj', 'endobj'.

    x = '1(1)' -> 1.0
    x = '1' -> 1.0
    x = 'unclear' -> -1.0

    :param x: string
    :return: number in float
    """
    try:
        return float(x)

    except ValueError:
        import re

        if re.match(r'\d+\(\d+\)', x):
            return float(re.findall(r'\d+', x)[0])

        return -1.0