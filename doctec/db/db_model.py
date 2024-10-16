from typing import List
from peewee import *

db = SqliteDatabase('FileIntegrityDB.db')


class BaseModel(Model):
    class Meta:
        database = db


class Task(BaseModel):
    id = AutoField()  # 主键，自增
    uuid = TextField()

    # config related
    targetDirs = TextField()
    maxDepth = IntegerField()
    date = TextField()

    # run related
    status = TextField()
    error = TextField(null=True)
    totalFiles = IntegerField()
    processedFiles = IntegerField()


class FileMetadata(BaseModel):
    id = AutoField()  # 主键，自增
    filepath = TextField()
    md5 = TextField(unique=True)
    filesize = IntegerField()
    is_embedded = BlobField()  # BLOB 类型
    embedded_description = TextField(null=True)
    is_nested = BlobField()  # BLOB 类型
    nested_description = TextField(null=True)


class TaskFileMapping(BaseModel):
    id = AutoField()  # 主键，自增
    task_id = ForeignKeyField(Task, backref='file_mappings')  # 外键，关联 Task 表
    file_md5 = ForeignKeyField(FileMetadata, to_field='md5',
                               backref='task_mappings', column_name='file_md5')  # 外键，关联 FileMetadata 表


class ParentChildRelationship(BaseModel):
    id = AutoField()  # 主键，自增
    parent_file_id = ForeignKeyField(
        FileMetadata, backref='parent_relationships')  # 外键，关联 FileMetadata 表
    child_file_id = ForeignKeyField(
        FileMetadata, backref='child_relationships')  # 外键，关联 FileMetadata 表
