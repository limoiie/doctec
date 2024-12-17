
import os
import aspose.cells as ac
import aspose.words as aw
import aspose.slides as asl

def get_metadata(file_path):
    extension = os.path.splitext(file_path)[-1].lower()
    if extension in ['.docx', '.doc']:
        return get_metadata_word(file_path)
    elif extension in [ '.xls','.xlsx']:
        return get_metadata_excel(file_path)
    elif extension in [ '.ppt','.pptx']:
        return get_metadata_ppt(file_path)
    else:
        raise ValueError(f"Unsupported file type: {extension}")

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
        "length":presentation.slides.length,



        "presentation_format": document_properties.presentation_format, # 宽屏
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


metadata = get_metadata(r'C:\Users\yule_\Desktop\复盘.xlsx')

