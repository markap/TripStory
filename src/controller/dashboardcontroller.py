
import basecontroller


from src.model import decorator
from src.model import trip
from src.model import user





class DashboardHandler(basecontroller.BaseHandler):
    @decorator.json_out
    @decorator.auth
    def get(self):
        user_obj = self.get_user()

        trip_query = trip.Trip.get_by_user(user_obj).fetch()

        user_trips = []

        for entry in trip_query:
            trip_data = trip.Trip.as_dict(entry)
            trip_data['user'] = user.User.as_dict(user_obj)

            user_trips.append(trip_data)

        return {
            'trips': user_trips
        }
