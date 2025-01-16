#!/usr/bin/python
# -*- coding: utf-8 -*-


import os
import zipfile
import re
from . import olevba

MAGIC = b'\xD0\xCF\x11\xE0\xA1\xB1\x1A\xE1' # Microsoft Office 文档文件的头部字节,标识该文件格式的类型和版本

class ole_parser(olevba.VBA_Parser_CLI):

    def __init__(self, *args, **kwargs):
        super(ole_parser, self).__init__(*args, **kwargs)


    def get_ole(self):
        res_ole = ''

        with zipfile.ZipFile(self.filename, 'r') as fr:
            # print fr.namelist()  ['[Content_Types].xml', '_rels/.rels', 'word/document.xml', 'word/_rels/document.xml.rels',]]
            for file in fr.namelist():
                ole_data = fr.open(file).read()
            else:
                num = len(MAGIC)        # 8
                if ole_data[0:num] == MAGIC:
                    if not re.findall(r'vba.*?', os.path.basename(file)):
                        ole_data = ole_data.replace('\x00', '')
                        ole_data = ole_data.replace('\xff', '')
                        for kk in ole_data:
                            if ord(kk) >= 32 and ord(kk) < 127:
                                res_ole += kk
        return res_ole


