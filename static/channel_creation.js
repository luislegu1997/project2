var socket = io.connect('http://' + document.domain + ':' + location.port);

      socket.on( 'connect', function() {
        
        //every time the user tries to create a new channel 
        $('form').on( 'submit', function( e ) {

            e.preventDefault()

            //retrieving lst of channels from flask, contained in a div value attribute 
            var channels = $('div.lst_channels').attr('value')

            //if the array has [] we need to remove them
            if (channels.includes("["))

                channels = channels.slice(1,-1)

            var new_array = channels.split(',');

            //retrieving the channel the user is trying to create
            let user_input = $( 'input.channel' ).val()

            //checking if channel doesn´t exists already
            for (const channel of new_array) {

                var new_channel = channel.replace("'", "").replace("'", "").replace(" ", "")

                if (user_input === new_channel) {

                  //if channel already exists alert the user 
                  alert("that channel already exists")
                  
                  //stop request by reloading page
                  window.location =  Flask.url_for('channel_creation');

              }

            }
            
            //sending new channel to socket in flask to be saved
            socket.emit( 'adding_channel', {

              channel : user_input

            } )

            //clearing input field
            $( 'input.channel' ).val( '' ).focus()

        } )

      } )

      //receiving respons from socket in flask  
      socket.on('new_channel_added', function( data ) {

          if(!document.getElementById('display_if_channel')){

              if(!document.getElementById('display_if_not_channel').innerHTML)

                  document.getElementById('display_if_not_channel').innerHTML = "Select Channel";   

          }

          //dynamically displaying new channel
          display_channel(data.channel);

          //dynamically updating client channels_lst
          $('div.lst_channels').attr('value',  data.channels_lst)
       
      });



    function display_channel(channel){


      var li = document.createElement('li')

      var a = document.createElement('a');

      a.href = Flask.url_for('channels', {'channel' : channel});

      a.innerHTML = channel;

      li.append(a)

      document.querySelector('#channels_list').appendChild(li);


    };          



document.addEventListener("DOMContentLoaded", () => {


    if (localStorage.getItem('channel'))

        localStorage.removeItem('channel')



    const name = localStorage.getItem("user");

    document.querySelector("#user").innerHTML= name;


    //making sure all channels have at least one symbol
    document.querySelector('#submit').disabled = true;

    document.querySelector('#channel').onkeyup = () => {


        if (document.querySelector("#channel").value.length > 0)

            document.querySelector("#submit").disabled = false;

        else
        
            document.querySelector('#submit').disabled = true;

      }

});









