document.addEventListener('DOMContentLoaded', () => {

  var channel = $('div.current_channel').text()

  //saving current channel in localstorage
  localStorage.setItem('channel', channel);

  $("#scrollable").scrollTop($("#scrollable")[0].scrollHeight);

    //making sure user can´t send empty sms
    document.querySelector('#submit').disabled = true;

    document.querySelector('#SMS').onkeyup = () => {

      if (document.querySelector("#SMS").value.length > 0)

          document.querySelector("#submit").disabled = false;

      else

          document.querySelector('#submit').disabled = true;

    }


      
});

var socket = io.connect('http://' + document.domain + ':' + location.port);


      socket.on( 'connect', function() {

        // every time the user sends message
        $( 'form' ).on( 'submit', function( e ) {

          e.preventDefault()

          // get new sms of the user
          let user_input = $( 'input.message' ).val()

          // retrieving time and date of sms
          var time = new Date(); 

          var localDate = new Date(time.getTime() - time.getTimezoneOffset() * 60 * 1000);

          var currentUrl = window.location.href;     

          // sending sms to flask socket 
          socket.emit( 'chat', {

            channel : localStorage.getItem('channel'),

            user : localStorage.getItem('user'),

            message : user_input,

            time_stamp : localDate,

            current_url : currentUrl

          } )

          $( 'input.message' ).val( '' ).focus()

          document.querySelector('#submit').disabled = true;

        } )

      } )

      // receiving new sms
      socket.on( 'message', function( msg ) {


        var currentUrl = window.location.href;

        // show new sms only if user is in same channel
        if (currentUrl == msg.current_url) { 

          
          var newDiv = document.createElement('div');

          newDiv.setAttribute('id', msg.sms_number)

          newDiv.setAttribute('class', 'SMS')

          newDiv.innerHTML ='<div><b style="color: #f71919">'+msg.time_stamp+' </b><b style="color:#2659ff">'+msg.user+'</b>  '+msg.message+'</div>'

          var button = document.createElement('button');

          button.innerHTML ='Delete'
          
          button.setAttribute("onclick", 'delete_message("'+msg.sms_number+'")')

          button.setAttribute('id', 'delete_button')

          button.setAttribute('class', "btn-secondary")

          newDiv.append(button);

          $( 'div.message_holder' ).append(newDiv);

          //dynamically sroll down the scrollbar for every new message
          $("#scrollable").scrollTop($("#scrollable")[0].scrollHeight);

        }

      });

      // delete message broadcasting all users
      socket.on('deletion', function(json) {
        
        var element = document.getElementById(json.sms_delition)

        element.remove()


      })