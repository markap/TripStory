
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

