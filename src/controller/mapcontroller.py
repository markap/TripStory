
import basecontroller
import json
from src.model import blobstore as blob
from src.model import decorator
from src.model import trip


class ImageUploadHandler(basecontroller.BaseHandler):

    @decorator.json_out
    @decorator.auth
    def post(self):

        data = self.request.POST['file']


        if data.type.find('image') != -1:
            key = blob.write_blob(data)
            return {'key': key}

        else:
            return self.format_error("some error")



class SaveHandler(basecontroller.BaseHandler):

    @decorator.json_out
    @decorator.auth
    def post(self):
        payload = json.loads(self.request.body)
        trip_obj = trip.Trip.create(self.get_user(), payload)
        return trip.Trip.as_dict(trip_obj)


class DeleteHandler(basecontroller.BaseHandler):
    @decorator.json_out
    @decorator.auth
    def post(self):
        payload = json.loads(self.request.body)
        trip_obj = trip.Trip.get_by_id(payload['tripid'])

        if (trip_obj.user == self.get_user().key):
            trip_obj.active = False
            trip_obj.put()
            return
        return self.format_error("You are allowed to delete this item")


class UpdateNameHandler(basecontroller.BaseHandler):
    @decorator.json_out
    @decorator.auth
    def post(self):
        payload = json.loads(self.request.body)
        trip_obj = trip.Trip.get_by_id(payload['tripid'])


        if (trip_obj.user == self.get_user().key):
            trip.Trip.update_name(trip_obj, payload['name'])
            return
        return self.format_error("You are allowed to change the name")


class UpdateDescriptionHandler(basecontroller.BaseHandler):
    @decorator.json_out
    @decorator.auth
    def post(self):
        payload = json.loads(self.request.body)
        trip_obj = trip.Trip.get_by_id(payload['tripid'])


        if (trip_obj.user == self.get_user().key):
            trip.Trip.update_description(trip_obj, payload['position'], payload['description'])
            return
        return self.format_error("You are allowed to change the description")


class ImageDeleteHandler(basecontroller.BaseHandler):
    @decorator.json_out
    @decorator.auth
    def post(self):
        payload = json.loads(self.request.body)
        trip_obj = trip.Trip.get_by_id(payload['tripid'])


        if (trip_obj.user == self.get_user().key):
            trip.Trip.delete_image(trip_obj, payload['position'], payload['imageid'])
            return
        return self.format_error("You are allowed to delete the image")


class ImageAddHandler(basecontroller.BaseHandler):

    @decorator.json_out
    @decorator.auth
    def post(self):

        data = self.request.POST['file']
        trip_obj = trip.Trip.get_by_id(self.request.POST['tripid'])
        position = int(self.request.POST['position'])


        if (trip_obj.user == self.get_user().key):
            if data.type.find('image') != -1 and len(trip_obj.locations[position]['images']) < 3:
                key = blob.write_blob(data)
                trip.Trip.add_image(trip_obj, position, key)
                return {'key': key}

            else:
                return self.format_error("some error")
        return self.format_error("You are allowed to change the description")


class LikeHandler(basecontroller.BaseHandler):

    @decorator.json_out
    @decorator.auth
    def post(self):
        payload = json.loads(self.request.body)
        user_obj = self.get_user()

        trip_obj = trip.Trip.get_by_id(payload['tripid'])
        trip.Trip.set_like(trip_obj, user_obj)

        return trip.Trip.as_dict(trip_obj)



