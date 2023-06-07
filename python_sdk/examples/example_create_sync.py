from infrahub_client import InfrahubClientSync


def main():
    client = InfrahubClientSync.init(address="http://localhost:8000")
    data = {"name": "janedoe", "label": "Jane Doe", "type": "User", "password": "J4nesSecret!"}
    obj = client.create(kind="Account", data=data)
    obj.save()
    print(f"New user created with the Id {obj.id}")


if __name__ == "__main__":
    main()
