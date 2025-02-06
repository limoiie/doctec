# Doctec

Doctec is a desktop app developed using React in conjunction with [Eel](https://github.com/python-eel/Eel).
It offers functionalities for checking documents.

## Get Started

### Install

You need to have Python >= 3.10, Eel, pyinstaller, and other useful Python libraries.

```
$ python3 -m pip install -e .
```

You'll also need Yarn to install the dependencies and build the app.

```
$ npm install -g yarn
```

### Develop on GUI

```
$ yarn install
$ yarn start
```

### Build as GUI App

```
$ yarn build
```

Check `dist/react-eel-app`.

## Development

### Project Structure

The project is structured as follows:

```
.
├── doctec/    # Backend (Python) code
├── src/       # Frontend (React) code
├── scripts/   # Development-related scripts
├── public/    # Static files (images, fonts, etc.)
               # All files here will be copied to dist,
               # allowing the app to access them after installation.
├── dist/      # Built app
├── README.md       # This file
├── package.json    # Frontend (Web) dependencies
└── pyproject.toml  # Backend (Python) dependencies
```

In general, develop the web user interface using JavaScript within the `src/` directory.
Other functionalities, including database access and document checking,
should be implemented in Python within the `doctec/` directory.

A typical scenario involves a user clicking a button on the web interface.
The JavaScript callback function then invokes a corresponding Python function to perform the necessary operations.
The Python backend executes the tasks and returns the result to the web interface.
Finally, the JavaScript callback function processes the result and updates the web interface accordingly.

### Communication between Python and JavaScript

Communication between Python and JavaScript is supported
by the underlying framework [Eel](https://github.com/python-eel/Eel).
Python and JavaScript communicate through the `eel` object,
both [forwardly](#expose-python-functions-to-javascript) and [backwardly](#expose-javascript-functions-to-python).
Data transfer between Python and JavaScript should be defined exclusively in `doctec/schemas.py`,
as shown [here](#define-data-schemas-for-transfer).

#### Expose Python functions to JavaScript

Python functions intended for JavaScript access should be defined in the `doctec/index.py` file.
After defining the function, expose it to JavaScript using the `@expose` decorator.

```python
from eel import expose


@expose
def my_python_function():
    return "Hello from Python!"
```

The exposed Python functions are available in the `eel` object in JavaScript,
allowing you to call this function from JavaScript.

```javascript
import { eel } from "../eel.js";

// Call the Python function and log the result
eel.my_python_function()().then(console.log);
```

#### Expose JavaScript functions to Python

JavaScript functions intended for Python access should be defined in the `src/eel.js` file.
After defining the function, expose it to Python using the `expose` function.

```javascript
import eel from "eel";

export function my_javascript_function() {
  return "Hello from JavaScript!";
}
```

The exposed JavaScript functions are available in the `eel` object in Python,
allowing you to call this function from Python.

```python
import eel

# Call the JavaScript function and log the result
# noinspection PyUnresolvedReferences
print(eel.my_javascript_function())
```

#### Define data schemas for transfer

The data exchanged between Python and JavaScript must be defined exclusively in `doctec/schemas.py`.
Only the data classes defined in `doctec/schemas.py` shall be transferred between Python and JavaScript.

When you execute `yarn start` or `yarn build`,
all data schema classes specified in the `doctec/schemas.py` file
are automatically transformed into JavaScript definitions located at `src/types/<classname>.schema.d.js`.
This process ensures that you can utilize these definitions in JavaScript without redundancy.

Each data schema class should inherit from `doctec.schemas.SchemaBaseModel`,
which is a subclass of `pydantic.BaseModel`.
The field types should be either primitive types or other data classes defined in `doctec/schemas.py`.

A typical data schema class definition is as follows:

```python
# doctec/schemas.py
class SchemaBaseModel:
    ...


class OtherDataClass(SchemaBaseModel):
    field: float


class MyDataClass(SchemaBaseModel):
    field1: str
    field2: int
    field3: OtherDataClass
```

To define new data schema classes, replicate the existing data class structures found in `doctec/schemas.py`.

### Define data models for database persistence

All data to be persisted in the database should be implemented as models in the `doctec/models.py` file.
The persistence mechanism is supported by the Python framework [peewee](http://docs.peewee-orm.com/en/latest/).

#### Difference between `doctec/schemas.py` and `doctec/models.py`

`doctec/models.py` is used for defining data models for database,
it mainly focuses on data persistence.
Generally, each data model class corresponds to one database table.
You should follow the database design guideline to define the database models.

Meanwhile,
`doctec/schemas.py` is used for defining data transfer schemas between Python and JavaScript,
which mainly focuses on providing enough information to meet the needs from frontend.  
Different from the data model class,
a data schema class is generally created from several data model objects fetched from the database.

A general workflow for creating new data classes is as follows:

- Collect requirements from the frontend: What information do you want to display on the web page?
- Design a data schema class in `doctec/schemas.py`: Construct a class with the necessary fields to provide the required information.
- Check if existing data model classes in `doctec/models.py` can supply the needed information:
  - Yes: Use the existing data model class.
  - No: Create new data model classes in `doctec/models.py` to store the required information.
- Implement the data fetching logic in `doctec/index.py`: Retrieve the necessary data models from the database and construct the data schema object.
