const path = require('path');
const nodemailer = require('nodemailer');
const promisify = require('es6-promisify');
const EmailTemplate = require('email-templates').EmailTemplate;
var mg = require('nodemailer-mailgun-transport');
const templatesDir = path.resolve(__dirname, '..', 'assets/templates/emails');
const mailgunConf = nconf.get('credentials:mailgun');
const mailgunAuth = {
  auth: {
    api_key: mailgunConf.apiKey,
    domain: mailgunConf.domain
  }
};

var nodemailerMailgun = nodemailer.createTransport(mg(mailgunAuth));

const EmailService = {
  async send(from, to, cc = null, subject, content) {
    var data = {
      from: from,
      to: to,
      subject: subject,
      html: content.html,
    };
    if (cc) data.cc = cc;
    if (content.text) data.text = content.text;
    const sendMail = promisify(nodemailerMailgun.sendMail, nodemailerMailgun);
    await sendMail(data);
  },

  async renderTemplate(templatePath, locals = {}) {
    let tplPath = path.join(templatesDir, templatePath || 'default');
    let template = new EmailTemplate(tplPath);
    const render = promisify(template.render, template);
    return await render(locals);
  },

  async renderAndSend(options) {
    let content = await this.renderTemplate(options.template, options.locals);
    await this.send(options.from, options.to, options.cc, options.subject, content);
  }

};

module.exports = EmailService;
