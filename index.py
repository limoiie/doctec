import sys
from functools import wraps
from typing import Dict, List, Optional
from uuid import uuid4

import eel

from doctec import schemas
from doctec.ctx import AppContext
from doctec.models import User, UserSession, init_db
from doctec.schemas import UserData
from doctec.tasks.types import DetectionTaskType
from doctec.utils.loggings import get_logger, init_logging


def log_on_calling(fn):
    @wraps(fn)
    def wrap(*args, **kwargs):
        s_args = ", ".join(f"{v}" for v in args)
        s_kwargs = ", ".join(f"{k}={v}" for k, v in kwargs.items())
        _LOGGER.info(f"Api {fn.__name__} called with {s_args}, {s_kwargs}")
        ret = fn(*args, **kwargs)
        _LOGGER.info(f"Api {fn.__name__} returned {ret}")
        return ret

    return wrap


# noinspection PyPep8Naming
@eel.expose
@log_on_calling
def fetchDetectionTaskJobs(
    page_no: int = 0, page_size: int = -1
) -> List[schemas.DetectionTaskJobData]:
    """
    Fetch the detection jobs.

    :param page_no:
    :param page_size:
    :return: a list of detection results in JSON format
    """
    jobs = APP.det_repo.fetch_jobs(page_no, page_size)
    print("555555555555")
    print(jobs)
    return [
        schemas.DetectionTaskJobData.from_pw_model(job).model_dump() for job in jobs
    ]


# noinspection PyPep8Naming
@eel.expose
@log_on_calling
def fetchDetectionTaskJobByUuid(job_uuid: str) -> schemas.DetectionTaskJobData:
    """
    Fetch the detection job by id.

    :param job_uuid:
    :return: the detection job in JSON format
    """
    job = APP.det_repo.fetch_one_job_by_uuid(job_uuid)
    return schemas.DetectionTaskJobData.from_pw_model(job).model_dump()


# noinspection PyPep8Naming
@eel.expose
@log_on_calling
def fetchDetectionTaskCfgs(
    page_no: int = 0, page_size: int = -1
) -> List[schemas.DetectionTaskCfgData]:
    """
    Fetch the detection configs.

    :param page_no:
    :param page_size:
    :return: a list of detection configs in JSON format
    """
    configs = APP.det_repo.fetch_configs(page_no, page_size)
    return [
        schemas.DetectionTaskCfgData.from_pw_model(cfg).model_dump() for cfg in configs
    ]


# noinspection PyPep8Naming
@eel.expose
@log_on_calling
def fetchDetectionTaskCfgByUuid(
    config_uuid: str,
) -> schemas.DetectionTaskCfgData:
    """
    Fetch a detection configuration by its UUID.

    :param config_uuid: The UUID of the configuration to fetch.
    :return: The configuration data formatted as JSON.
    """
    cfg = APP.det_repo.fetch_one_config_by_id(config_uuid)
    return schemas.DetectionTaskCfgData.from_pw_model(cfg).model_dump()


# noinspection PyPep8Naming
@eel.expose
@log_on_calling
def fetchDetectionTaskResByJobUuid(
    job_uuid: str,
) -> schemas.DetectionTaskResData:
    """
    Fetch the detection result by job id.

    :param job_uuid:
    :return: the detection result in JSON format
    """
    detected_files = APP.det_repo.fetch_detected_files_by_job_uuid(job_uuid)
    return schemas.DetectionTaskResData.from_(job_uuid, detected_files).model_dump()


# noinspection PyPep8Naming
@eel.expose
@log_on_calling
def launchDetectionTask(cfg_dto: Dict[str, object]) -> str:
    """
    Launch the detection task.

    :return: uuid of the detection job
    """
    from doctec.tasks.detection import DetectionTask

    # noinspection PyTypeChecker
    for sub in cfg_dto["configs"]:
        sub["type"] = DetectionTaskType.of(sub["type"])
    cfg_dto = schemas.DetectionTaskCfgData.model_validate(cfg_dto)
    if cfg_dto.uuid:
        cfg = APP.det_repo.fetch_one_config_by_id(cfg_dto.uuid)
    else:
        cfg_dto.uuid = uuid4().hex
        cfg = APP.det_repo.create_one_config(cfg_dto)

    job = APP.det_repo.init_job(cfg)
    task = DetectionTask(cfg=cfg, job=job)
    APP.executor.submit(task.do, app=APP)
    return task.job.uuid.hex


# noinspection PyPep8Naming
@eel.expose
@log_on_calling
def deleteDetectedFileByUuid(job_uuid: str) -> bool:
    """
    Delete the detection job by uuid.

    :param job_uuid: the uuid of the detection job
    :return: whether the deletion is successful
    """
    return APP.det_repo.delete_detectedfile_by_uuid(job_uuid)


@eel.expose
@log_on_calling
def debug(msg: str):
    """
    Print the debug message.

    :param msg:
    """
    _LOGGER.info(f"Debug (py): {msg}")


@eel.expose
@log_on_calling
def login(username: str, password: str) -> UserData:
    """
    Authenticate a user and create a session.

    :param username: User's username
    :param password: User's password
    :return: Dict containing user information and session token if authentication successful
    :raise: Exception if authentication fails
    """
    # noinspection PyUnresolvedReferences
    try:
        user = User.get(User.username == username)
        if user.verify_password(password):
            # Create a new session
            session = user.create_session(expires_in_days=1)
            return (
                UserData.from_pw_model(user)
                .with_session_token(session.token)
                .model_dump()
            )
        raise Exception("Invalid password")
    except User.DoesNotExist:
        raise Exception("User not found")


@eel.expose
@log_on_calling
def validate_session(token: str) -> Optional[UserData]:
    """
    Validate a session token and return user information if valid.

    :param token: Session token to validate
    :return: Dict containing user information if session is valid, None otherwise
    """
    session = UserSession.get_valid_session(token)
    if session:
        return (
            UserData.from_pw_model(session.user).with_session_token(token).model_dump()
        )
    return None


@eel.expose
@log_on_calling
def logout(token: str) -> bool:
    """
    Invalidate a session token.

    :param token: Session token to invalidate
    :return: True if session was invalidated, False otherwise
    """
    # noinspection PyUnresolvedReferences
    try:
        session = UserSession.get(UserSession.token == token)
        session.delete_instance()
        return True
    except UserSession.DoesNotExist:
        return False


@eel.expose
@log_on_calling
def fetchAllUsers() -> list[dict]:
    """
    Fetch all users from the database.
    
    :return: List of user dictionaries containing id, username, is_admin and created_at
    :raise: Exception if query fails
    """
    try:
        users = User.select()
        return [UserData.from_pw_model(user).model_dump() for user in users]
    except Exception as e:
        raise Exception(f"Failed to fetch users: {str(e)}")


@eel.expose
@log_on_calling
def fetchAdminUser() -> bool:
    """
    Check if the user with the username 'Admin' exists in the database.

    :return: True if the user exists, False otherwise
    """
    try:
        admin_user = User.get(User.username == 'admin')
        return True  # 用户存在
    except User.DoesNotExist:
        return False  # 用户不存在

@eel.expose
@log_on_calling
def update_password(token: str, old_password: str, new_password: str) -> bool:
    """
    更新用户密码并使所有会话失效
    
    :param token: 用户会话token
    :param old_password: 旧密码
    :param new_password: 新密码
    :return: 是否更新成功
    :raise: Exception 当验证失败时抛出异常
    """
    # 验证会话有效性
    session = UserSession.get_valid_session(token)
    if not session:
        raise Exception("无效的会话，请重新登录")
    
    # 获取用户对象
    user = session.user

    # 验证旧密码
    if not user.verify_password(old_password):
        raise Exception("旧密码不正确")
    
    # 更新密码
    try:
        print("正在更新密码")
        user.update_password(new_password)
        # 使该用户的所有会话失效
        return True
    except Exception as e:
        _LOGGER.error(f"密码更新失败: {str(e)}")
        raise Exception("密码更新失败，请稍后重试")


@eel.expose
@log_on_calling
def deleteUser(username: str) -> bool:
    """
    删除指定用户
    :param username: 要删除的用户名
    :return: 是否删除成功
    """
    try:
        user = User.get(User.username == username)
        user.delete_instance(recursive=True)  # 级联删除关联的session
        return True
    except User.DoesNotExist:
        raise Exception("用户不存在")
    except Exception as e:
        raise Exception(f"删除失败: {str(e)}")

@eel.expose
@log_on_calling
def register(username: str, password: str, is_admin:bool) -> UserData:
    """
    Register a new user.

    :param username: Desired username
    :param password: User's password
    :return: Dict containing user information if registration successful
    :raise: Exception if registration fails
    """
    try:
        # Check if user already exists
        if User.select().where(User.username == username).exists():
            raise Exception("Username already taken")

        # Create new user
        user = User.create_user(username=username, password=password, is_admin=is_admin)
        return UserData.from_pw_model(user).model_dump()
    except Exception as e:
        raise Exception(f"Registration failed: {str(e)}")
    
@eel.expose
@log_on_calling
def getfiletype(file_id: int) -> str:
    """
    从 filemetadata 表中获取文件类型
    
    :param file_id: 文件ID
    :return: 文件类型字符串
    """
    try:
        print("000000000000")
        print(file_id)
        # 从数据库中查询文件类型
        kind = APP.det_repo.fetch_file_type_by_id(file_id)
        return kind
    except Exception as e:
        _LOGGER.error(f"Error fetching file type: {str(e)}")
        raise Exception(f"Failed to get file type: {str(e)}")


if __name__ == "__main__":
    init_logging(level="INFO")
    init_db(db_path="app.db")
    _LOGGER = get_logger(__name__)
    if not fetchAdminUser():  # 直接使用返回值进行判断
        User.create_user(username="admin", password="admin", is_admin=True)
    

    with AppContext() as APP:
        # NOTE: uncomment the following line if you have only Microsoft Edge installed
        getattr(eel, "_start_args")["mode"] = "edge"

        if len(sys.argv) > 1 and sys.argv[1] == "--develop":
            eel.init("client")
            # noinspection PyTypeChecker
            eel.start({"port": 3000}, host="localhost", port=8888)
        else:
            eel.init("build")
            eel.start("index.html")
