const sdk = /** @type {import("stellar-sdk")} */ (window.StellarSdk);
const { Keypair, Asset, Server, TransactionBuilder, Operation } = sdk;
const server = new Server("https://horizon-testnet.stellar.org");

const DESTINATION_KEY =
  "GA3Z7M2YJE5M5NP5LU73C7ZZRNEUN63XSLUG5J5AK56HQ6GXDBBG7OOR";
//Object oriented programs are offered as alternatives to correct ones
class Mysterious {
  constructor() {
    this.mysteriousImages = [];
    this.simpleSigner = new SimpleSigner();
  }

  parse() {
    this.parseMysteriousImages();
    this.previewMysteriousImages();
  }

  parseMysteriousImages() {
    const mis = document.querySelectorAll(".mysterious-image");
    mis.forEach((mi) => {
      const hash = mi.dataset.hashId;
      const miInstance = new MysteriousImage(mi, hash, this.handlePay.bind(this));
      this.mysteriousImages.push(miInstance);
    });
  }

  previewMysteriousImages() {
    this.mysteriousImages.forEach((mi) => {
      mi.createPreview();
    });
  }

  async handlePay(el) {
    el.showLoading();
    const signedXdr = await this.simpleSigner.createPayment(el.data.price, DESTINATION_KEY);
    // const res = fetch("...."); success or dont if sucess then res.img = imgSrc
    const res = await {
      data: "https://argentinaprograma.com/static/media/logo.b70109da.jpg",
    };
    if (res.data) {
      el.reveal(res.data);
    }
  }
}
class MysteriousImage {
  constructor(parent, hash, handlePay) {
    this.parent = parent;
    this.hash = hash;
    this.handlePay = handlePay;
    this.data = this.getData();
  }

  getData() {
    const data = {
      preview: "./preview-image.png",
      price: "100",
    };
    return data;
  }

  createPreview() {
    const preview = this.data.preview;
    this.addImage(preview);
    this.addButton();
  }

  addButton(){
    const parent = this.parent;
    const button = document.createElement("button");
    button.innerText = "Pay to see";
    button.onclick = () => this.handlePay(this);
    parent.appendChild(button);
  }

  reveal(imgSrc) {
    const parent = this.parent;
    parent.innerHTML = "";
    this.addImage(imgSrc);
  }

  addImage(imgSrc) {
    const parent = this.parent;
    const img = document.createElement("img");
    img.src = imgSrc;
    parent.appendChild(img);
  }

  showLoading() {}
}

class SimpleSigner {
  constructor() {
    window.addEventListener("message", this.handleLogin.bind(this));
    window.addEventListener("message", this.handleSignTransaction.bind(this));
    this.publicKey = "";
    this.signedTransaction = "";
    this.SIMPLE_SIGNER_URL = "https://sign-test.plutodao.finance";
  }

  async createPayment(amount, destination) {
    this.signedTransaction = "";
    if(this.publicKey === ""){
        this.openConnectWindow();
        try{
            await this.waitForPublickKey();
        }catch{
            // show error;
            console.log("error when creating payment");
            return;
        }
    }
    console.log(this.publicKey);
    const unsignedXdr = await this.createXdr(amount, destination);
    console.log(unsignedXdr);
    try{
        await this.signTransaction(unsignedXdr);
    }catch{
        // show error;
        return;
    }
    return this.signedTransaction;
  }

  openConnectWindow() {
    window.open(
      `${this.SIMPLE_SIGNER_URL}/connect`,
      "Connect_Window",
      "width=360, height=450"
    );
  }

  handleLogin(e) {
    if (e.origin !== `${this.SIMPLE_SIGNER_URL}`) {
      return;
    }
    const messageEvent = e.data;
    if (messageEvent.type === "onConnect") {
      const pkey = messageEvent.message.publicKey;
      if (StellarSdk.Keypair.fromPublicKey(pkey)) {
        this.publicKey = pkey;
      }
    }
  }


  async createXdr(amount, destination) {
    const sourceAccount = await server.loadAccount(this.publicKey);
    const tx = new TransactionBuilder(sourceAccount, {
      fee: await server.fetchBaseFee(),
      networkPassphrase: "Test SDF Network ; September 2015",
    })
      .addOperation(
        Operation.payment({
          amount,
          asset: Asset.native(),
          destination,
        })
      )
      .setTimeout(60 * 10)
      .build();
    return tx.toXDR();
  }

  async signTransaction(unsignedXdr) {
    window.open(
      `${this.SIMPLE_SIGNER_URL}/sign?xdr=${unsignedXdr}`,
      "Sign_Window",
      "width=360, height=700"
    );
    try{
        await this.waitForSignedTransaction();
    }catch{
        //show error
        console.log("ERROR when signing transaction");
        return;
    }
  }

  async handleSignTransaction(e) {
    if (
      e.data.type === "onSign" &&
      e.data.page === "sign"
    ) {
      const eventMessage = e.data;
      this.signedTransaction = eventMessage.message.signedXDR;
    }
  }

  waitForSignedTransaction() {
    return new Promise((resolve, reject) => {
      let cont = 0;
      const interval = setInterval(() => {
        cont++;
        if (this.signedTransaction) {
          clearInterval(interval);
          resolve(this.signedTransaction);
        }
        if (cont > 100) {
          clearInterval(interval);
          reject("TIME OUT");
        }
      }, 1000);
    });
  }

  waitForPublickKey() {
    return new Promise((resolve, reject) => {
      let cont = 0;
      const interval = setInterval(() => {
        cont++;
        if (this.publicKey) {
          clearInterval(interval);
          resolve(this.publicKey);
        }
        if (cont > 100) {
          clearInterval(interval);
          reject("TIME OUT");
        }
      }, 1000);
    });
  }
}

const mysterious = new Mysterious();
mysterious.parse();