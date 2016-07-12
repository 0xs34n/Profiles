var mongoose = require("mongoose");
mongoose.connect('mongodb://localhost:27017/demoDb');
var bcrypt = require("bcrypt");
var SALT_WORK_FACTOR = 10;
var Schema = mongoose.Schema;

var userSchema = new Schema({
    "username": { type: String, required: true, index: { unique: true } },
    "display": { type: String, required: true, default: "user" },
    "description": { type: String, maxlength: 500, default: "" },
    "password": { type: String, required: true },
    "privelage": { type: Number, required: true, default: 0},
    "image": { type: String, default: "http://www.gravatar.com/avatar/00000000000000000000000000000000"},
    "behavior": {
    	"height": {type: Number, default: 0},
    	"width": {type: Number, default: 0},
    	"mostViewed": {type: String, default: ""},
    	"ip": {type: String, default: ""},
    	"os": {type: String, default: ""},
    	"location": {type: String, default: ""}
    }
});

userSchema.pre('save', function(next) {
    var user = this;
	// only hash the password if it has been modified (or is new)
	if (!user.isModified('password')) return next();

	// generate a salt
	bcrypt.genSalt(SALT_WORK_FACTOR, function(err, salt) {
	    if (err) return next(err);

	    // hash the password using our new salt
	    bcrypt.hash(user.password, salt, function(err, hash) {
	        if (err) return next(err);

	        // override the cleartext password with the hashed one
	        user.password = hash;
	        next();
	    });
	});


});

// Compare passwords method
userSchema.methods.comparePassword = function(candidatePassword, cb) {
    bcrypt.compare(candidatePassword, this.password, function(err, isMatch) {
        if (err) return cb(err);
        cb(null, isMatch);
    });
};

module.exports = mongoose.model('user',userSchema);;
