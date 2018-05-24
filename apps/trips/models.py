from django.db import models
from django.contrib import messages
import datetime
import bcrypt

class UserManager(models.Manager):
    def validate_register(self, postData):
        errors = {}
        if len(postData['first_name']) < 2:
            errors['first_name'] = "First name should be at least 2 characters"
        if len(postData['last_name']) < 2:
            errors['last_name'] = "Last name should be at least 2 characters"
        if not postData['first_name'].isalpha() or not postData['last_name'].isalpha():
            errors['name'] = "First and Last name should contain letters only"
        if User.objects.filter(email=postData['email']):
            errors['email'] = "Email is already registered"
        if len(postData['email']) < 1:
            errors['email'] = "Email is required"
        valid_e = False
        for c in postData['email']:
            if c == "@":
                valid_e = True
        if not valid_e:
            errors['email'] = "Email must be a valid email"
        if len(postData['password']) < 8:
            errors['password'] = 'Password must be at least 8 characters long'
        if postData['password'] != postData['confirm_pw']:
            errors['password'] = "Password and Confirm password must match"
        return errors

    def validate_signin(self, postData):
        errors = {}
        if postData['email']:
            try:
                user = User.objects.get(email=postData['email'])
                if not user:
                    errors['login'] = "Unable to signin"
                elif not bcrypt.checkpw(postData['password'].encode(), user.password.encode()):
                    errors['login'] = "Unable to signin"
            except:
                errors['login'] = "Unable to signin"
        else:
            errors['login'] = "Unable to signin"
        return errors

    def validate_trip(self, postData):
        errors = {}
        if not postData['title'] or not postData['description'] or not postData['date_from'] or not postData['date_to']:
            errors['trip']= "All fields are required."
        today = datetime.datetime.now()
        try:
            date_from = datetime.datetime.strptime(postData['date_from'], '%Y-%m-%d')
            date_to = datetime.datetime.strptime(postData['date_to'], '%Y-%m-%d')
            if date_to < date_from:
                errors['trip'] = "Travel Date To must be on or after Travel Date From. Time machine hasn't been invented. We apologize for the inconvenience."
            if date_from < today:
                errors['trip'] = "Travel date must be today or in the future. Time machine hasn't been invented. We apologize for the inconvenience."
        except:
            errors['trip'] = "All fields are required."
        return errors


class User(models.Model):
    email = models.CharField(max_length=255)
    first_name = models.CharField(max_length=255)
    last_name = models.CharField(max_length=255)
    password = models.CharField(max_length=255)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    objects = UserManager()

class Trip(models.Model):
    title = models.CharField(max_length=255)
    description = models.TextField()
    date_from = models.DateField()
    date_to = models.DateField()
    admin = models.ForeignKey(User, related_name="trips_planned")
    attended_by = models.ManyToManyField(User, related_name="trips_attending")
    invited = models.ManyToManyField(User, related_name="trips_invited_to")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

class Agenda(models.Model):
    day = models.IntegerField()
    date = models.DateField()
    trip = models.ForeignKey(Trip, related_name="agendas")

class Activity(models.Model):
    location = models.CharField(max_length=255)
    lng = models.FloatField()
    lat = models.FloatField()
    result = models.CharField(max_length = 255)
    imgref = models.CharField(max_length = 255)
    description = models.TextField()
    likes = models.IntegerField()
    agenda = models.ForeignKey(Agenda, related_name="activities")
