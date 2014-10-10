
from google.appengine.ext.webapp import blobstore_handlers
from google.appengine.ext import blobstore
import urllib


class ServeHandler(blobstore_handlers.BlobstoreDownloadHandler):

    def get(self, blobkey):
        blob_key = str(urllib.unquote(blobkey))
        if not blobstore.get(blob_key):
            self.error(404)
            return

        self.send_blob(blobstore.BlobInfo.get(blob_key), save_as=False)