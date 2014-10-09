
from google.appengine.ext import ndb

class User(ndb.Model):
    username = ndb.StringProperty()
    email = ndb.StringProperty()
    password = ndb.StringProperty()
    salt = ndb.StringProperty()
    created = ndb.DateTimeProperty(auto_now_add=False)
    active = ndb.BooleanProperty(default=True)



