
import basecontroller


class WebHandler(basecontroller.BaseHandler):

    def get(self):
        self.response.out.write(self.render('web.html'))


class WebRedirectHandler(basecontroller.BaseHandler):

    def get(self):
        if self.get_user():
            self.redirect("http://travelstoryme.appspot.com/web/#dashboard")
        else:
            self.redirect("http://travelstoryme.appspot.com/web/#landingpage")
