import json

from peewee import Field, TextField


class JSONField(TextField):
    """
    A field that stores JSON data.

    You can use it to store a list of strings, a dictionary, etc.
    """

    def db_value(self, value):
        return json.dumps(value)

    def python_value(self, value):
        return json.loads(value)


class EnumField(Field):
    """
    A field that stores an enum value.
    """

    def __init__(self, choices, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.choices = choices

    def db_value(self, value):
        return value.name if value else None

    def python_value(self, value):
        return self.choices[value] if value else None
