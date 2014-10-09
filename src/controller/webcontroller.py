
import basecontroller


class WebHandler(basecontroller.BaseHandler):

    def get(self):
        self.response.out.write(self.render('web.html'))