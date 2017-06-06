module.exports = async function email(job) {
  try {
    let options = job.attrs.data;
    log.debug('going to send email with options', options);
    await Services.Email.renderAndSend(options);
    log.debug('finish sending email with options', options);
  } catch (err) {
    log.error(err);
  }
};
