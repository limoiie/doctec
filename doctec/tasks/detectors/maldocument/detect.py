import magic
from .doc import ole
from .docx import zip
from .pdf import detect

def detect_file(file_path):
    mime = magic.Magic(mime=True)
    file_type = mime.from_buffer(open(file_path, 'rb').read(2048))
    return file_type

def check_file(file_path):
    file_type = detect_file(file_path)
    extension = file_path.split('.')[-1]
    results = {
        "file_type": "",
        "probability": 0,
        "reasons": []
    }
    if file_type == 'application/CDFV2':

        result = ole.predict_file(file_path)
        results['file_type'] = "application/CDFV2"
        results['probability'] = result['probability']
        results['reasons'] = result['reasons']
        print(results)
    
    elif file_type == 'application/zip' or extension == 'docx' or extension == 'xlsx':
        results['file_type'] = "application/zip"
        result = zip.predict_file(file_path)
        results['probability'] = result['probability']
        results['reasons'] = result['reasons']
        print(results)
    elif file_type == 'application/pdf':
        results['file_type'] = "application/pdf"
        result = detect.predict_file(file_path)
        results['probability'] = result['probability']
        results['reasons'] = result['reasons']
        print(results)
    else:
        results['file_type'] = "unknown"
        results['probability'] = '-'
        results['reasons'] = []
        print(results)
    return results

if __name__ == "__main__":
    file_path = r"H:\mal_data\DOCS\DOCS_from_contagio_pdf\1d1fefee5267942d73d7cc34f869bd02.xls"
    result = check_file(file_path)
    print(result)
    
    
