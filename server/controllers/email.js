'use strict';
var nodemailer = require('nodemailer');
var transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'bryce.morel@gmail.com',
    pass: 'xcpsfsejnwtqavoy'
  }
});

var mailOptions = {
  from: 'olive&Mirabelle',
  to: 'brice_morel@hotmail.com',
  subject: 'Sujet du mail',
  text: 'Corps du mail'
};

process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

module.exports = {
  sendMail: function add(req, res) {
    console.log("sendMail")
    mailOptions.to = req.body.to
    mailOptions.subject = req.body.subject
    mailOptions.text = req.body.text
    return transporter.sendMail(mailOptions, function (error, info) {
      console.log('Email sent!');
      return res.status(200).json({
        message: "Email sent",
        obj: mailOptions
      });
    });
  }
};