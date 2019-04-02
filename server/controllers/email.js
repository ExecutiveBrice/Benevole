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
var Croisement = require('../models').Croisement;
var Creneau = require('../models').Creneau;
var Stand = require('../models').Stand;
var Benevole = require('../models').Benevole;


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
  },
  rappel: function rappel(req, res) {

    console.log("sendRappel")

    return Benevole.findAll({
      include: [
        {
          model: Croisement,
          include: [
            { model: Creneau },
            { model: Stand }
          ]
        }
      ]
    })
      .then(function (benevoles) {
        console.log("sendRappel - 2")
        console.log(benevoles)
        mailOptions.subject = req.body.subject

        benevoles.forEach(benevole => {
          var text = req.body.text

          benevole.Croisement.forEach(croisement => {
          text = text +   croisement.Stand.nom + " - " + croisement.Creneau.plage + "\n"
          })
          mailOptions.text = text
          mailOptions.to = benevole.email


        transporter.sendMail(mailOptions, function (error, info) {
            console.log('Email sent!');

          });

        });
        return res.status(200).json({
          message: "Emails sent",
          obj: benevoles
        });
      })


  }




};