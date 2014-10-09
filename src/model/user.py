import hashlib


import model
import random
import validation as val



class User:

    @staticmethod
    def get_signup_validator(payload):
        payload['email'] = payload['email'].lower()
        payload['username'] = payload['username'].lower()

        rules = [val.GenericVal('username', 'The username is already in use', User.not_exist_by_username),
                 val.EmailVal('email', 'Please provide a valid email address'),
                 val.GenericVal('email', 'The email address is already in use', User.not_exist_by_email),
                 val.PasswordValidator('password', 'Please provide a valid password')
        ]

        return val.Validator(payload, rules)


    @staticmethod
    def get_signin_validator(payload):
        rules = [val.NoneVal('email', 'Please provide a username or email address'),
                 val.NoneVal('password', 'Please provide a password')]

        return val.Validator(payload, rules)

    @staticmethod
    def get_by_email(email):
        email = email.lower()
        return model.User.query().filter(model.User.email == email).get()

    @staticmethod
    def get_by_username(username):
        username = username.lower()
        return model.User.query().filter(model.User.username == username).get()


    @staticmethod
    def not_exist_by_email(email):
        return User.get_by_email(email) is None

    @staticmethod
    def not_exist_by_username(username):
        return User.get_by_username(username) is None

    @staticmethod
    def create(payload):
        salt = str(random.random())

        obj = model.User()
        obj.email = payload['email'].lower()
        obj.username = payload['username'].lower()
        obj.password = hashlib.sha224(payload['password']+salt).hexdigest()
        obj.salt = salt
        obj.active = True
        obj.put()
        return obj

    @staticmethod
    def get_by_signup(payload):
        ident = payload['email'].lower()
        user = User.get_by_email(ident)
        if user is None:
            user = User.get_by_username(ident)


        if user \
            and user.password == hashlib.sha224(payload['password'] + user.salt).hexdigest():
            return user

        return None

    @staticmethod
    def get_by_id(id_):
        return model.User.get_by_id(id_)

    @staticmethod
    def as_dict(obj):
        return {
            'id': obj.key.id(),
            'username': obj.username,
            'email': obj.email
        }
