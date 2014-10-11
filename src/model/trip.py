


import model
from google.appengine.ext import ndb
import hashtag



class Trip:

    @staticmethod
    def create(user, payload):

        obj = model.Trip()
        obj.user = user.key
        obj.name = payload['name']
        obj.hashtags = hashtag.filter_hashtags(payload['name'])
        obj.locations = payload['locations']
        obj.put()
        return obj

    @staticmethod
    def get_by_user(user):
        return model.Trip.query(model.Trip.user == user.key, model.Trip.active == True).order(-model.Trip.created)

    @staticmethod
    def get_by_hashtag(hashtag):
        return model.Trip.query().filter(model.Trip.hashtags.IN([hashtag]), model.Trip.active == True).order(-model.Trip.created)

    @staticmethod
    def get_by_id(id_):
        return model.Trip.get_by_id(long(id_))


    @staticmethod
    def as_dict(obj):
        return {
            'id': obj.key.id(),
            'name': obj.name,
            'created': obj.created.isoformat(),
            'locations': obj.locations

        }
