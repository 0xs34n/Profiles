// GLOBAL VARIABLES - STORE CURRENT USER TO FRONT END FOR DOM MANIPULATION
var current_user;
var mostViewed = {
  home: 0,
  login: 0,
  register: 0,
  edit: 0,
  system: 0,
  view: 0
};



function loadHome() {
   $( ".navbar" ).load( "/index.html .container-fluid" );
   $( "#content" ).load( "/index.html .jumbotron" );
   console.log("loading jumbotron");
   mostViewed.home++;
}

function loadLogin() {
  console.log("loading login snippet");
  $( "#content" ).load( "/login.html" );
  mostViewed.login++;
};

function loadRegister() {
  console.log("loading register snippet");
  $( "#content" ).load( "/register.html" );
  mostViewed.register++;
};

function loadEditProfile() {
  mostViewed.edit++;
  var editEmail = $('#profile-email').text();

  $( "#content" ).load( "/edit_user.html", function () {
    $('#editUsername').prepend(editEmail);
  });
};

function loadSystem() { 
  console.log("loading profle system snippet");

  mostViewed.system++;
  // Remove original nav
  $("#user-nav").empty();
  $("#logout-nav").empty();  

  $( "#content" ).load( "/system.html", function () {

    // Change navigation
    $(".navbar-brand").attr("onclick","loadSystem()"); 
    $("#user-header").prepend("Welcome " + current_user.display); 
    $("#user-nav").prepend(current_user.display); 
    $("#user-nav").attr("onclick",'loadUserView(\'' + current_user.username + '\')');
    $('#nav-img').attr("src", current_user.image + "?s=50");
    $('#nav-img').attr("onclick",'loadUserView(\'' + current_user.username + '\')');
    $('#logout-nav').append("<a class='glyphicon glyphicon-log-out' onclick='logout()' style='cursor:pointer;' aria-hidden='true'>Logout</a>");


    // Load table
    $.ajax({
      url: '/users/',
      type: 'GET',
      success: function (data) {
        console.log(data);

        for (i = 0; i < data.length; i++) {
          count = i + 1;
          row = "<tr>" + 
                "<td>" + count.toString() + "</td>" + 
                "<td>" + "<img src=" + data[i].image + "?s=20" + "'></img>" + "</td>" + 
                '<td><a style="cursor:pointer" onclick="loadUserView(\'' + data[i].username + '\')">' + data[i].display + '</a></td>' + 
                "<td>" + data[i].username + "</td>" + 
                "</tr>"


          $("tbody").append(row);
        }

      },
      error: function (xhr, status, error) {
        console.log('Error: ' + error.message);
        $(".alert").remove();
        $(".container").prepend("<div class='alert alert-danger' role='alert'>" + error.message + "</div>");
      }
    });

  });
  return true;
}

function loadUserView(user_view) {
  mostViewed.view++; 
  console.log(current_user);
  console.log("selecting " + user_view);
  $( "#content" ).load( "/view_user.html", function () {
    $.ajax({
      url: '/users/',
      type: 'GET',
      success: function (data) {
        console.log(data);
        for (i = 0; i < data.length; i++) {

          if (data[i].username == user_view) {
            console.log("found the user!")
            $('#profile-img').attr("src", data[i].image + "?s=350"); 
            $('#profile-name').prepend(data[i].display);
            $('#profile-email').prepend(data[i].username);
            $('#profile-description').prepend("Description: " + data[i].description);

            if (current_user.username == data[i].username) { // Viewing your own profile
              console.log("You're viewing your own profile")
              $('#edit-user').prepend("&nbsp;&nbsp;&nbsp;edit"); 
            }

            else if (current_user.privelage == 1 && current_user.privelage > data[i].privelage) { // If current user is an admin
              $('#edit-user').prepend("&nbsp;&nbsp;&nbsp;edit");
              $('#admin-privelages').prepend("<a id='admin-delete' onclick='deleteUser()' class='btn btn-danger' role='button'>Delete</a>");
              $('#profile-height').prepend("Screen height: " + data[i].behavior.height);
              $('#profile-width').prepend("Screen width: " + data[i].behavior.width);
              $('#profile-mostViewed').prepend("Most viewed page: " + data[i].behavior.mostViewed);
              $('#profile-ip').prepend("IP: " + data[i].behavior.ip);
              $('#profile-os').prepend("Device: " + data[i].behavior.os);
              $('#profile-location').prepend("Location: " + data[i].behavior.location);
            } 

            else if (current_user.privelage == 2 && current_user.privelage > data[i].privelage) { // If current user is super admin
              $('#edit-user').prepend("&nbsp;&nbsp;&nbsp;edit");
              console.log(data[i].behavior);
              $('#admin-privelages').prepend("<a id='admin-delete' onclick='deleteUser()' class='btn btn-danger' role='button'>Delete</a>");
              $('#admin-privelages').append("<a id='make-admin' onclick='makeAdmin()' class='btn btn-success' role='button'>Make Admin</a>"); 
              $('#profile-height').prepend("Screen height: " + data[i].behavior.height);
              $('#profile-width').prepend("Screen width: " + data[i].behavior.width);
              $('#profile-mostViewed').prepend("Most viewed page: " + data[i].behavior.mostViewed);
              $('#profile-ip').prepend("IP: " + data[i].behavior.ip);
              $('#profile-os').prepend("Device: " + data[i].behavior.os);
              $('#profile-location').prepend("Location: " + data[i].behavior.location);
              if (data[i].privelage == 1) {
                $('#admin-privelages').append("<a id='revoke-admin' onclick='revokeAdmin()' class='btn btn-warning' role='button'>Revoke Admin</a>");
              }
            }
          }
        }
      },
      error: function (xhr, status, error) {
        console.log('Error: ' + error.message);
        $(".alert").remove();
        $(".container").prepend("<div class='alert alert-danger' role='alert'>" + error.message + "</div>");
      }
    });
  });
}


function register() {
  var registerData = $("#signupform").serializeArray();
  console.log(registerData);
  // Extract information from JSON
  var user = {
    "username": "",
    "display" : "",
    "password" : ""
  };
  for (i = 0; i < registerData.length; i++) {
    if(registerData[i].name == "email") {
      user.username = registerData[i].value;
    }
    if(registerData[i].name == "displayName") {
      user.display = registerData[i].value;
    }
    if(registerData[i].name == "password") {
      user.password = registerData[i].value;
    }
  }

  $.ajax({
    url: '/users/',
    type: 'POST',
    data: JSON.stringify(user),
    contentType: "application/json; charset=utf-8",
    success: function(data) {
      console.log(data);
      
      if (typeof data === 'string' || data instanceof String) {
        $(".alert").remove();
        $(".container").prepend("<div class='alert alert-danger' role='alert'>" + data + "</div>");
      } else {
        $( "#content" ).load( "/login.html", function () {
          $(".container").prepend("<div class='alert alert-success' role='alert'>Register successful for " + data.username + "!</div>");
        });
      }
    },
    error: function(xhr, status, error) {
      console.log('Error: ' + error.message);
      $(".alert").remove();
      $(".container").prepend("<div class='alert alert-danger' role='alert'>" + error.message + "</div>");
    },

  });
}

function login() {
  $.ajax({
    url: '/users/'+ $('#login-username').val() + "/" + $('#login-password').val(),
    type: 'GET',
    success: function (data) {
      console.log(data); 
      if (typeof data === 'string' || data instanceof String) {
        $(".alert").remove();
        $(".container").prepend("<div class='alert alert-danger' role='alert'>" + data + "</div>");
      } else {
        current_user = data // STORE CURRENT USER SESSION
        loadSystem();
      }

    },
    error: function (xhr, status, error) {
      console.log('Error: ' + error.message);
      $(".alert").remove();
      $(".container").prepend("<div class='alert alert-danger' role='alert'>" + error.message + "</div>");
    }
  });
}

function edit() {

  var edit = {
    "username": $('#editUsername').text(),
    "display": "",
    "image" : "",
    "description" : "",
    "oldPassword" : "",
    "newPassword" : "",
    "privelage" : "",
    "admin" : false,
    "behavior": ""
  }

  var editData = $("#editForm").serializeArray();
  console.log(editData);

  for (i = 0; i < editData.length; i++) {

    if(editData[i].name == "displayName") {
      edit.display = editData[i].value;
    }
    if(editData[i].name == "displayImage") {
      edit.image = editData[i].value;
    }
    if(editData[i].name == "description") {
      edit.description = editData[i].value;
    }
    if(editData[i].name == "oldPassword") {
      edit.oldPassword = editData[i].value;
    }
    if(editData[i].name == "password") {
      edit.newPassword = editData[i].value;
    }
    if(current_user.privelage > 0) {
      edit.admin = true;
    }
  }

  console.log(JSON.stringify(edit));

  $.ajax({
  url: '/users/' + $('#editUsername').text(),
  type: 'PUT',
  data: JSON.stringify(edit),
  contentType: "application/json; charset=utf-8",
  success: function(data) {
    console.log(data);

    if (typeof data === 'string' || data instanceof String) {
      $(".alert").remove();
      $(".container").prepend("<div class='alert alert-danger' role='alert'>" + data + "</div>");

    } else if(current_user.username == data.username) { // Editing your own profile

      current_user = data // STORE CURRENT USER SESSION
      $(".alert").remove();
      $(".container").prepend("<div class='alert alert-success' role='alert'>Update Successful</div>");

      $("#user-nav").empty(); 
      $("#user-nav").prepend(current_user.display); 
      $("#user-nav").attr("onclick",'loadUserView(\'' + current_user.username + '\')');
      $('#nav-img').attr("src", current_user.image + "?s=50");
      $('#nav-img').attr("onclick",'loadUserView(\'' + current_user.username + '\')'); 
    } else { // Admin editing
      $(".alert").remove();
      $(".container").prepend("<div class='alert alert-success' role='alert'>Update Successful</div>");
    }

  },
  error: function(xhr, status, error) {
    console.log('Error: ' + error.message);
    $(".alert").remove();
    $(".container").prepend("<div class='alert alert-danger' role='alert'>" + error.message + "</div>");
  },
});
};

function deleteUser() {
  $.ajax({
    url: '/users/' +  $('#profile-email').text(),
    type: 'DELETE',
    success: function(data) {
      loadSystem();
    },
    error: function(xhr, status, error) {
      console.log('Error: ' + error.message);
      $(".alert").remove();
      $(".container").prepend("<div class='alert alert-danger' role='alert'>" + error.message + "</div>");
    },
  });
};

function makeAdmin() {
  var edit = {
    "username": $('#profile-email').text(),
    "display": "",
    "image" : "",
    "description" : "",
    "oldPassword" : "",
    "newPassword" : "",
    "privelage" : 1,
    "admin" : true,
    "behavior": ""
  }

  console.log(edit);

  $.ajax({
    url: '/users/' + $('#profile-email').text(),
    type: 'PUT',
    data: JSON.stringify(edit),
    contentType: "application/json; charset=utf-8",
    success: function(data) {
      loadUserView($('#profile-email').text());
    },
    error: function(xhr, status, error) {
      console.log('Error: ' + error.message);
      $(".alert").remove();
      $(".container").prepend("<div class='alert alert-danger' role='alert'>" + error.message + "</div>");
    },
  });
}

function revokeAdmin() {
  var edit = {
    "username": $('#profile-email').text(),
    "display": "",
    "image" : "",
    "description" : "",
    "oldPassword" : "",
    "newPassword" : "",
    "privelage" : 0,
    "admin" : true,
    "behavior": ""
  }

  $.ajax({
    url: '/users/' + $('#profile-email').text(),
    type: 'PUT',
    data: JSON.stringify(edit),
    contentType: "application/json; charset=utf-8",
    success: function(data) {
      loadUserView($('#profile-email').text());
    },
    error: function(xhr, status, error) {
      console.log('Error: ' + error.message);
      $(".alert").remove();
      $(".container").prepend("<div class='alert alert-danger' role='alert'>" + error.message + "</div>");
    },
  });
}

function logout() {

  var page = "";
  var views = 0;

  for (e in mostViewed) {
    if (mostViewed[e] > views) {
      views = mostViewed[e];
      page = e; 
    }
  }
  var edit = {
    "username": $('#profile-email').text(),
    "display": "",
    "image" : "",
    "description" : "",
    "oldPassword" : "",
    "newPassword" : "",
    "privelage" : "",
    "admin" : true,
    "behavior": {
      "height": $(window).height(),
      "width": $(window).width(),
      "mostViewed": page,
      "ip": geoplugin_request(),
      "os": navigator.userAgent.toString(),
      "location": geoplugin_city()
    }
  }

  $.ajax({
    url: '/users/' + current_user.username,
    type: 'PUT',
    data: JSON.stringify(edit),
    contentType: "application/json; charset=utf-8",
    success: function(data) {
      // reset variables
      current_user = null;
      mostViewed = {
        home: 0,
        login: 0,
        register: 0,
        edit: 0,
        system: 0,
        view: 0
      };
      loadHome();
    },
    error: function(xhr, status, error) {
      console.log('Error: ' + error.message);
      $(".alert").remove();
      $(".container").prepend("<div class='alert alert-danger' role='alert'>" + error.message + "</div>");
    },
  });

}

