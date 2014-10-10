
import basecontroller
from src.model import blobstore as blob, decorator


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
