#!/usr/bin/env python


import webapp2

from src.controller import webcontroller, usercontroller, dashboardcontroller,\
    mapcontroller, imagehandler, searchcontroller

actions = [

    ('/', webcontroller.WebRedirectHandler),

    ('/web/', webcontroller.WebHandler),

    ('/api/user/signin', usercontroller.UserHandler),
    ('/api/user/signup', usercontroller.UserLoginHandler),
    ('/api/user/session', usercontroller.UserSessionHandler),
    ('/api/user/logout', usercontroller.UserLogoutHandler),

    ('/api/dashboard', dashboardcontroller.DashboardHandler),
    ('/api/dashboard/details', dashboardcontroller.DetailsHandler),
    ('/api/profile', dashboardcontroller.UserHandler),
    ('/api/share', dashboardcontroller.ShareHandler),

    ('/api/search', searchcontroller.HashtagSearchHandler),

    ('/api/map/save', mapcontroller.SaveHandler),
    ('/api/map/delete', mapcontroller.DeleteHandler),
    ('/api/map/upload', mapcontroller.ImageUploadHandler),
    ('/api/map/like', mapcontroller.LikeHandler),
    ('/api/map/update.name', mapcontroller.UpdateNameHandler),
    ('/api/map/update.description', mapcontroller.UpdateDescriptionHandler),
    ('/api/map/image.delete', mapcontroller.ImageDeleteHandler),
    ('/api/map/image.add', mapcontroller.ImageAddHandler),

    ('/api/thumb/(.*)', imagehandler.Thumbnailer),
    ('/api/img/(.*)', imagehandler.Img)




]


myconfig_dict = {}
myconfig_dict['webapp2_extras.sessions'] = {
    'secret_key': 'jkldafjka1234ldj134134j45ladjfakl89',
}


app = webapp2.WSGIApplication(actions, debug=True, config=myconfig_dict)