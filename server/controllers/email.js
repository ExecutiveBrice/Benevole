'use strict';
var nodemailer = require('nodemailer');
var transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'alod.section.fete@gmail.com',
    pass: 'ngzxgjexnulwvqgq'
  }
});

var mailOptions = {
  from: 'ALOD Ouche Dinier',
  to: 'Adresse mail',
  subject: 'Sujet du mail',
  text: 'Corps du mail'
};

process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
var Croisement = require('../models').Croisement;
var Creneau = require('../models').Creneau;
var Stand = require('../models').Stand;
var Benevole = require('../models').Benevole;
var Config = require('../models').Config;

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

        var text1 = Config.findOne({ where: { param: ("rappel1") } })
          .then(function (param) {
            console.log("getParam - 2")
            console.log(param)
            if (!param) {
              return null
            }
            return param
          }).catch(function (error) {
            console.log(error.toString());
            return null;
          });


        var text2 = Config.findOne({ where: { param: ("rappel2") } })
          .then(function (param) {
            console.log("getParam - 2")
            console.log(param)
            if (!param) {
              return null
            }
            return param
          }).catch(function (error) {
            console.log(error.toString());
            return null;
          });
        benevoles.forEach(benevole => {
          var text = text1
          if (benevole.Croisements) {
            console.log('benevole.Croisement');
            benevole.Croisements.forEach(croisement => {
              text = text + croisement.Stand.nom + " - " + croisement.Creneau.plage + "\n"
            })
          }
          text = text + benevole.gateaux + "\n"
          text = text + text2
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