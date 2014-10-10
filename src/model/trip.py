


import model
from google.appengine.ext import ndb



class Trip:

    @staticmethod
    def create(user, payload):

        obj = model.Trip()
        obj.user = user.key
        obj.name = payload['name']
        obj.locations = payload['locations']
        obj.put()
        return obj

    @staticmethod
    def get_by_user(user):
        return model.Trip.query(model.Trip.user == user.key).order(-model.Trip.created)



    @staticmethod
    def as_dict(obj):
        return {
            'id': obj.key.id(),
            'name': obj.name,
            'created': obj.created.isoformat(),
            'locations': obj.locations

        }
