// Member schema

var mongoose = require('mongoose')
  , Schema = mongoose.Schema

var MemberSchema = new Schema({
    name: {type : String, default : '', trim : true}
  , phoneNumber: {type : String, default : '', trim : true}
  , user: {type : Schema.ObjectId, ref : 'User'}
	, validated: {type: Boolean, default: false}
  , createdAt  : {type : Date, default : Date.now}
})

MemberSchema.path('name').validate(function (name) {
  return name.length > 0
}, 'Member name cannot be blank')




mongoose.model('Member', MemberSchema)
