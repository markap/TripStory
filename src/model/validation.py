import re


class Validator:
    errors = []

    def __init__(self, payload, rules):
        self.errors = []
        self.payload = payload
        self.rules = rules
        self.__validate()

    def __validate(self):
        for rule in self.rules:
            if not rule.has_value(self.payload):
                self.errors.append(rule.message)
                continue
            rule.retrieve_value(self.payload)
            if not rule.is_valid():
                self.errors.append(rule.message)


    def is_valid(self):
        return len(self.errors) == 0


    def get_errors(self):
        return {'errors': self.errors}


class Val:
    def __init__(self, key, message):
        self.key = key
        self.message = message

    def retrieve_value(self, payload):
        self.value = payload[self.key]

    def has_value(self, payload):
        return self.key in payload


class NoneVal(Val):
    def is_valid(self):
        return False if self.value is None or len(self.value.strip()) is 0 else True


class ListNotEmptyVal(Val):
    def is_valid(self):
        return True if len(self.value) > 0 else False


class ListLongVal(Val):
    def is_valid(self):
        if len(self.value) == 0:
            return False

        for i in self.value:
            if not is_type_valid(i, long):
                return False
        return True


class ListStringVal(Val):
    def is_valid(self):
        if len(self.value) == 0:
            return False

        for i in self.value:
            if not is_type_valid(i, unicode):
                return False
        return True


def is_type_valid(value, fn):
    try:
        value = fn(value)
    except ValueError:
        return False

    return True if isinstance(value, fn) else False


class FloatVal(Val):
    def is_valid(self):
        return is_type_valid(self.value, float)


class IntVal(Val):
    def is_valid(self):
        return is_type_valid(self.value, int)


class BoolVal(Val):
    def is_valid(self):
        return is_type_valid(self.value, bool)


class LongVal(Val):
    def is_valid(self):
        return is_type_valid(self.value, long)


class LongOrNoneVal(Val):
    def is_valid(self):
        return self.value is None or is_type_valid(self.value, long)


class EmailVal(Val):
    def is_valid(self):
        email_re = re.compile(
            r"(^[-!#$%&'*+/=?^_`{}|~0-9A-Z]+(\.[-!#$%&'*+/=?^_`{}|~0-9A-Z]+)*"  # dot-atom
            # quoted-string, see also http://tools.ietf.org/html/rfc2822#section-3.2.5
            r'|^"([\001-\010\013\014\016-\037!#-\[\]-\177]|\\[\001-\011\013\014\016-\177])*"'
            r')@((?:[A-Z0-9](?:[A-Z0-9-]{0,61}[A-Z0-9])?\.)+[A-Z]{2,6}\.?$)'  # domain
            r'|\[(25[0-5]|2[0-4]\d|[0-1]?\d?\d)(\.(25[0-5]|2[0-4]\d|[0-1]?\d?\d)){3}\]$', re.IGNORECASE)

        return email_re.match(self.value)


class GenericVal(Val):
    def __init__(self, key, message, val_fn):
        Val.__init__(self, key, message)
        self.val_fn = val_fn

    def is_valid(self):
        return self.val_fn(self.value)


class PasswordValidator(Val):
    def is_valid(self):
        # @todo password is not too secure
        return False if len(self.value) < 4 else True