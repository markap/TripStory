
from google.appengine.ext import ndb

class User(ndb.Model):
    username = ndb.StringProperty()
    email = ndb.StringProperty()
    password = ndb.StringProperty()
    salt = ndb.StringProperty()
    created = ndb.DateTimeProperty(auto_now_add=True)
    active = ndb.BooleanProperty(default=True)


class Trip(ndb.Model):
    name = ndb.StringProperty()
    created = ndb.DateTimeProperty(auto_now_add=True)
    active = ndb.BooleanProperty(default=True)
    user = ndb.KeyProperty(kind='User')
    locations = ndb.JsonProperty()



