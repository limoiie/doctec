#!/usr/bin/python
# coding=utf-8


import os

import re
import zipfile
from . import xml_feature
from . import olevba

from . import msodde


LOCATIONS = ['document.xml','endnotes.xml','footnotes.xml','header1.xml',
             'footer1.xml','header2.xml','footer2.xml','comments.xml']



XML_FEATURE = os.path.join(os.path.dirname(__file__), "nodes","xml_feature_final.txt")
class xml_parser(olevba.VBA_Parser_CLI):

    def __init__(self, *args, **kwargs):
        super(xml_parser, self).__init__(*args, **kwargs)


    def get_xml_dde(self):

        res = ''
        res += msodde.process_file(self.filename)
        return res

    def get_xml_feature(self):
        node = {}
        outputfile = open(XML_FEATURE,'r')

        dict = {}
        for line in outputfile:
            line = line.replace('\n','')
            if line not in dict: # 将所有的路径值设为0
                dict[line] = 0

        #sort_dict = sorted(dict.keys())
        #print dict
        with zipfile.ZipFile(self.filename, 'r') as fr:
            for subfile in fr.namelist():
                # subfile: [Content_Types].xml
                if os.path.splitext(subfile)[1] == '.xml':
                    f = subfile.split('/')  #['[Content_Types].xml'],['word', 'document.xml'],['word', 'theme', 'theme1.xml']
                    # ['[Content_Types].xml']
                    if len(f) == 1: # 直接为xml文件
                        f = f[0] + '\\'
                    elif len(f) == 2:
                        f = f[0] + '\\' + f[1] + '\\'
                    elif len(f) == 3:
                        f = f[0] + '\\' + f[1] + '\\' + f[2] + '\\'
                    # f: [Content_Types].xml\, word\document.xml\, word\theme\theme1.xml\
                    xml = fr.open(subfile).read()

                    res = OfficeNode(f, xml)


                    for i in res.result:    # res:result, 每个xml文件中每个元素的名称
                        if i in dict.keys():
                            dict[i] = 1
        outputfile.close()
        result = ''
        for key in sorted(dict.keys()):
            result += str(dict[key])
        res = ''
        for i in result:    #5 00
            res += i + ','

        res = res[:-1]
        res = res + '\n'
        return res


class OfficeNode:

    def __init__(self, result,xml=None):
        # result: [Content_Types].xml\
        # xml: b'<?xml version="1.0" encoding="UTF-8" standalone="yes"?>

        self.indata = xml   # xml内容
        self.result = [result]  # xml文件路径

        if xml:
            self.dict_xml = xml_feature.parse(self.indata)  # 不用属性名，只要属性值

            # OrderedDict([(u'cp:coreProperties', OrderedDict([(u'@xmlns:cp', u'http://schemas.openxmlformats.org/package/2006/metadata/core-properties'), (u'@xmlns:dc', u'http://purl.org/dc/elements/1.1/'), (u'@xmlns:dcterms', u'http://purl.org/dc/terms/'), (u'@xmlns:dcmitype', u'http://purl.org/dc/dcmitype/'), (u'@xmlns:xsi', u'http://www.w3.org/2001/XMLSchema-instance'), (u'dc:title', None), (u'dc:subject', None), (u'dc:creator', u'\u83af\u534c'), (u'cp:keywords', None), (u'dc:description', None), (u'cp:lastModifiedBy', u'\u83af\u534c'), (u'cp:revision', u'2'), (u'dcterms:created', OrderedDict([(u'@xsi:type', u'dcterms:W3CDTF'), ('#text', u'2023-03-17T11:27:00Z')])), (u'dcterms:modified', OrderedDict([(u'@xsi:type', u'dcterms:W3CDTF'), ('#text', u'2023-03-17T11:27:00Z')]))])
            self.__myParseTag(self.dict_xml, result)
            # result: 所有元素路径，不包括元素属性名

    def __myParseTag(self, dict_xml, parent_path):

        for key in dict_xml.keys():
            # key：元素名称和属性名称
            current_path = parent_path + str(key) + '\\' + ''
            if not re.findall(r'@', key):
                self.result.append(current_path)
            else:
                continue
            val = dict_xml[key]
            if isinstance(val, dict):
                self.__myParseTag(val, current_path)
            elif isinstance(val, list):
                for v in val:
                    if isinstance(v, dict):
                        self.__myParseTag(v, current_path)




