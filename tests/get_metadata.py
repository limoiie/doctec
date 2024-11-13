import aspose.slides as asl


# 加载 PPT 文件
# presentation = asl.Presentation(r"C:\Users\123456\Desktop\test.pptx")
# file_path = r"C:\Users\123456\Desktop\test.pptx"
# with asl.Presentation(file_path) as presentation:
#     # 获取文档属性
#     document_properties = presentation.document_properties
#
#     # 提取常用的元数据
#     metadata = {
#         "标题": document_properties.title,
#         "创建者": document_properties.author,
#         "公司": document_properties.company,
#         "最后修改者": document_properties.last_saved_by,
#         "创建时间": document_properties.created_time,
#         "修改时间": document_properties.last_saved_time,
#         "主题": document_properties.subject,
#         "关键词": document_properties.keywords,
#     }
# print(metadata)

import aspose.cells as ac

# 加载 Excel 文件
workbook = ac.Workbook(r"C:\Users\123456\Desktop\复盘.xlsx")

# 获取文档属性
document_properties = workbook.builtin_document_properties

# 提取常用的元数据
metadata = {
    "标题": document_properties.title,
    "创建者": document_properties.author,
    "公司": document_properties.company,
    "最后修改者": document_properties.last_saved_by,
    "创建时间": document_properties.created_time,
    "修改时间": document_properties.last_saved_time,
    "主题": document_properties.subject,
    "关键词": document_properties.keywords,
}
print(metadata)


# import aspose.words as aw
#
# # 加载文档
# doc = aw.Document(r"C:\Users\123456\Desktop\pdf小论文.docx")
#
# # 获取文档属性，这些属性包含了一些元数据信息
# document_properties = doc.built_in_document_properties
#
# # 打印部分元数据
# print(f"标题：{document_properties.title}")
# print(document_properties.last_saved_by)
# print(f"作者：{document_properties.author}")
# print(f"创建时间：{document_properties.created_time}")
# print(f"最后修改时间：{document_properties.last_saved_time}")
