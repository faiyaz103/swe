// abstract product
class Vehicle{
    // abstract class conversion
    constructor(){
        if(new.target==Vehicle){
            throw new TypeError('Can not construct vehicle instances directly');
        }
    };

    printVehicle(){
        throw new Error(`Must override method 'printVehicle()'`);
    }
}

// concrete products
class TwoWheeler extends Vehicle{
    printVehicle(){
        console.log('2 WHEELER');
    }
}

class FourWheeler extends Vehicle{
    printVehicle(){
        console.log('4 WHEELER');
    }
}

// abstract factory
class VehicleFactory{
    createVehicle(){
        throw new Error("Method not implemented");
    }
}

// concrete factories
class TwoWheelerFactory extends VehicleFactory{
    createVehicle(){
        return new TwoWheeler();
    }
}

class FourWheelerFactory extends VehicleFactory{
    createVehicle(){
        return new FourWheeler();
    }
}

// client
class Client{
    constructor(factory){
        this.pVehicle=factory.createVehicle();
    };

    getVehicle(){
        return this.pVehicle;
    }
}

// driver code
function main(){
    const twoWheelerFactory=new TwoWheelerFactory();
    const twoWheelerClient=new Client(twoWheelerFactory);
    const twoWheeler=twoWheelerClient.getVehicle();
    twoWheeler.printVehicle();
}

main();


