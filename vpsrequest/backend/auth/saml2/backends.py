from django.core.cache import cache

from djangosaml2.backends import Saml2Backend
from django.contrib.auth import get_user_model


class SAML2Backend(Saml2Backend):
    def authenticate(self, request, session_info=None, attribute_mapping=None,
                     create_unknown_user=True):
        attributes = session_info['ava']

        username = attributes['hrEduPersonUniqueID']
        first_name = attributes['givenName']
        last_name = attributes['sn']
        email = attributes['mail']

        userfound, created = None, None
        try:
            userfound = get_user_model().objects.get(username=username)
        except get_user_model().DoesNotExist:
            user, created = \
                get_user_model().objects.get_or_create(username=username,
                                                       first_name=first_name,
                                                       last_name=last_name,
                                                       email=email)

        if created:
            user.set_unusable_password()
            user.is_active = True
            user.is_staff = False
            user.save()

            return user

        elif userfound:
            userfound.email = email
            userfound.first_name = first_name
            userfound.last_name = last_name
            userfound.save()

            return userfound

        else:
            return None