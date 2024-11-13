import time
from datetime import datetime
import os
import winreg


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
                    display_name = winreg.QueryValueEx(subkey, "DisplayName")[0]
                    uninstall_string = winreg.QueryValueEx(subkey, "UninstallString")[0]
                    install_date = winreg.QueryValueEx(subkey, "InstallDate")[0]

                    if install_date:
                        install_date = datetime.strptime(install_date, "%Y%m%d").strftime('%Y-%m-%d')

            except FileNotFoundError:
                if uninstall_string:
                    start = uninstall_string.find('\\') - 2
                    end = uninstall_string.rfind('.exe') + 4
                    uninstall_path = uninstall_string[start:end]
                    if os.path.exists(uninstall_path):
                        creation_time = os.path.getctime(uninstall_path)
                        install_date = datetime.fromtimestamp(creation_time).strftime('%Y-%m-%d')
                    else:
                        install_date = 'N/A'
                else: install_date = 'N/A'
            finally:
                software_list.append((display_name, install_date))
    return software_list

import re

def filter_software_list(software_list):
    keywords = ["Office", "PDF","word","excel","ppt", "文档","表格","幻灯片", "Reader", "wps", "foxit","福昕阅读器","永中"]
    excluded_keywords = ["Update", "Plugin", "Component", "Tool", "Helper", "Add-in"]
    filter_software = []
    for software in software_list:
        display_name = software[0].lower()
        if any(keyword.lower() in display_name for keyword in keywords) and all(excluded_keyword.lower() not in display_name for excluded_keyword in excluded_keywords):
            filter_software.append(software)
    return filter_software

def get_file_metadat():
    file_path = r'C:\Users\123456\Desktop\pdf小论文.docx'
    creator = ''
    modifier = ''
    created = datetime.fromtimestamp(os.path.getctime(file_path)).strftime('%Y-%m-%d')
    modified = datetime.fromtimestamp(os.path.getmtime(file_path)).strftime('%Y-%m-%d')
    print(created,modified)



get_file_metadat()


