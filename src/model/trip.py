


import model
from google.appengine.ext import ndb



class Trip:

    @staticmethod
    def create(user, payload):

        obj = model.Trip()
        obj.user = ndb.Key(model.User, str(user))
        obj.name = payload['name']
        obj.locations = payload['locations']
        obj.put()
        return obj



    @staticmethod
    def as_dict(obj):
        return {
            'name': obj.name,
            'created': obj.created.isoformat(),
            'locations': obj.locations

        }
