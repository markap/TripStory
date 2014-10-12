
import basecontroller


class WebHandler(basecontroller.BaseHandler):

    def get(self):
        self.response.out.write(self.render('web.html'))


class WebRedirectHandler(basecontroller.BaseHandler):

    def get(self):
        self.redirect("http://tripstory-new.appspot.com/web/")