


import model
import hashtag



class Trip:

    @staticmethod
    def create(user, payload):

        hashtags = set([])
        hashtags = hashtags.union(hashtag.filter_hashtags(payload['name']))

        for location in payload['locations']:
            print hashtag.filter_hashtags(location['description'])
            hashtags = hashtags.union(hashtag.filter_hashtags(location['description']))




        obj = model.Trip()
        obj.user = user.key
        obj.name = payload['name']
        obj.hashtags = list(hashtags)
        obj.locations = payload['locations']
        obj.put()
        return obj

    @staticmethod
    def get():
        return model.Trip.query(model.Trip.active == True).order(-model.Trip.created)


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
    def set_like(trip_obj, user_obj):
        likes = trip_obj.likes
        if str(user_obj.key.id()) in likes:
            del likes[str(user_obj.key.id())]
        else:
            likes[user_obj.key.id()] = user_obj.username
        trip_obj.likes = likes
        trip_obj.put()



    @staticmethod
    def as_dict(obj):
        return {
            'id': obj.key.id(),
            'name': obj.name,
            'created': obj.created.isoformat(),
            'locations': obj.locations,
            'likes': obj.likes

        }

    @staticmethod
    def as_share_dict(obj):
        return {
            'id': obj.key.id(),
            'name': obj.name,
            'created': obj.created.isoformat(),
            'locations': obj.locations

        }


