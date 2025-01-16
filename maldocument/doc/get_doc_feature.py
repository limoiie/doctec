#!/usr/bin/python
# -*- coding: utf-8 -*-

from . import officeparser



class get_doc_feature:

	def __init__(self,filename):
		self.filename = filename
		self.ofdoc = officeparser.CompoundBinaryFile(self.filename)

	# 解析doc文档，获取所有directory，得到所有stream
	def get_doc_all_ole(self):
		try:
			data = b''
			for d in self.ofdoc.directory:
				if d._mse == officeparser.STGTY_STREAM:

					data += self.ofdoc.get_stream(d.index)

			return data
		except:
			return ''
