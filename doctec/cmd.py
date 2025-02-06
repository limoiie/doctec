import getpass

import fire

from doctec.models import init_db, User


def add_user(username: str = None, email: str = None):
    if not username:
        username = input("Enter your username: ")
        if not username:
            raise ValueError("Username is required")

    if not email:
        email = input("Enter your email: ")
        if not email:
            raise ValueError("Email is required")

    password = getpass.getpass("Enter your password: ")
    if not password:
        raise ValueError("Password is required")

    print(f"Adding user: {username} ({email})")

    db_path = "app.db"
    init_db(db_path)
    User.create_user(username=username, email=email, password=password)

    print("User added successfully")


if __name__ == "__main__":
    fire.Fire()
