
import basecontroller
import json

from src.model import decorator
from src.model import trip
from src.model import user





class DashboardHandler(basecontroller.BaseHandler):
    @decorator.json_out
    @decorator.auth
    def get(self):

        trip_query = trip.Trip.get().fetch()

        trips_overview = []
        users = {}

        for entry in trip_query:
            trip_data = trip.Trip.as_dict(entry)

            if entry.user in users:
                trip_data['user'] = users[entry.user]
            else:
                user_data = user.User.as_dict(entry.user.get())
                trip_data['user'] = user_data
                users[entry.key] = user_data

            trips_overview.append(trip_data)

        return {
            'trips': trips_overview
        }


class DetailsHandler(basecontroller.BaseHandler):
    @decorator.json_out
    @decorator.auth
    def post(self):
        payload = json.loads(self.request.body)

        trip_obj = trip.Trip.get_by_id(payload['tripid'])
        trip_data = trip.Trip.as_dict(trip_obj)

        trip_data['user'] = user.User.as_dict(trip_obj.user.get())

        return {
            'trip': trip_data
        }


class UserHandler(basecontroller.BaseHandler):
    @decorator.json_out
    @decorator.auth
    def post(self):
        payload = json.loads(self.request.body)
        if 'userid' in payload:
            user_obj = user.User.get_by_id(payload['userid'])
        else:
            user_obj = self.get_user()

        trip_query = trip.Trip.get_by_user(user_obj).fetch()

        user_trips = []

        for entry in trip_query:
            trip_data = trip.Trip.as_dict(entry)
            trip_data['user'] = user.User.as_dict(user_obj)

            user_trips.append(trip_data)

        return {
            'trips': user_trips,
            'user': user.User.as_dict(user_obj)
        }

class ShareHandler(basecontroller.BaseHandler):

    @decorator.json_out
    def post(self):
        payload = json.loads(self.request.body)


        trip_obj = trip.Trip.get_by_id(payload['shareid'])


        return {
            'trip': trip.Trip.as_share_dict(trip_obj)
        }