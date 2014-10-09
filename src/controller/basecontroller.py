import os

from webapp2_extras import sessions
import webapp2
import jinja2

from src.model import user



class BaseHandler(webapp2.RequestHandler):



    def dispatch(self):
        # Get a session store for this request.
        self.session_store = sessions.get_store(request=self.request)

        try:
            # Dispatch the request.
            webapp2.RequestHandler.dispatch(self)
        finally:
            # Save all sessions.
            self.session_store.save_sessions(self.response)

    @webapp2.cached_property
    def session(self):
        # Returns a session using the default cookie key.
        return self.session_store.get_session()

    def login_user(self, user_obj):
        self.session['user'] = user_obj['id']



    def get_user(self):
        if 'user' in self.session and self.session['user']:
            return user.User.get_by_id(self.session['user'])


    def logout_user(self):
        del self.session['user']



    def jinja_environment(self):
        return jinja2.Environment(loader=jinja2.FileSystemLoader(os.path.dirname(__file__)
                                + '/../../templates'),
                                variable_start_string='((', variable_end_string='))')


    def render(self, template_name, values={}):
        env = self.jinja_environment()
        env.globals.update()

        template = env.get_template(template_name)

        values['path'] = self.request.path.split('/')[2]

        return template.render(values)

    def format_error(self, msg):
        return {'errors': [msg]}

