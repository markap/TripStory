
import basecontroller
import json

from src.model import decorator
from src.model import user


class UserHandler(basecontroller.BaseHandler):

    @decorator.json_out
    def post(self):
        payload = json.loads(self.request.body)
        validator = user.User.get_signup_validator(payload)

        if validator.is_valid():
            user_obj = user.User.create(payload)
            return user.User.as_dict(user_obj)
        return validator.get_errors()


class UserSessionHandler(basecontroller.BaseHandler):
    @decorator.json_out
    def get(self):
        user_obj = self.get_user()
        if self.get_user():
            return user.User.as_dict(user_obj)
        return self.format_error('redirect')


class UserLogoutHandler(basecontroller.BaseHandler):
    @decorator.json_out
    def get(self):
        self.logout_user()
        return


class UserLoginHandler(basecontroller.BaseHandler):
    @decorator.json_out
    def post(self):
        payload = json.loads(self.request.body)
        validator = user.User.get_signin_validator(payload)

        if validator.is_valid():
            user_obj = user.User.get_by_signup(payload)
            if user_obj:
                user_dict = user.User.as_dict(user_obj)
                self.login_user(user_dict)
                return user_dict
            return self.format_error('Your username or password was incorrect')
        return validator.get_errors()


