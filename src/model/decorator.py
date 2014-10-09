from functools import wraps
import json



def json_out(f):
    @wraps(f)
    def wrapped(*args, **kwargs):
        r = f(*args, **kwargs)
        return args[0].response.out.write(json.dumps(r, default=lambda o: o.__dict__))

    return wrapped

def auth(f):
    @wraps(f)
    def wrapped(self, *args, **kwargs):
        if 'user' in self.session and self.session['user'] is not None:
            pass

        else:
            return {'error': ['please login first']}

        r = f(self, *args, **kwargs)
        return r

    return wrapped
