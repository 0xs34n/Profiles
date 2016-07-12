var express     =   require("express");
var app         =   express();
var bodyParser  =   require("body-parser");
var mongoOp     =   require("./models/mongo");
var router      =   express.Router();
var path        =   require('path');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({"extended" : false}));

// Create Admin and Super Admin if does not exist

var db = new mongoOp();
db.username = "admin@admin.com";
db.password = "admin";
db.display = "Teaching Assistant";
db.privelage = 1;
db.save();

var db = new mongoOp();
db.username = "superadmin@admin.com";
db.password = "superadmin";
db.display = "Professor";
db.privelage = 2;
db.save();


router.get("/AvenirNext-Bold.eot",function(req,res){
    console.log("Serving FONTS EOT");
    res.sendFile(path.join(__dirname + '/fonts/AvenirNext-Bold.eot'));
});

router.get("/AvenirNext-Bold.woff",function(req,res){
    console.log("Serving FONTS WOFF");
    res.sendFile(path.join(__dirname + '/fonts/AvenirNext-Bold.woff'));
});

router.get("/AvenirNext-Bold.ttf",function(req,res){
    console.log("Serving FONTS TTF");
    res.sendFile(path.join(__dirname + '/fonts/AvenirNext-Bold.ttf'));
});

router.get("/",function(req,res){
    console.log("Serving home page");
    res.sendFile(path.join(__dirname + '/views/index.html'));
});

router.get("/index.html",function(req,res){
    console.log("Serving home page");
    res.sendFile(path.join(__dirname + '/views/index.html'));
});

router.get("/style.css",function(req,res){
    console.log("Serving styles");
    res.sendFile(path.join(__dirname + '/views/style.css'));
});

router.get("/ajax.js",function(req,res){
    console.log("Serving ajax calls");
    res.sendFile(path.join(__dirname + '/views/ajax.js'));
});

router.get("/login.html",function(req,res){
    console.log("Serving login page");
    res.sendFile(path.join(__dirname + '/views/login.html'));
});

router.get("/register.html",function(req,res){
    console.log("Serving register page");
    res.sendFile(path.join(__dirname + '/views/register.html'));
});

router.get("/system.html",function(req,res){
    console.log("Serving profile system page");
    res.sendFile(path.join(__dirname + '/views/system.html'));
});

router.get("/view_user.html",function(req,res){
    console.log("Serving user view page");
    res.sendFile(path.join(__dirname + '/views/view_user.html'));
});

router.get("/edit_user.html",function(req,res){
    console.log("Serving user view page");
    res.sendFile(path.join(__dirname + '/views/edit_user.html'));
});


router.route("/users")
    .get(function(req,res){
        mongoOp.find({},function(err,data){ // Change this to only members and do not show admins ---------------
            if(err) {
                res.send(err.Message);
            } else {
                res.json(data);
            }
        });
    })
    .post(function(req,res){
        var db = new mongoOp();
        db.username = req.body.username;
        db.password = req.body.password;
        db.display = req.body.display;
        db.save(function(err){
            if(err) {
                res.send(err.message);

            } else {
                res.json(db);
            }
        });
    });

router.route("/users/:username/:password?") // Get user by username and/or password
    .get(function(req,res){
        mongoOp.findOne({"username": req.params.username},function(err, user){
            if(err) {
                res.send(err.message);
            } else if (user == null) {
                res.send("Username does not exist!"); // 
            } else {
                user.comparePassword(req.params.password, function(err, isMatch) {
                    console.log(req.params.password);
                    if (err) {
                        res.send(err.message);
                    } else if (isMatch) {
                        res.json(user)
                    } else {
                        res.send("Incorrect password!");
                    }
                });
            }
        });
    })
    .put(function(req,res){
        mongoOp.findOne({"username": req.params.username}, function(err,data){
            if(err) {
                res.send(err.message);
            } else {


                data.comparePassword(req.body.oldPassword, function(err, isMatch) {
                    if (err) {
                        res.send(err.message);
                    } else if (isMatch || req.body.admin || req.body.newPassword == "") { // If there is a new password it must match

                        if(req.body.newPassword !== "") {
                            data.password = req.body.newPassword;
                        }

                        if(req.body.display !== "") {
                            data.display = req.body.display;
                        }

                        if (req.body.image !== "") {
                            data.image = req.body.image;
                        }

                        if (req.body.description !== "") {
                            data.description = req.body.description;
                        }

                        if (req.body.privelage !== "") {
                            data.privelage = req.body.privelage;
                        }

                        if (req.body.behavior !== "") {
                            data.behavior = req.body.behavior
                        }

                        data.save(function(err){
                            if(err) {
                                res.send(err.message);
                            } else {
                                res.json(data);
                            }
                        });

                    } else {
                        res.send("Incorrect password!")
                    } 
                });


            }
        });
    })
    .delete(function(req,res){
        mongoOp.findOne({"username": req.params.username}, function(err,data){
            if(err) {
                res.send(err.message);
            } else {
                mongoOp.remove({username : req.params.username},function(err){
                    if(err) {
                        res.json("Error deleting data");
                    } else {
                        res.send("Delete successful for " + req.params.username);
                    }
                });
            }
        });
    });

app.use('/',router);

app.listen(3000);
console.log("Listening to PORT 3000");
