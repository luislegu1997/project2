import os

from flask import Flask, render_template, redirect, url_for, session, request
from flask_session import Session
from flask_socketio import SocketIO, emit, send
import sys

from flask_jsglue import JSGlue

import json


app = Flask(__name__)
app.config["SECRET_KEY"] = os.getenv("SECRET_KEY")
socketio = SocketIO(app)
jsglue = JSGlue(app)


app.config["SESSION_PERMANENT"] = False
app.config["SESSION_TYPE"] = "filesystem"
Session(app)


channels_lst = []

global channels_messages
channels_messages = {}


global sms

sms = 0



@app.route('/',  methods=["GET", "POST"])
def index():

    if request.method == "POST":

        return redirect(url_for("channel_creation"))

    return render_template("index.html")


@app.route("/channel_creation")
def channel_creation():

    return render_template("channel_creation.html", channels_lst_1= channels_lst)

#adding new channel to channels_lst
@socketio.on('adding_channel')
def adding_new_channel(json):

    data = json['channel']

    if data not in channels_lst:

        channels_lst.append(data)

        json['channels_lst']= channels_lst

        socketio.emit('new_channel_added', json,  broadcast=True)


@app.route("/channels/<channel>")
def channels(channel):

    #if there are no messages in the channel yet
    if channel not in channels_messages.keys():

        channels_messages[channel] = []

        return render_template("channel_chat.html" , channel = channel)
        
    if len(channels_messages[channel]) > 0:

        #if there are 100 or more messages display just the last 100
        if len(channels_messages[channel]) >= 100:

            channels_messages[channel] = channels_messages[channel][-100:]

    print(channels_messages)

    return render_template("channel_chat.html" , channel = channel, messages=channels_messages[channel])



@socketio.on('chat')
def new_message(json):

    channel = json['channel']

    day = json['time_stamp'][8:10]

    month = json['time_stamp'][5:7]
  
    year = json['time_stamp'][2:4]

    hour = json['time_stamp'][11:16]

    # updating sms unique id number
    global sms

    sms += 1

    json['sms_number'] = sms

    json['time_stamp'] = "{}/{}/{} {}".format(day,month ,year,hour)

    # saving sms in server side 
    channels_messages[channel].append({'user': json['user'], 'message' : json['message'], 'time_stamp' : json['time_stamp'], 'sms_number' : json['sms_number']})

    socketio.emit('message', json, broadcast= True)



@socketio.on('delete_sms')
def delete_msg(json):

    #just save the messages that have a different id than the message deleted
    temporal_lst = [ sms for sms in channels_messages[json['channel']] if sms['sms_number'] != int(json['sms_delition'] )]

    channels_messages[json['channel']] = temporal_lst

    socketio.emit('deletion', json, broadcast= True)


@app.route("/delete/<channel>" , methods=["GET", "POST"])
def delete_channel(channel):

    channels_lst.remove(channel)

    global channels_messages
    
    channels_messages = {chnnl: channels_messages[chnnl] for chnnl in channels_messages if chnnl != channel }

    return redirect(url_for('channel_creation'))



if __name__ == '__main__':
    socketio.run(app, debug=True)
