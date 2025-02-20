import platform
import time
from datetime import datetime
import os
import winreg
import aspose.cells as ac
import aspose.words as aw
import aspose.slides as asl
import re
import PyPDF2

def get_system_information():

    computer_name = platform.node()
    with winreg.OpenKey(winreg.HKEY_LOCAL_MACHINE, r"SOFTWARE\Microsoft\Windows NT\CurrentVersion") as key:
        install_date = winreg.QueryValueEx(key, "InstallDate")[0]
        # 格式化安装时间
        computer_install_time = datetime.fromtimestamp(install_date).strftime('%Y-%m-%d')

    current_user, creation_time = get_current_user_creation_time()
    system_information = {
        "computer_name": computer_name,
        "computer_install_time": computer_install_time,
        "current_user": current_user,
        "creation_time": creation_time
    }

    return system_information


def get_current_user_creation_time():  # 123456  2023-08-13 20:17:03.904119
    current_user = os.getlogin()

    profile_list_path = r"SOFTWARE\Microsoft\Windows NT\CurrentVersion\ProfileList"
    profile_image_path = ""

    with winreg.OpenKey(winreg.HKEY_LOCAL_MACHINE, profile_list_path) as key:
        for i in range(winreg.QueryInfoKey(key)[0]):
            sid = winreg.EnumKey(key, i)
            with winreg.OpenKey(key, sid) as subkey:
                username_value = winreg.QueryValueEx(
                    subkey, "ProfileImagePath")[0]
                if current_user in username_value:
                    profile_image_path = username_value
                    break

    # Now get the creation time of the profile directory
    if profile_image_path:
        profile_directory = profile_image_path.replace("C:\\Users\\", "")
        profile_directory_path = os.path.join("C:\\Users", profile_directory)

        # Get the creation time of the user's profile directory
        creation_time = os.path.getctime(profile_directory_path)
        creation_time = datetime.fromtimestamp(creation_time).strftime('%Y-%m-%d')
    else:
        creation_time = 'N/A'


    return current_user,creation_time

def get_software_install_time():
    # Check installed software for the current user

    software_list = []
    key_path = r"SOFTWARE\Microsoft\Windows\CurrentVersion\Uninstall"
    software_list = get_reg_value(winreg.HKEY_CURRENT_USER, key_path, software_list)

    # # Check installed software for the machine (32-bit)
    machine_uninstall_key_path_32 = r"SOFTWARE\Microsoft\Windows\CurrentVersion\Uninstall"
    software_list = get_reg_value(winreg.HKEY_LOCAL_MACHINE, machine_uninstall_key_path_32,software_list)

    # # Check installed software for the machine (64-bit)
    machine_uninstall_key_path_64 = r"SOFTWARE\WOW6432Node\Microsoft\Windows\CurrentVersion\Uninstall"
    software_list = get_reg_value(winreg.HKEY_LOCAL_MACHINE, machine_uninstall_key_path_64,software_list)

    software_list = list(set(software_list))

    filtered_list = filter_software_list(software_list)
    return filtered_list


def get_reg_value(reg_path, key_path, software_list):
    with winreg.OpenKey(reg_path, key_path) as key:
        num_subkeys = winreg.QueryInfoKey(key)[0]
        for i in range(num_subkeys):
            try:
                subkey_name = winreg.EnumKey(key, i)
                with winreg.OpenKey(key, subkey_name) as subkey:
                    display_name = None
                    install_date = 'N/A'
                    try:
                        display_name = winreg.QueryValueEx(subkey, "DisplayName")[0]
                    except FileNotFoundError:
                        continue  # 如果没有DisplayName，跳过该子项

                    uninstall_string = winreg.QueryValueEx(subkey, "UninstallString")[0]
                    install_date = winreg.QueryValueEx(subkey, "InstallDate")[0]    # str '20241108'

                    if install_date:
                        install_date = datetime.strptime(install_date, "%Y%m%d").strftime('%Y-%m-%d')

                        # install_date = datetime.fromtimestamp(install_date).strftime('%Y-%m-%d')

            except FileNotFoundError:
                if uninstall_string:
                    start = uninstall_string.find('\\') - 2
                    end = uninstall_string.rfind('.exe') + 4
                    uninstall_path = uninstall_string[start:end]
                    if os.path.exists(uninstall_path):
                        creation_time = os.path.getctime(uninstall_path)
                        # install_date = datetime.fromtimestamp(creation_time).strftime('%Y-%m-%d')
                        install_date = datetime.fromtimestamp(creation_time).strftime('%Y-%m-%d')    # datetime.datetime(2024, 11, 8, 21, 17, 9, 628441)
                    else:
                        install_date = 'N/A'
                else: install_date = 'N/A'
            finally:
                software_list.append((display_name, install_date))
    return software_list



def filter_software_list(software_list):
    keywords = ["Office", "PDF","word","excel","ppt", "文档","表格","幻灯片", "Reader", "wps", "foxit","福昕阅读器","永中"]
    excluded_keywords = ["Update", "Plugin", "Component", "Tool", "Helper", "Add-in"]
    filter_software = []
    filtered_list = [item for item in software_list if item != (None, 'N/A')]
    for software in filtered_list:
        display_name = software[0].lower()
        if any(keyword.lower() in display_name for keyword in keywords) and all(excluded_keyword.lower() not in display_name for excluded_keyword in excluded_keywords):
            filter_software.append(software)
    return filter_software



def get_metadata(file_path):
    extension = os.path.splitext(file_path)[-1].lower()
    if extension in ['.docx', '.doc']:
        return get_metadata_word(file_path)
    elif extension in ['.xls', '.xlsx']:
        return get_metadata_excel(file_path)
    elif extension in ['.ppt', '.pptx']:
        return get_metadata_ppt(file_path)
    elif extension in ['pdf']:
        return get_metadata_pdf(file_path)
    else:
        raise ValueError(f"Unsupported file type: {extension}")

def get_metadata_pdf(file_path):
    with open(file_path, 'rb') as file:
        reader = PyPDF2.PdfReader(file)
        info = reader.metadata
        if info:
            metadata = {
                "author": info.get('/Author', '-'),
                "last_saved_by": info.get('/Producer', '-'), 
                "created_time": info.get('/CreationDate', '-'),
                "last_saved_time": info.get('/ModDate', '-')
            }
        else:
            metadata = {
                "author": "-",
                "last_saved_by": "-",
                "created_time": "-", 
                "last_saved_time": "-"
            }
        return metadata


def get_metadata_word(file_path):
    doc = aw.Document(file_path)

    # 获取文档属性，这些属性包含了一些元数据信息
    document_properties = doc.built_in_document_properties
    metadata = {
        # 属性：5
        "title": document_properties.title,
        "subject": document_properties.subject,
        "category": document_properties.category,
        "comments": document_properties.comments,
        "keywords": document_properties.keywords,
        # 来源：10
        "author": document_properties.author,
        "last_saved_by": document_properties.last_saved_by,
        "created_time": document_properties.created_time,
        "last_saved_time": document_properties.last_saved_time,
        "last_printed": document_properties.last_printed,
        "total_editing_time": document_properties.total_editing_time,
        "revision_number": document_properties.revision_number,
        "version": document_properties.version,
        "name_of_application": document_properties.name_of_application,
        "company": document_properties.company,

        # 内容
        "content_type": document_properties.content_type,
        "content_status": document_properties.content_status,
        "characters": document_properties.characters,
        "bytes": document_properties.bytes,
        "characters_with_spaces": document_properties.characters_with_spaces,
        "lines": document_properties.lines,
        "pages": document_properties.pages,
        "words": document_properties.words,
        "paragraphs": document_properties.paragraphs,
        "template": document_properties.template,

        "hyperlink_base": document_properties.hyperlink_base,
        "hyperlinks_changed": document_properties.hyperlinks_changed,
        "links_up_to_date": document_properties.links_up_to_date,
        "scale_crop": document_properties.scale_crop,
        "shared_document": document_properties.shared_document,

    }

    return metadata


def get_metadata_ppt(file_path):
    presentation = asl.Presentation(file_path)

    document_properties = presentation.document_properties

    # 提取常用的元数据
    metadata = {
        # 属性：5
        "title": document_properties.title,
        "subject": document_properties.subject,
        "category": document_properties.category,
        "comments": document_properties.comments,
        "keywords": document_properties.keywords,

        # 来源：10
        "author": document_properties.author,
        "last_saved_by": document_properties.last_saved_by,
        "created_time": document_properties.created_time,
        "last_saved_time": document_properties.last_saved_time,
        "last_printed": document_properties.last_printed,
        "total_editing_time": document_properties.total_editing_time,
        "revision_number": document_properties.revision_number,
        "app_version": document_properties.app_version,
        "name_of_application": document_properties.name_of_application,
        "company": document_properties.company,

        # 内容
        "content_status": document_properties.content_status,
        "content_type": document_properties.content_type,
        "length": presentation.slides.length,

        "presentation_format": document_properties.presentation_format,  # 宽屏
        "count_of_custom_properties": document_properties.count_of_custom_properties,

        "application_template": document_properties.application_template,
        "hyperlink_base": document_properties.hyperlink_base,
        "shared_doc": document_properties.shared_doc,

    }
    return metadata


def get_metadata_excel(file_path):
    # 加载 Excel 文件
    workbook = ac.Workbook(file_path)
    document_properties = workbook.built_in_document_properties

    metadata = {
        # 属性：5
        "title": document_properties.title,
        "subject": document_properties.subject,
        "category": document_properties.category,
        "comments": document_properties.comments,
        "keywords": document_properties.keywords,
        # 来源：10
        "author": document_properties.author,
        "last_saved_by": document_properties.last_saved_by,
        "created_time": document_properties.created_time,
        "last_saved_time": document_properties.last_saved_time,
        "last_printed": document_properties.last_printed,
        "total_editing_time": document_properties.total_editing_time,
        "revision_number": document_properties.revision_number,
        "version": document_properties.version,
        "name_of_application": document_properties.name_of_application,
        "company": document_properties.company,

        # 内容
        "content_type": document_properties.content_type,
        "content_status": document_properties.content_status,
        "characters": document_properties.characters,
        "bytes": document_properties.bytes,
        "characters_with_spaces": document_properties.characters_with_spaces,
        "lines": document_properties.lines,
        "pages": document_properties.pages,
        "words": document_properties.words,
        "paragraphs": document_properties.paragraphs,
        "template": document_properties.template,

        "hyperlink_base": document_properties.hyperlink_base,
        # "hyperlinks_changed": document_properties.hyperlinks_changed,
        "links_up_to_date": document_properties.links_up_to_date,
        "scale_crop": document_properties.scale_crop,
        # "shared_document": document_properties.shared_document,

    }
    return metadata

def compare(file_path):
    try:
        metadata = get_metadata(file_path)
    except ValueError:
        return {"is_local": "-", "message": "-"}
        
    creator = metadata["author"]

    created_date = metadata["created_time"].strftime("%Y-%m-%d") # 2022-12-07 str
    created_date = datetime.strptime(created_date, "%Y-%m-%d")

    software = get_software_install_time()
    system_information = get_system_information()

    computer_name = system_information["computer_name"]
    current_user = system_information["current_user"]

    # 用户名
    # 预处理系统信息中的时间
    computer_install_date = datetime.strptime(system_information["computer_install_time"], "%Y-%m-%d")
    user_creation_date = datetime.strptime(system_information["creation_time"], "%Y-%m-%d")
    
    messages = []
    result = {"is_local": True, "message": "文件符合本机创建条件"}
    
    # 1. 校验创建者与当前用户
    if creator != current_user:
        messages.append(f"文件创建者'{creator}'与当前用户'{current_user}'不一致")
    
    # 2. 校验文件创建时间与系统关键时间
    if created_date < computer_install_date or created_date < user_creation_date:
        time_comparison = [
            f"系统安装时间({system_information['computer_install_time']})",
            f"用户创建时间({system_information['creation_time']})"
        ]
        messages.append(f"文件创建时间({created_date.strftime('%Y-%m-%d')})早于{'/'.join(time_comparison)}")
    
    # 3. 校验软件安装时间（始终执行检查）
    late_software = [
        (name, datetime.strptime(date, "%Y-%m-%d"))
        for name, date in software
        if created_date < datetime.strptime(date, "%Y-%m-%d")
    ]
    if late_software:
        latest_software = max(late_software, key=lambda x: x[1])
        messages.append(f"文件创建时间({created_date.strftime('%Y-%m-%d')})早于'{latest_software[0]}'的安装时间({latest_software[1].strftime('%Y-%m-%d')})")

    # 综合所有错误信息
    if messages:
        result = {
            "is_local": False,
            "message": "；".join(messages)
        }

    print(result)
    return result

def test():
    file_path = r'E:\Project\maldoctect\teset_data_simple\hello.docx'
    compare(file_path)







