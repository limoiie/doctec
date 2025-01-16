#!/usr/bin/python
# -*- coding: utf-8 -*-
from . import olevba
import re

class VBA_Parser_New(olevba.VBA_Parser_CLI):
    def __init__(self, *args, **kwargs):
        super(VBA_Parser_New, self).__init__(*args, **kwargs)

    #获得所有vba code，主要是宏
    def get_vba(self):
        clean_code = ''
        if self.detect_vba_macros():
            if self.vba_code_all_modules is None:
                self.vba_code_all_modules = ''
                for (_, _, vba_filename, vba_code) in self.extract_all_macros():
                    # TODO: filter code? (each module)
                    self.vba_code_all_modules += vba_filename +'\n' +"-----------------------------------------------"+ "\n" + vba_code + '\n'
                for (_, _, form_string) in self.extract_form_strings():
                    self.vba_code_all_modules += form_string  + '\n'
            #去掉注释
            clean_code = re.sub(r'^(,|Rem\s)(.*?)(\n|\r|\r\n)', '', self.vba_code_all_modules)

        return clean_code