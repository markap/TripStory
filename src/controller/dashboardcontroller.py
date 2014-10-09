
import basecontroller


from src.model import decorator
from src.model import user





class Dashboardandler(basecontroller.BaseHandler):
    @decorator.json_out
    @decorator.auth
    def get(self):
        user_obj = self.get_user()

        sample_data = [
            {'name': 'server1', 'state': 'critical', 'location': 'r34'},
            {'name': 'server2', 'state': 'stable', 'location': 'r34'},
            {'name': 'server3', 'state': 'stable', 'location': 'r32'},
            {'name': 'server4', 'state': 'warning', 'location': 'r01'},
            {'name': 'server5', 'state': 'stable', 'location': 'r01'}
        ]

        return {
            'user': user.User.as_dict(user_obj),
            'servers': sample_data
        }
