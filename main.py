#!/usr/bin/env python


import webapp2

from src.controller import webcontroller, usercontroller, dashboardcontroller,\
    mapcontroller, imagehandler

actions = [

    ('/web/', webcontroller.WebHandler),

    ('/api/user/signin', usercontroller.UserHandler),
    ('/api/user/signup', usercontroller.UserLoginHandler),
    ('/api/user/session', usercontroller.UserSessionHandler),
    ('/api/user/logout', usercontroller.UserLogoutHandler),

    ('/api/dashboard', dashboardcontroller.Dashboardandler),

    ('/api/map/save', mapcontroller.SaveHandler),
    ('/api/map/upload', mapcontroller.ImageUploadHandler),

    ('/api/img/(.*)', imagehandler.ServeHandler)




]


myconfig_dict = {}
myconfig_dict['webapp2_extras.sessions'] = {
    'secret_key': 'jkldafjka1234ldj134134j45ladjfakl89',
}


app = webapp2.WSGIApplication(actions, debug=True, config=myconfig_dict)