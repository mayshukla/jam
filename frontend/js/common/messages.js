export class Message {
  constructor(type, body) {
    this.type = type;
    this.body = body;
  }

  toJSON() {
    let result = {
      "type": this.type,
      "body": this.body
    };
    return JSON.stringify(result);
  }

  static fromJSON(text) {
    let object = JSON.parse(text);
    if (object.type === "fullText") {
      return new FullTextMessage(object.body);
    } else if (object.type == "diff") {
      return new DiffMessage(object.body);
    } else {
      console.error("Unrecognized 'type' when parsing JSON message:",
		    object.type);
      return null;
    }
  }
}

export class FullTextMessage extends Message {
  constructor(text) {
    let type = "fullText";
    super(type, text); 
  }

  get text() {
    return this.body;
  }
}

export class DiffMessage extends Message {
  constructor(diff) {
    let type = "diff";
    super(type, diff);
  }

  get diff() {
    return this.body;
  }
}
