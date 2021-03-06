


import model
import hashtag



class Trip:

    @staticmethod
    def create(user, payload):

        obj = model.Trip()
        obj.user = user.key
        obj.name = payload['name']
        obj.hashtags = Trip.get_hashtags(payload['name'], payload['locations'])
        obj.locations = payload['locations']
        obj.put()
        return obj


    @staticmethod
    def get_hashtags(name, locations):
        hashtags = set([])
        hashtags = hashtags.union(hashtag.filter_hashtags(name))

        for location in locations:
            hashtags = hashtags.union(hashtag.filter_hashtags(location['description']))

        return list(hashtags)


    @staticmethod
    def update_name(trip_obj, name):
        trip_obj.name = name
        trip_obj.hashtags = Trip.get_hashtags(name, trip_obj.locations)
        trip_obj.put()

    @staticmethod
    def update_description(trip_obj, position, description):
        trip_obj.locations[position]['description'] = description
        trip_obj.hashtags = Trip.get_hashtags(trip_obj.name, trip_obj.locations)
        trip_obj.put()


    @staticmethod
    def delete_image(trip_obj, position, image_id):
        del trip_obj.locations[position]['images'][image_id]
        trip_obj.put()

    @staticmethod
    def add_image(trip_obj, position, key):
        trip_obj.locations[position]['images'].append(key)
        trip_obj.put()



    @staticmethod
    def get():
        return model.Trip.query(model.Trip.active == True).order(-model.Trip.created)


    @staticmethod
    def get_by_user(user):
        return model.Trip.query(model.Trip.user == user.key, model.Trip.active == True).order(-model.Trip.created)

    @staticmethod
    def get_by_hashtag(hashtag):
        return model.Trip.query().filter(model.Trip.hashtags.IN([hashtag.lower()]), model.Trip.active == True).order(-model.Trip.created)

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


