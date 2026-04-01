/**
 * The 4 Components of the Adapter Pattern
To make this work, we need four distinct players:

The Client: This is your existing backend code. It has a specific way it likes to do things and refuses to change.

The Target (Interface): This is the blueprint that your Client understands and expects to interact with.

The Adaptee: This is the new, incompatible third-party class or API. It has the functionality you want, but its method names or data formats are completely wrong for your system.

The Adapter: The hero of the story. This is a wrapper class you write. It strictly follows the Target blueprint so your Client trusts it, but internally, it translates those calls into a format the Adaptee understands.
 */

// target or interface
class LegacyPaymentProcessor{

    payInXml(xmlData){
        console.log(`Processing XML payment: ${xmlData}`);
    }
}

// adaptee or service
class ModernStripeApi{
    makePayment(jsonData){
        console.log(`Stripe processing json payment: ${JSON.stringify(jsonData)}`);
    }
}

// adapter
class StripeAdapter extends LegacyPaymentProcessor{
    constructor(){
        super();
        this.stripeApi=new ModernStripeApi();
    };

    payInXml(xmlData){
        console.log("Adapter: Intercepting XML data and converting to JSON...");

        const convertedJsonData = {
            amount: 150,
            customer: "John Doe"
        };

        this.stripeApi.makePayment(convertedJsonData);
    }
}

// client
function checkoutSystem(paymentProcessor, cartDataXml){

    paymentProcessor.payInXml(cartDataXml);
}

// execution
console.log("--- USING THE OLD SYSTEM ---");
const oldGateway=new LegacyPaymentProcessor();
checkoutSystem(oldGateway, "<payment>150</payment>");

console.log("\n--- USING THE NEW SYSTEM VIA ADAPTER ---");
const newStripeAdapter=new StripeAdapter();
checkoutSystem(newStripeAdapter,"<payment>150</payment>");