/* jshint esversion: 6, node: true */

const mailgun = require('mailgun.js');

class Mailer {
  constructor() {
    this.client  = "uninitialized";
    this.domain = "sandbox123@mailgun.org";
    this.sender = "noreply@example.com";
  }
  
  // construct email headers
  buildheaders(headers) {
    var tmpHeaders = this.headers;
    if (headers) tmpheaders += `;${headers}`;
    return tmpHeaders;
  }

  config(obj) {
    if (!obj) throw('Missing configuration object');
    if (!obj.key) throw('Missing Mailgun API key'); 
    if (!obj.username) throw('Missing Mailgun username'); 

    if (!obj.domain) {
      console.warn(`No domain specified. using ${this.domain}`);
    } else { 
      this.domain = obj.domain;
      // remove obj to prevent side effects in the mailgun client
      delete obj.domain;
    }
    
    if (!obj.sender) {
      console.warn(`No sender specified. using ${this.sender}`);
    } else { 
      this.sender = obj.sender;
      // remove obj to prevent side effects in the mailgun client
      delete obj.sender;
    }

    this.client = mailgun.client(obj);
  }

  send(data, callback) {
    if (this.client === "uninitialized") throw("mailgun client hasn't been configured yet! run .config()");
    var payload = _parse(data);

    this.client.messages.create(payload)
      .then(msg => callback(undefined, msg))
      .catch(err => callback(err));
  }

  _parse(data) {
    data.domain = data.domain || this.domain;
    return data;
  }
}

module.exports = new Mailer();
