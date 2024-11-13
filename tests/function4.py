import subprocess
import wmi
import datetime
import platform
import os
import win32com.client
import winreg
'''
# Windows-10-10.0.19045-SP0   Tanyule   123456    2023-08-13 20:25:26
# 计算机相关信息
print('操作系统名称及版本号：', platform.platform())  # 获取操作系统名称及版本号
print('计算机的网络名称：', platform.node())  # 计算机的网络名称
print('包含上面所有的信息汇总：', platform.uname())  # 包含上面所有的信息汇总

# 当前用户名
username = os.getlogin()
print("当前用户名:", username)

# 操作系统安装时间
with winreg.OpenKey(winreg.HKEY_LOCAL_MACHINE, r"SOFTWARE\Microsoft\Windows NT\CurrentVersion") as key:
    install_date = winreg.QueryValueEx(key, "InstallDate")[0]
    # 格式化安装时间
    install_time = datetime.datetime.fromtimestamp(install_date)
    print(install_time)
'''


def get_current_user_creation_time():  # 123456  2023-08-13 20:17:03.904119
    current_user = os.getlogin()
    print(current_user)
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
        creation_time = datetime.datetime.fromtimestamp(creation_time)
        print("当前用户创建时间:", creation_time)
    else:
        print("未找到当前用户的配置文件路径")


# import winreg
# 1. HKEY_LOCAL_MACHINE\SOFTWARE\Microsoft\Windows\CurrentVersion\App Paths
# 2. HKEY_LOCAL_MACHINE\SOFTWARE\WOW6432Node\JetBrains
# 3. HKEY_LOCAL_MACHINE\SOFTWARE\Microsoft\Windows\CurrentVersion\Uninstall
# 4. HKEY_LOCAL_MACHINE\SOFTWARE\Wow6432Node\Microsoft\Windows\CurrentVersion\Uninstall
# 5. HKEY_CURRENT_USER\Software\Microsoft\Windows\CurrentVersion\Uninstall

'''
def get_installed_software_from_registry(reg_path, key_path):
    software_list = []
    try:
        with winreg.OpenKey(reg_path, key_path) as key:
            num_subkeys = winreg.QueryInfoKey(key)[0]
            for i in range(num_subkeys):
                try:
                    subkey_name = winreg.EnumKey(key, i)
                    with winreg.OpenKey(key, subkey_name) as subkey:
                        display_name = winreg.QueryValueEx(
                            subkey, "DisplayName")[0]
                        install_date = winreg.QueryValueEx(
                            subkey, "InstallDate")[0]
                        uninstall_string = winreg.QueryValueEx(
                            subkey, "UninstallString")[0]

                        if install_date:
                            install_date = datetime.datetime.strptime(
                                install_date, "%Y%m%d").strftime('%Y-%m-%d')
                        else:
                            if uninstall_string:

                        software_list.append((display_name, install_date))
                except FileNotFoundError:
                    continue
    except Exception as e:
        print(f"An error occurred: {e}")

    return software_list


def get_uninstall_exe_creation_time(uninstall_path):
    uninstall_exe_path = uninstall_path
    if os.path.exists(uninstall_exe_path):
        creation_time = os.path.getctime(uninstall_exe_path)
        return datetime.fromtimestamp(creation_time)
    else:
        return None


def filter_software(software_list):
    keywords = ["Office", "PDF", "Reader", "wps", "foxit"]
    filtered_software = []
    for software in software_list:
        if any(keyword.lower() in software[0].lower() for keyword in keywords):
            filtered_software.append(software)
    return filtered_software


def get_installed_software():
    # Check installed software for the current user
    user_uninstall_key_path = r"SOFTWARE\Microsoft\Windows\CurrentVersion\Uninstall"
    current_user_software = get_installed_software_from_registry(
        winreg.HKEY_CURRENT_USER, user_uninstall_key_path)
    print("1111111111111111111111111")
    print(current_user_software)

    # Check installed software for the machine (32-bit)
    machine_uninstall_key_path_32 = r"SOFTWARE\Microsoft\Windows\CurrentVersion\Uninstall"
    machine_software_32 = get_installed_software_from_registry(
        winreg.HKEY_LOCAL_MACHINE, machine_uninstall_key_path_32)
    print("222222222222222222222222222")
    print(machine_software_32)

    # Check installed software for the machine (64-bit)
    machine_uninstall_key_path_64 = r"SOFTWARE\WOW6432Node\Microsoft\Windows\CurrentVersion\Uninstall"
    machine_software_64 = get_installed_software_from_registry(
        winreg.HKEY_LOCAL_MACHINE, machine_uninstall_key_path_64)
    print("333333333333333333333333333333")
    print(machine_software_64)

    # Combine all lists
    all_software = current_user_software + machine_software_32 + machine_software_64

    # Display the results
    if all_software:
        for name, date in all_software:
            print(f"Software: {name}, Install Date: {date}")
    else:
        print("No Office or PDF related software found.")


get_installed_software()
'''
'''
# 连接到本地计算机的 WMI 服务，获取软件信息
c = wmi.WMI()
for os in c.Win32_OperatingSystem():
    print("操作系统:", os.Caption)
    print("版本:", os.Version)
    print("系统目录:", os.SystemDirectory)


def get_installed_software():
    c = wmi.WMI()
    software_list = []
    for software in c.Win32_Product():
        software_info = {
            "name": software.Name,
            "install_date": software.InstallDate
        }
        software_list.append(software_info)
    return software_list


software_list = get_installed_software()
for software in software_list:
    print(software)
'''
