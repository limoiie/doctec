#!/usr/bin/python
# -*- coding: utf-8 -*-


import re

from . import olevba

from . import vbaDoc

class OfficeFeatureExtractor:

    def __init__(self,filename):

        self._filename = filename
        self._vbaDocx = vbaDoc.VBA_Parser_New(self._filename)


    def get_all_suspicious_patterns(self):
        result = {}
        result['AutoExec'] = {}
        result['Suspicious'] = {}
        result['IOC'] = {}

        for _, types in olevba.AUTOEXEC_KEYWORDS.items():

            for type in types:

                type = type.lower()
                result['AutoExec'][type] = 0

        for _, types in olevba.SUSPICIOUS_KEYWORDS.items():
            for type in types:

                type = type.lower()
                result['Suspicious'][type] = 0
            result['Suspicious']['hex strings'] = 0
            result['Suspicious']['base64 strings'] = 0
            result['Suspicious']['vba strings'] = 0
            result['Suspicious']['driDex strings'] = 0
            result['IOC']['ioc'] = 0

        return result


    def print_analysis(self, code):
        scanner = olevba.VBA_Scanner(code)
        results = scanner.scan()
        dictionary = {}
        database = self.get_all_suspicious_patterns()
        if results:
            for kw_type, keyword, _ in results:
                keyword = keyword.lower()
                # handle non printable strings:
                if not olevba.is_printable(keyword):
                    keyword = repr(keyword)
                if not kw_type in dictionary:
                    dictionary[kw_type] = [keyword]
                else:
                    dictionary[kw_type].append(keyword)
            if 'AutoExec' in dictionary:
                for key in dictionary['AutoExec']:
                    if key in database['AutoExec']:
                        database['AutoExec'][key] = 1

            if 'Suspicious' in dictionary:

                for key in dictionary['Suspicious']:

                    if key in database['Suspicious']:
                        database['Suspicious'][key] = 1

            if 'IOC' in dictionary:
                #for i in range(len(dictionary['IOC'])):
                if len(dictionary['IOC']) > 3:
                    database['IOC']['ioc'] = 3
                elif len(dictionary['IOC']) > 1:
                    database['IOC']['ioc'] = 2
                else:
                    database['IOC']['ioc'] = len(dictionary['IOC'])
            result = ''
            for key in sorted(database.keys()):
                dict = database[key]
                for dict_key in sorted(dict.keys()):
                    result += str(dict[dict_key]) + ','

            if self._vbaDocx.detect_vba_macros():
                vbaFeature = VbaFeature(self._vbaDocx.get_vba())
                result_vba = vbaFeature.vba_analysis()
                result += result_vba + '\n'
            else:
                result = result + '0,0,0,0,0,0,0,0,0,0,0'+'\n'

            return result
        else:
            _result = ''
            for i in range(132):
                _result += '0' + ','
            _result = _result[:-1]
            _result = _result + '\n'
            return _result

    def showResults(self,code):
        scanner = olevba.VBA_Scanner(code)
        result = ''
        results = scanner.scan()
        for i in results:
            if i[0] == 'Suspicious':
                result = result + i[1] + ': ' + i[2] + '\n'
            elif i[0] == 'IOC':
                result = result + i[1] + ': ' + i[2] + '\n'
            elif i[0] == 'AutoExec':
                result = result + i[1] + ': ' + i[2] + '\n'
            else:
                result = result + i[0] + '\n'

        return result




class VbaFeature:
    """
    record the features of every office node
    """

    LONG_VAR = 8  # 变量名阈值
    LONG_FUNC = 8  # 函数名阈值
    LONG_STR = 50  # 字符串阈值
    PLUS_COUNT = 5  # 一个字符串中'+'出现的阈值
    COMP_COUNT = 15 # 比较次数的阈值
    CIRCULATION_COUNT = 15 # 循环次数的阈值
    FIGURE_COUNT = 30 #数字阈值
    CAL_COUNT = 30 # 计算阈值

    def __init__(self, code):
        self.code = code
        self.long_var = 0
        self.long_func_num = 0
        self.long_str_num = 0
        self.confused_str_num = 0
        self.confused_str_length = 0
        self.multi_plus_str = 0  # 含有多个'+'的字符串数量
        self.multi_comp = 0 #还有多个比较
        self.multi_cir = 0
        self.multi_figure = 0
        self.multi_cal = 0
        self.funcs_in_str = {}  # 记录函数名出现在长字符串中func:num
        self.__get_vba_features(code)


    def __get_vba_features(self, code):

        # 长变量名
        vars = re.findall(r'(Dim|Public|Private|Static)\s+([_a-zA-Z]?[a-zA-Z]+[0-9]*[a-zA-Z]*)\(?\)?\s+As\s+.*?',code, re.MULTILINE | re.DOTALL)
        for var in vars:
            if len(var) < 2:
                continue
            var = var[1]
            if len(var) > VbaFeature.LONG_VAR:
                self.long_var += 1


        # 长函数名
        funcs = re.findall(r'\s*Sub\s+([_a-zA-Z]?[a-zA-Z]+[0-9]*[a-zA-Z]*)\s*\(.*?\)', code,re.MULTILINE | re.DOTALL)
        funcs2 = re.findall(r'\w\s+Function\s+([_a-zA-Z]?[a-zA-Z]+[0-9]*[a-zA-Z]*)\s*\(.*?\)',code,re.MULTILINE | re.DOTALL)
        funcs.extend(funcs2)
        for func_name in funcs:
            if len(func_name) > VbaFeature.LONG_FUNC:
                self.long_func_num += 1


        # 长字符串
        long_strs = re.findall(r'\'(.*?)\'.*?', code, re.MULTILINE | re.DOTALL)
        str2 = re.findall(r'\"(.*?)\".*?', code, re.MULTILINE | re.DOTALL)
        long_strs.extend(str2)
        the_longest_str = ''
        for str in long_strs:
            # 记录最长的str
            if len(str) > len(the_longest_str):
                the_longest_str = str
            # 长字符串数量
            if len(str) > VbaFeature.LONG_STR:
                self.long_str_num += 1
            # 字符串里有特殊编码
            result = None
            result = re.search(r'(\\u[0-9]{2})+.*?', str)
            if result:
                self.confused_str_num += 1
                self.confused_str_length += len(result.group(0))
            result = re.search(r'(\\x[0-9]{2})+.*?', str)
            if result:
                self.confused_str_num += 1
                self.confused_str_length += len(result.group(0))
            # 字符串中含有多个'+'号
            if str.count('+') > VbaFeature.PLUS_COUNT:
                self.multi_plus_str += 1
            # 函数名在长字符串中出现
            for func in funcs:
                if not func in self.funcs_in_str:
                    self.funcs_in_str[func] = 1
                else:
                    self.funcs_in_str[func] += 1
        self.has_long_str = self.long_str_num > 0  # 有长字符串
        self.has_confused_str = self.confused_str_length > 0  # 特殊编码字符串的长度

        #代码中包含大量比较运算
        comp = re.findall(r'\>', code, re.MULTILINE | re.DOTALL)
        comp1 = re.findall(r'\<',code, re.MULTILINE | re.DOTALL)
        comp.extend(comp1)
        self.multi_comp = len(comp)



        #代码中包含大量数字
        figure = re.findall(r'\-*\d+(?:\.\d+)?', code, re.MULTILINE | re.DOTALL)
        self.multi_figure = len(figure)

        #代码中包含大量计算
        mul = re.findall(r'(\d+\.?\d*\*-\d+\.?\d*)|(\d+\.?\d*\*\d+\.?\d*)' ,code, re.MULTILINE | re.DOTALL)
        div = re.findall(r'(\d+\.?\d*/-\d+\.?\d*)|(\d+\.?\d*/\d+\.?\d*)' ,code, re.MULTILINE | re.DOTALL)
        add = re.findall(r'(-?\d+\.?\d*\+-\d+\.?\d*)|(-?\d+\.?\d*\+\d+\.?\d*)', code, re.MULTILINE | re.DOTALL)
        sub = re.findall(r'(-?\d+\.?\d*--\d+\.?\d*)|(-?\d+\.?\d*-\d+\.?\d*)', code, re.MULTILINE | re.DOTALL)


        self.multi_cal = len(mul) + len(div) +len(add) + len(sub)

        #代码中包含大量循环

        cir = re.findall(r'(For Each|Exit For|do while)',code, re.MULTILINE | re.DOTALL)
        self.multi_cir = len(cir)

    def vba_analysis(self):

        FEW = 2
        MULTI = 3
        SHORT = 1  # 注释长度 [0, 50]
        LONG = 2  # 注释长度(50, )


        result = {
            'long_var': 0,
            'long_func_num': 0,
            'long_str_num': 0,
            'confused_str_num': 0,
            'confused_str_length': 0,
            'multi_plus_str': 0,  # 含有多个'+'的字符串数量
            'funcs_in_str': 0,  # 记录函数名出现在长字符串中func:num
            'multi_comp' : 0,
            'multi_figure':0,
            'multi_cal':0,
            'multi_cir':0
        }

        # 真正的数据 #

        # 长变量名数量
        if self.long_var > 5:
            result['long_var'] = MULTI
        elif self.long_var > 1:
            result['long_var'] = FEW
        else:
            result['long_var'] = self.long_var
        # 含有长函数名
        # result['has_long_func_name'] = 1 if node_feature.has_long_func_name else 0
        # 长函数名数量
        if self.long_func_num > 10:
            result['long_func_num'] = MULTI
        elif self.long_func_num > 1:
            result['long_func_num'] = FEW
        else:
            result['long_func_num'] = self.long_func_num
        # 长字符串数量
        if self.long_str_num > 10:
            result['long_str_num'] = MULTI
        elif self.long_str_num > 1:
            result['long_str_num'] = FEW
        else:
            result['long_str_num'] = self.long_str_num
        # 有混淆过的字符串
        # result['has_confused_str'] = 1 if node_feature.has_confused_str else 0
        # 混淆过的字符串的数量
        if self.confused_str_num > 5:
            result['confused_str_num'] = MULTI
        elif self.confused_str_num > 1:
            result['confused_str_num'] = FEW
        else:
            result['confused_str_num'] = self.confused_str_num
        # 混淆过的字符串的总长度
        if self.confused_str_length > 50:
            result['confused_str_length'] = LONG
        elif self.confused_str_length >= 1:
            result['confused_str_length'] =SHORT
        else:
            result['confused_str_length'] = self.confused_str_length
        # 含有多个'+'的字符串数量
        if self.multi_plus_str > 3:
            result['multi_plus_str'] = MULTI
        elif self.multi_plus_str > 1:
            result['multi_plus_str'] = FEW
        else:
            result['multi_plus_str'] = self.multi_plus_str
        # 记录函数名出现在长字符串中func:num
        if self.funcs_in_str:
            result['funcs_in_str'] = 1

        if self.multi_comp > self.COMP_COUNT:
            result['multi_comp'] = 1

        if self.multi_figure > self.FIGURE_COUNT:
            result['multi_figure'] = 1

        if self.multi_cir > self.CIRCULATION_COUNT:
            result['multi_cir'] = 1

        if self.multi_cal > self.CAL_COUNT:
            result['multi_cal'] = 1
        result1 = ''
        for key in sorted(result.keys()):
            result1 += str(result[key]) + ','


        result1 = result1[:-1]

        return result1


