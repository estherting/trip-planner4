from django.conf.urls import url
from . import views

urlpatterns = [
    url(r'^$', views.index),
    url(r'^signin', views.signin),
    url(r'^signin/google$', views.googleSignin),
    url(r'^register$', views.register),
    url(r'^register/process$', views.register_process),
    url(r'^profile$', views.profile),
    url(r'^trips/new$', views.newTrip),
    url(r'^trips/new/process$', views.newTrip_process),
    url(r'^trips/plan/(?P<tripID>\d+)$', views.plan),
    url(r'^trips/plan/(?P<tripID>\d+)/agenda$', views.agenda),
    url(r'^trips/plan/(?P<tripID>\d+)/agenda/new$', views.newAgenda),
    url(r'^trips/plan/(?P<tripID>\d+)/agenda/new/content$', views.agendaContent),
    url(r'^trips/plan/(?P<tripID>\d+)/add_travelbuddy$', views.addTravelBuddy),
    url(r'^trips/plan/(?P<tripID>\d+)/add_travelbuddy/(?P<userID>\d+)/process$', views.addTravelBuddy_process),
    url(r'^trips/plan/(?P<tripID>\d+)/join$', views.joinTrip),
    url(r'^logout$', views.logout),
    url(r'^try$', views.tryIt),
    url(r'^gettripid$', views.gettripid),
    url(r'^trips/activity/add$', views.addactivity),
    url(r'^setdaysession/day(?P<dayID>\d+)$', views.setdaysession),
    url(r'^trips/activity/addtoagenda$', views.addtoagenda),

]
