import os
from pdf import detect as pdf_detect
from doc import detect as doc_detect
from docx import detect as docx_detect
import threading
from queue import Queue
from typing import List, Tuple
from pathlib import Path

PDF = 'PDF'
DOCX = 'DOCX' 
OLE = 'OLE'

def check_file(filename):

    try:
        # Detect file type based on magic numbers/file signatures
        with open(filename, 'rb') as f:
            header = f.read(8)
            
        # PDF signature
        if header.startswith(b'%PDF'):
            file_type = PDF

        # DOCX (ZIP archive with specific contents)
        elif header.startswith(b'PK\x03\x04'):
            file_type = DOCX

        # DOC/OLE compound file
        elif header.startswith(b'\xD0\xCF\x11\xE0\xA1\xB1\x1A\xE1'):
            file_type = OLE

        else:
            file_type = None
        # print(file_type)
        extension = os.path.splitext(filename)[1]

        if file_type == PDF or extension == '.pdf':
            result = [filename,  'PDF',  int(pdf_detect.detect(filename)[0]), pdf_detect.detect(filename)[1]]
        elif file_type == DOCX or extension=='.docx':
            result = [filename,  'DOCX',  int(docx_detect.detect(filename)), docx_detect.describe_chinese(filename)]
        elif file_type == OLE:
            result = [filename, 'OLE', int(doc_detect.detect(filename)), doc_detect.describe(filename)]
        else:
             file_type = os.path.basename(filename).split('.')[-1].upper()
             result = [filename,  file_type,  '', '']
    except:
        raise
    return result
  

def check_folder_mt(folder_path: str, num_threads: int = 4) -> List[Tuple[str, int, str]]:
    """
    多线程检测文件夹中的所有文件
    
    Args:
        folder_path: 文件夹路径
        num_threads: 线程数量，默认为4
    
    Returns:
        List[Tuple[str, int, str]]: 返回结果列表，每项包含 (文件路径, 检测结果, 描述)
    """
    file_queue = Queue()
    results = []
    results_lock = threading.Lock()

    # 收集所有文件
    for file_path in Path(folder_path).rglob("*"):
        if file_path.is_file():  # 只处理文件，跳过文件夹
            file_queue.put(str(file_path))

    def worker():
        while True:
            try:
                file_path = file_queue.get_nowait()
            except Queue.Empty:
                break

            try:
                result = check_file(file_path)  # 使用已有的check_file函数
                with results_lock:
                    results.append((file_path, *result))
            except Exception as e:
                print(f"处理文件 {file_path} 时出错: {str(e)}")
            finally:
                file_queue.task_done()

    # 创建并启动线程
    threads = []
    for _ in range(num_threads):
        t = threading.Thread(target=worker)
        t.start()
        threads.append(t)

    # 等待所有线程完成
    for t in threads:
        t.join()

    return sorted(results, key=lambda x: x[0])  # 按文件路径排序

def check_folder(folder_path: str) -> List[Tuple[str, int, str]]:
    """
    检测文件夹中的所有文件（单线程版本，向后兼容）
    
    Args:
        folder_path: 文件夹路径
    
    Returns:
        List[Tuple[str, int, str]]: 返回结果列表，每项包含 (文件路径, 检测结果, 描述)
    """
    results = []
    for file_path in Path(folder_path).rglob("*"):
        if file_path.is_file():
            try:
                result = check_file(str(file_path))
                results.append((str(file_path), *result))
            except Exception as e:
                print(f"处理文件 {file_path} 时出错: {str(e)}")
    
    return sorted(results, key=lambda x: x[0])

# 使用示例
if __name__ == '__main__':
    import time
    
    folder_to_scan = r"H:\wyy\project\data\doc\2017"
    start_time = time.time()
    
    # 检查路径是文件还是文件夹
    path = Path(folder_to_scan)
    if path.is_file():
        # 单个文件使用单线程
        results = [check_file(str(path))]
    else:
        # 文件夹使用多线程
        results = check_folder_mt(str(path))
    
    print(f"\n处理完成，耗时: {time.time() - start_time:.2f}秒")
    print(f"共处理 {len(results)} 个文件")
    print(results)
    # 输出结果
    for file_path, file_type, prediction, description in results:
        status = "恶意" if prediction == 1 else "良性"
        print(f"\n文件: {file_path}")
        print(f"状态: {status}")
        if description:
            print(f"描述: {description}")
