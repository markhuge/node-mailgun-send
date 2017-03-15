/* jshint esversion: 6, node: true */

const mailgun = require('mailgun.js');

class Mailer {
  constructor() {
    this.client  = "uninitialized";
    this.domain = "";
    this.sender = "noreply@example.com";
    this.username = "api";
    this.body = undefined ;
    this.subject = "";
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
    if (!obj.domain) throw('Missing domain');

    if (!obj.username) obj.username = this.username;

    // Add default body
    if (obj.body) {
      this.body = obj.body;
      delete obj.body;
    }

    // Add default subject
    if (obj.subject) {
      this.subject = obj.subject;
      delete obj.subject;
    }

    if (!obj.sender) {
      console.warn(`No sender specified. using ${this.sender}`);
    } else { 
      this.sender = obj.sender;
      // remove obj to prevent side effects in the mailgun client
      delete obj.sender;
    }

    this.domain = obj.domain;
    this.client = mailgun.client(obj);
  }

  send(data, callback) {
    if (this.client === "uninitialized") throw("mailgun client hasn't been configured yet! run .config()");
    //var payload = data
    var payload = this.parse(data);

    this.client.messages.create(this.domain, payload)
      .then(msg => callback(undefined, msg))
      .catch(err => callback(err));
  }

  parse(data) {
    data.domain = data.domain || this.domain;

    // map 'sender' -> 'from' for backwards compatibility
    data.from = data.sender || data.from || this.sender;
    delete data.sender;

    // map 'recipient' -> 'to' for backwards compatibility
    if (!data.recipient) throw('Missing recipient');
    if (data.recipient instanceof Array) data.to = data.recipient;
    else { 
      data.to = [ data.recipient ];
      delete data.recipient;
    }

    if (!data.body && !this.body) throw("No message body");
    var body = data.body || this.body;
    delete data.body;
    
    // detect content type
    // TODO this should be its own method
    var isHTML = function(str) { return /<[a-z][\s\S]*>/i.test(str); };
    if (isHTML(body)) data.html = body;
    else data.text = body;

    data.subject = data.subject || this.subject;

    return data;
  }
}
module.exports = new Mailer();
