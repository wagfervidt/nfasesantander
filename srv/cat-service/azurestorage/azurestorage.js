const { BaseRequestPolicy } = require("@azure/storage-blob");

// Create a policy factory with create() method provided
class RequestIDPolicyFactory {
  // Constructor to accept parameters
  constructor(prefix) {
    this.prefix = prefix;
  }

  // create() method needs to create a new RequestIDPolicy object
  create(nextPolicy, options) {
    return new RequestIDPolicy(nextPolicy, options, this.prefix);
  }
}

// Create a policy by extending from BaseRequestPolicy
class RequestIDPolicy extends BaseRequestPolicy {
  constructor(nextPolicy, options, prefix) {
    super(nextPolicy, options);
    this.prefix = prefix;
  }
  // Customize HTTP requests and responses by overriding sendRequest
  // Parameter request is WebResource type
  async sendRequest(request) {
    // Customize client request ID header
    request.headers.set(
      "x-ms-version",
      `2020-02-10`
    );

    // response is HttpOperationResponse type
    const response = await this._nextPolicy.sendRequest(request);

    // Modify response here if needed

    return response;
  }
}
//chamada:
 //const FileBinaryString = BinaryToString(String.fromCharCode.apply(null, Array.prototype.slice.apply(new Uint8Array(fileBuffer.buffer))));
function BinaryToString(binary) {
  var error;

  try {
    return decodeURIComponent(escape(binary));
  } catch (_error) {
    error = _error;
    if (error instanceof URIError) {
      return binary;
    } else {
      throw error;
    }
  }
}

// A helper function used to read a Node.js readable stream into a string
async function streamToString(readableStream) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    readableStream.on("data", (data) => {
      chunks.push(data.toString(''));
    });
    readableStream.on("end", () => {
      resolve(chunks.join(""));
    });
    readableStream.on("error", reject);
  });
}

// A helper function used to read a Node.js readable stream into a string
async function streamToHex(readableStream) {
  return new Promise((resolve, reject) => {
    let fileBuffer = Buffer.from([]);

    readableStream.on("data", (data) => {
      fileBuffer = Buffer.concat([fileBuffer, data], fileBuffer.length + data.length);
     
    });
    readableStream.on("end", () => {
      resolve(fileBuffer.toString('hex'));
    });
    readableStream.on("error", reject);
  });
}

// A helper function used to read a Node.js readable stream into a string
async function streamToBinary(readableStream) {
  return new Promise((resolve, reject) => {
    let fileBuffer = Buffer.from([]);
  
    readableStream.on("data", (data) => {
      fileBuffer = Buffer.concat([fileBuffer, data], fileBuffer.length + data.length);
    });
    readableStream.on("end", () => {
     resolve(fileBuffer.buffer);
    });
    readableStream.on("error", reject);
  });
}

// A helper function used to read a Node.js readable stream into a buffer
async function streamToBuffer(readableStream) {
  return new Promise((resolve, reject) => {
    let fileBuffer = Buffer.from([]);
  
    readableStream.on("data", (data) => {
      fileBuffer = Buffer.concat([fileBuffer, data], fileBuffer.length + data.length);
    });
    readableStream.on("end", () => {
     resolve(fileBuffer);
    });
    readableStream.on("error", reject);
  });
}

module.exports = {
  RequestIDPolicyFactory: RequestIDPolicyFactory,
  streamToBuffer: streamToBuffer,
  streamToString: streamToString,
  streamToBinary: streamToBinary,
  streamToHex: streamToHex
};
