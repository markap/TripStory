
from google.appengine.ext.webapp import blobstore_handlers
from google.appengine.ext import blobstore
from google.appengine.api import images
import webapp2
import urllib


class ServeHandler(blobstore_handlers.BlobstoreDownloadHandler):

    def get(self, blobkey):
        blob_key = str(urllib.unquote(blobkey))
        if not blobstore.get(blob_key):
            self.error(404)
            return

        self.send_blob(blobstore.BlobInfo.get(blob_key), save_as=False)


class Img(webapp2.RequestHandler):
    def get(self, blobkey):
        blob_key = str(urllib.unquote(blobkey))
        if blob_key:
            blob_info = blobstore.get(blob_key)

            if blob_info:
                img = images.Image(blob_key=blob_key)
                img.resize(width=800, height=800)
                img.im_feeling_lucky()
                thumbnail = img.execute_transforms(output_encoding=images.JPEG)

                self.response.headers['Content-Type'] = 'image/jpeg'
                self.response.out.write(thumbnail)
                return

        # Either "blob_key" wasn't provided, or there was no value with that ID
        # in the Blobstore.
        self.error(404)


class Thumbnailer(webapp2.RequestHandler):
    def get(self, blobkey):
        blob_key = str(urllib.unquote(blobkey))
        if blob_key:
            blob_info = blobstore.get(blob_key)

            if blob_info:
                img = images.Image(blob_key=blob_key)
                img.resize(width=250, height=140)
                img.im_feeling_lucky()
                thumbnail = img.execute_transforms(output_encoding=images.JPEG)

                self.response.headers['Content-Type'] = 'image/jpeg'
                self.response.out.write(thumbnail)
                return

        # Either "blob_key" wasn't provided, or there was no value with that ID
        # in the Blobstore.
        self.error(404)
